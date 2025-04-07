import { useEffect, useRef, useMemo, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import FullScreen from "ol/control/FullScreen";
import { defaults as defaultControls } from "ol/control/defaults";
import { ToastContainer, toast } from 'react-toastify';
import { Home, FlameKindling } from 'lucide-react';
import axios from "axios";

// OpenLayers imports for fire data
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Style, Circle, Fill } from "ol/style";
import Overlay from 'ol/Overlay';

import BasemapSwitcher from "./BasemapSwitcher.jsx";
import { getMapStateFromHash, updateMapStateInHash } from "../../utils/mapState.js";
import { DEFAULT_POSITION, KAZAKHSTAN_EXTENT } from "../../utils/mapConstants.js";
import { createBlanketLayer } from "../../utils/layers.js";
import { createContextMenu } from "../../utils/contextMenu.js";
import { handleFullScreenChange } from "../../utils/fullScreen.js";
import { osmLayer } from "../../utils/basemaps.js";
import { createGeocoder } from "../../utils/geocoder.js";
import { flyHome } from "../../utils/flyHome.js";

import "ol/ol.css";
import 'ol-geocoder/dist/ol-geocoder.min.css';
import 'react-toastify/dist/ReactToastify.css';
import styles from "./MapView.module.scss";
import './mapStyles.scss'
import MeasurementTools from "./MeasurementTools.jsx";

// TODO need to change because there's KAZAKHSTAN_EXTENT in mapConstants.js but they use different coordinate system
const kazakhstanBounds = {
  minLon: 46.4, 
  maxLon: 87.3,
  minLat: 42.5,
  maxLat: 56.0
};
const FIRMS_KEY = import.meta.env.VITE_FIRMS_KEY;

const MapView = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [basemap, setBasemap] = useState(osmLayer);
  const [isMapInitialized, setIsMapInitialized] = useState(false); // Track map initialization

  const [fireData, setFireData] = useState([]);
  const [showFireHotspots, setShowFireHotspots] = useState(false);
  const fireLayerRef = useRef(null);

  const blanket = useMemo(() => createBlanketLayer(), []);

  const fetchFireData = async () => {
    const searchDate = '2023-04-01';
    const dayRange = 7
    try {
      const response = await axios.get(
        `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${FIRMS_KEY}/MODIS_SP/KAZ/${dayRange}/${searchDate}`
      );

      // Parse CSV data
      // console.log(response.data.split('\n'))
      const lines = response.data.split('\n');
      const headers = lines[0].split(',');
      const firePoints = lines.slice(1).map(line => {
        const values = line.split(',');
        const latIndex = headers.indexOf('latitude');
        const lonIndex = headers.indexOf('longitude');
        const brightnessIndex = headers.indexOf('brightness');
        const acqDateIndex = headers.indexOf('acq_date');
        const acqTimeIndex = headers.indexOf('acq_time');
        const confidenceIndex = headers.indexOf('confidence');
        
        if (values.length >= headers.length) {
          return {
            longitude: parseFloat(values[lonIndex]),
            latitude: parseFloat(values[latIndex]),
            brightness: parseFloat(values[brightnessIndex]),
            acq_date: values[acqDateIndex],
            acq_time: values[acqTimeIndex],
            confidence: values[confidenceIndex]
          };
        }
        return null;
      }).filter(point => 
        point && 
        !isNaN(point.longitude) && 
        !isNaN(point.latitude) &&
        point.longitude >= kazakhstanBounds.minLon &&
        point.longitude <= kazakhstanBounds.maxLon &&
        point.latitude >= kazakhstanBounds.minLat &&
        point.latitude <= kazakhstanBounds.maxLat
      );

      setFireData(firePoints);
      return firePoints;
    } catch (error) {
      console.error('Error fetching fire data:', error);
      toast.error("Failed to fetch fire hotspot data");
      return [];
    }
  };
  
  // Function to create fire hotspots layer
  const createFireHotspotLayer = (firePoints) => {
    const vectorSource = new VectorSource();

    const features = firePoints.map(point => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([point.longitude, point.latitude])),
        fireData: point
      });

      // Style the feature based on brightness
      feature.setStyle(new Style({
        image: new Circle({
          radius: Math.min(point.brightness / 10, 6), // size based on brightness of fire
          fill: new Fill({
            color: `rgba(255, 0, 0, ${Math.min(point.brightness / 500, 0.8)})`
          })
        })
      }));

      return feature;
    });

    // Add features to vector source
    vectorSource.addFeatures(features);

    // Create vector layer
    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    return vectorLayer;
  };

  const toggleFireHotspots = async () => {
    if (!mapInstance.current) return;
  
    if (!showFireHotspots) {
      // Fetch and add fire data layer
      const firePoints = await fetchFireData();
      
      if (firePoints.length > 0) {
        const fireLayer = createFireHotspotLayer(firePoints);
        mapInstance.current.addLayer(fireLayer);
        fireLayerRef.current = fireLayer;
        setShowFireHotspots(true);
        
        toast.success(`Showing ${firePoints.length} fire hotspots`);
      } else {
        toast.info("No fire hotspots found in the selected area");
      }
    } else {
      // Remove fire data layer
      if (fireLayerRef.current) {
        mapInstance.current.removeLayer(fireLayerRef.current);
        fireLayerRef.current = null;
        setShowFireHotspots(false);
        toast.info("Fire hotspots hidden");
      }
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const { zoom, center, rotation } = getMapStateFromHash();

    const view = new View({
      center,
      zoom,
      rotation,
      extent: KAZAKHSTAN_EXTENT,
      showFullExtent: true,
    });

    const geocoder = createGeocoder();

    // Map initialization and settings
    const map = new Map({
      pixelRatio: window.devicePixelRatio || 1,
      loadTilesWhileInteracting: true,
      loadTilesWhileAnimating: true,
      moveTolerance: 5,
      target: mapRef.current,
      layers: [basemap, blanket],
      view,
      controls: defaultControls().extend([new FullScreen(), geocoder]),
    });
    mapInstance.current = map;

    const contextMenu = createContextMenu(map, view, DEFAULT_POSITION, styles);
    map.addControl(contextMenu);

    const fullscreenCleanUp = handleFullScreenChange(mapRef);

    let shouldUpdate = true;
    const updatePermalink = () => {
      if (!shouldUpdate) {
        shouldUpdate = true;
        return;
      }
      updateMapStateInHash(view);
    };

    map.on("moveend", () => {
      updateMapStateInHash(view);
    });

    const handlePopState = (event) => {
      if (event.state === null) return;
      view.setCenter(event.state.center);
      view.setZoom(event.state.zoom);
      view.setRotation(event.state.rotation);
      shouldUpdate = false;
    };
    
    window.addEventListener("popstate", handlePopState);

    setIsMapInitialized(true);

    return () => {
      map.setTarget(null);
      fullscreenCleanUp();
      window.removeEventListener("popstate", handlePopState);
      map.un('moveend', updatePermalink);
      setIsMapInitialized(false); // Reset initialization state
    };
  }, [basemap, blanket]);

  return (
    <div id="fullscreen" className={styles.fullscreen}>
      <div ref={mapRef} className={styles.map__container}>
        <ToastContainer />

        {/* Basemap Switcher */}
        <BasemapSwitcher 
          styles={styles} 
          currentBasemap={basemap} 
          onBasemapChange={setBasemap} 
        />

        {/* Home */}
        <div className={styles.goHome}>
          <button 
            className={styles.homeButton} 
            onClick={() => flyHome(mapInstance.current.getView())}
            aria-label="Go to home position"
          >
            <Home color="#4999E8" />
          </button>
        </div>

        {/* Measurement Tools */}
        {isMapInitialized && (
          <MeasurementTools map={mapInstance.current} />
        )}
      </div>

      {/* Fire Hotspots Toggle Button */}
      <div className={styles.fireControl}>
        <button 
          className={`${styles.fireButton} ${showFireHotspots ? styles.active : ''}`}
          onClick={toggleFireHotspots}
          aria-label="Toggle fire hotspots"
          title="Toggle fire hotspots"
        >
          <FlameKindling color={showFireHotspots ? "#ff3300" : "#4999E8"} />
        </button>
      </div>
    </div>
  );
};

export default MapView;