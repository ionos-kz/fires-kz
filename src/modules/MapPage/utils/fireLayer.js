import axios from "axios";
import Icon from 'ol/style/Icon.js';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { Heatmap as HeatmapLayer } from 'ol/layer';
import Cluster from 'ol/source/Cluster';
import { toast } from "react-toastify";

// format date as yyyy-mm-dd
const formatDate = (date) => date.toISOString().split('T')[0];

// Get today's date and 7 days ago
const today = new Date();
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const defaultDateStart = formatDate(sevenDaysAgo);
const defaultDateEnd = formatDate(today);

export const createFireLayer = () => {
  // Main vector source to hold all fire point features
  const source = new VectorSource();
  
  // cluster for medium zoom 
  const clusterSource = new Cluster({
    distance: 40,
    source: source,
    minDistance: 20
  });
  
  // Original point style with flame icon
  const pointStyle = new Style({
    image: new Icon({
      src: '/flame.png',
      scale: 0.5,
      size: [30, 30],
    }),
  });
  
  // heatmap for zoom levels (1-8)
  const heatmapLayer = new HeatmapLayer({
    source: source,
    blur: 10,
    radius: 5,
    weight: function(feature) {
      return 3;
    },
    gradient: ['rgba(0, 0, 255, 0.6)', 'rgba(0, 255, 255, 0.6)', 'rgba(0, 255, 0, 0.6)', 
               'rgba(255, 255, 0, 0.6)', 'rgba(255, 0, 0, 0.9)'],
    visible: false
  });
  
  // cluster for medium zoom levels (8-12)
  const clusterLayer = new VectorLayer({
    source: clusterSource,
    style: function(feature) {
      const size = feature.get('features').length;
      // circle radius based on cluster size
      let radius = Math.min(25, 12 + Math.log2(size) * 5);
      
      return new Style({
        image: new CircleStyle({
          radius: radius,
          fill: new Fill({
            color: 'rgba(255, 69, 0, 0.7)'
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff'
          }),
          font: 'bold 12px Arial'
        })
      });
    },
    visible: false
  });
  
  // point for high zoom (13+)
  const pointLayer = new VectorLayer({
    declutter: true,
    source: source,
    renderMode: "vector",
    style: pointStyle,
    properties: { id: "fireLayer" },
    visible: false
  });
  
  // Create a layer group object to manage the three layers
  const fireLayerGroup = {
    heatmapLayer,
    clusterLayer,
    pointLayer,
    
    // Function to load fire data with date range
    loadFireData: async (date1 = defaultDateStart, date2 = defaultDateEnd) => {
      try {
        source.clear();
        toast.info("🔥 Loading fire points...");
        
        const url = `https://api.igmass.kz/fire/firebetweendate?date1=${date1}&date2=${date2}`;
        const response = await axios.get(url);
        
        const format = new GeoJSON();
        const features = format.readFeatures(response.data, {
          featureProjection: "EPSG:3857",
        });
        
        source.addFeatures(features);
        
        // Set initial visibility based on zoom level
        if (fireLayerGroup._map) {
          const zoom = fireLayerGroup._map.getView().getZoom();
          fireLayerGroup.updateLayerVisibility(zoom);
        } else {
          // Default if no map is set yet
          heatmapLayer.setVisible(true);
          clusterLayer.setVisible(false);
          pointLayer.setVisible(false);
        }
        
        toast.success(`✅ Loaded ${features.length} fire point${features.length === 1 ? '' : 's'}`);
        return features.length;
      } catch (error) {
        console.error("🔥 Failed to fetch fire data:", error);
        toast.error("Failed to load fire data.");
        return 0;
      }
    },
    
    // Function to update layer visibility based on zoom level
    updateLayerVisibility: function(zoom) {
      if (zoom <= 8) {
        heatmapLayer.setVisible(true);
        clusterLayer.setVisible(false);
        pointLayer.setVisible(false);
      } else if (zoom > 8 && zoom <= 12) {
        heatmapLayer.setVisible(false);
        clusterLayer.setVisible(true);
        pointLayer.setVisible(false);
      } else {
        heatmapLayer.setVisible(false);
        clusterLayer.setVisible(false);
        pointLayer.setVisible(true);
      }
    },
    
    // Function to set visibility for all layers
    setVisible: function(visible) {
      if (fireLayerGroup._map && visible) {
        const zoom = fireLayerGroup._map.getView().getZoom();
        this.updateLayerVisibility(zoom);
      } else {
        heatmapLayer.setVisible(false);
        clusterLayer.setVisible(false);
        pointLayer.setVisible(false);
      }
      
      this._visible = visible;
    },
    
    // Function to get visibility state
    getVisible: function() {
      return this._visible;
    },
    
    attachToMap: function(map) {
      this._map = map;
      // zoom change listener
      if (map) {
        const view = map.getView();
        view.on('change:resolution', () => {
          if (this._visible) {
            const zoom = view.getZoom();
            this.updateLayerVisibility(zoom);
          }
        });
      }
    },
    
    getLayers: function() {
      return [heatmapLayer, clusterLayer, pointLayer];
    },
    
    _visible: false,
    _map: null
  };
  
  return fireLayerGroup;
};