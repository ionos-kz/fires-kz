import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { ToastContainer } from 'react-toastify';

import Map from "ol/Map";
import View from "ol/View";
import Overlay from 'ol/Overlay';
import FullScreen from "ol/control/FullScreen";
import { defaults as defaultControls } from "ol/control/defaults";
import TileLayer from 'ol/layer/Tile.js';
import XYZ from 'ol/source/XYZ.js';
import GeoTIFF from 'ol/source/GeoTIFF';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from "ol/style/Fill";
import Select from 'ol/interaction/Select';

import { Popover } from 'antd';
import { Home } from 'lucide-react';

import BasemapSwitcher from "./BasemapSwitcher.jsx";
import MeasurementTools from "./MeasurementTools.jsx";
import FirePopup from './FirePopup.jsx';
import usePopupManager from './PopupManager.jsx';

import { getMapStateFromHash, updateMapStateInHash } from "../utils/mapState.js";
import { DEFAULT_POSITION } from "../utils/mapConstants.js";
import { createAdminBoundary, createBlanketLayer } from "../utils/layers.js";
import { createFireLayer } from "../utils/fireLayer.js";
import { createContextMenu } from "../utils/contextMenu.js";
import { handleFullScreenChange } from "../utils/fullScreen.js";
import { osmLayer } from "../utils/basemaps.js";
import { createGeocoder } from "../utils/geocoder.js";
import { flyHome } from "../utils/flyHome.js";
import { styleFireModelFunction } from "../utils/colorFireModel.js";
import { createSentinelLayer } from "src/utils/sentinelUtils.js";

import useFireStore from "src/app/store/fireStore";
import useAdminBoundaryStore from "src/app/store/adminBoundaryStore.js";
import useSentinelStore from "../../../app/store/sentinelStore.js";
import useSentinel3Store from "../../../app/store/sentinel3Store.js";
import useSentinel5Store from "../../../app/store/sentinel5Store.js";
import useSentinel1Store from "../../../app/store/sentinel1Store.js";
import useMethaneStore from "src/app/store/methaneStore";
import useRiskMapStore from "../../../app/store/riskMapStore.js";
import useMapStore from "../../../app/store/mapStore.js";

import "ol/ol.css";
import 'ol-geocoder/dist/ol-geocoder.min.css';
import 'react-toastify/dist/ReactToastify.css';
import styles from "./MapView.module.scss";
import './mapStyles.scss';
import useFireModellingStore from "../../../app/store/fireModellingStore.js";

const MapView = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [basemap, setBasemap] = useState(osmLayer);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isLoadingFires, setIsLoadingFires] = useState(false);
  const { 
    fireLayerVisible, 
    setFireLength,
    fireStartDate,
    fireEndDate,
    dateHasChanged,
    updateFireStatistics,
    showTechnogenicOnly,
    setShowTechnogenicOnly,
    showNaturalOnly,
    setSelectedModel,
    selectedModel
   } = useFireStore();
  const { layerVisibility } = useAdminBoundaryStore();
  const { fireModelLayer } = useMapStore()

  const blanket = useMemo(() => createBlanketLayer(), []);
  const fireLayer = useMemo(() => createFireLayer(setFireLength, fireStartDate, fireEndDate, updateFireStatistics), [setFireLength]);
  
  const {
    popupRef,
    popupContent,
    closePopup,
    showPopup,
    setupPopupInteractions,
    isOverlayReady
  } = usePopupManager(mapInstance.current, fireLayer);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const {
    methaneYear,
    methaneLayerVisible,
    methaneOpacity,
    methaneFlumesVisible,
    emmitLayerVisible,
    emmitLayerIds,
    emitSn2LayerVisible,
    emitSn2Opacity,
    sandGeoVectorVisible,
    sandGeoTiffVisible
  } = useMethaneStore();

  const {
    sentinelVisible,
    sentinelOpacity,
    activeLayers,
    addActiveLayer,
    removeActiveLayer,
    setActiveLayers
  } = useSentinelStore();

  const {
    sentinel3Visible,
    sentinel3Opacity,
    activeLayers3,
    addActiveLayer3,
    removeActiveLayer3,
    setActiveLayers3
  } = useSentinel3Store();

  const {
    sentinel5Visible,
    sentinel5Opacity,
    activeLayers5,
    addActiveLayer5,
    removeActiveLayer5,
    setActiveLayers5
  } = useSentinel5Store();

  const {
    sentinel1Visible,
    sentinel1Opacity,
    activeLayers1,
    addActiveLayer1,
    removeActiveLayer1,
    setActiveLayers1
  } = useSentinel1Store();

  const [sentinelLayers, setSentinelLayers] = useState([]);
  const [sentinel3Layers, setSentinel3Layers] = useState([]);
  const [sentinel5Layers, setSentinel5Layers] = useState([]);
  const [sentinel1Layers, setSentinel1Layers] = useState([]);

  const riskDates = useRiskMapStore((state) => state.riskDates);
  let fireRiskLayers = useRef(null);

  useEffect(() => {
    const riskDatesFormatted = riskDates.map(item => 
      item.date.replace(/-/g, ".")
    );
    // console.log(riskDatesFormatted)
    fireRiskLayers.current = (riskDatesFormatted && riskDatesFormatted.length > 0)
      ? riskDatesFormatted.map(item => new TileLayer({
          source: new XYZ({
            url: `http://old.fires.kz/data/fire_haz/${item}/{z}/{x}/{-y}.png`
          }),
          visible: true
        }))
      : [];
    // console.log(fireRiskLayers.current)
  }, [riskDates])

  useEffect(() => {
    if (!mapInstance.current || !fireRiskLayers.current) return;
    
    const currentLayers = mapInstance.current.getLayers().getArray(); // removing existing risk layers
    currentLayers.forEach(layer => {
      if (layer.get('layerType') === 'fireRisk') {
        mapInstance.current.removeLayer(layer);
      }
    });
    
    fireRiskLayers.current.forEach(layer => {
      layer.set('layerType', 'fireRisk');
      mapInstance.current.addLayer(layer);
    });
  }, [riskDates, isMapInitialized]);

  const { 
    addFireModellingLayer, removeFireModellingLayer, fireModellingLayers, 
    setMapInstance,
   } = useFireModellingStore.getState();

  const sandGeoVectorLayer = new VectorLayer({
    source: new VectorSource({
      url: 'https://fires.kz/data/carbon_mapper_.geojson',
      format: new GeoJSON(),
    }),
    visible: sandGeoVectorVisible,
  })

  const tiffLayer = useMemo(() => {
    return new TileLayer({
      source: new XYZ({
        url: `https://fires.kz/data/ch4_tiles/${methaneYear}/{z}/{x}/{-y}.png`,
        projection: 'EPSG:3857',
        tileSize: [256, 256],
        maxZoom: 10,
        onError: function (error) {
          if (error.status !== 404) {
            console.error('Error loading Tiff XYZ tile:', error);
          } else {
            console.log(`Tile Tiff not found: ${error.url}`);
          }
        },
      }),
      opacity: methaneOpacity * 0.01,
      visible: methaneLayerVisible,
    });
  }, [methaneYear, methaneLayerVisible]);

  const sn2Layer = useMemo(() => {
    return new TileLayer({
      source: new XYZ({
        url: 'https://fires.kz/data/mbmp_final/{z}/{x}/{-y}.png',
        projection: 'EPSG:3857',
        tileSize: [256, 256],
        maxZoom: 14,
        onError: function (error) {
          if (error.status !== 404) {
            console.error('Error loading Tiff XYZ tile:', error);
          } else {
            console.log(`Tile Tiff not found: ${error.url}`);
          }
        },
      }),
      opacity: emitSn2Opacity * 0.01,
      visible: emitSn2LayerVisible
    });
  }, [emitSn2LayerVisible]);

  const emitLayer = useMemo(() => {
    if (emmitLayerIds.length === 0) return [];

    return emmitLayerIds.map((emit) => {
      return new TileLayer({
        source: new XYZ({
          url: `https://fires.kz/data/emit_tiles/${emit}/{z}/{x}/{-y}.png`,
          projection: 'EPSG:3857',
          tileSize: [256, 256],
          maxZoom: 14,
          onError: function (error) {
            if (error.status !== 404) {
              console.error('Error loading Emit XYZ tile:', error);
            } else {
              console.log(`Tile Emit not found: ${error.url}`);
            }
          },
        }),
        visible: emmitLayerVisible,
      });
    });
  }, [emmitLayerVisible, emmitLayerIds]);

  const emitJsonLayer = useMemo(() => {
    const source = new VectorSource({
      url: `/emit_json/emit_all.geojson`,
      projection: 'EPSG:3857',
      format: new GeoJSON(),
    });

    return new VectorLayer({
      source,
      style: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 5,
        }),
        fill: new Fill({
          color: "#fff",
        })
      }),
      visible: emmitLayerVisible
    });
  }, [emmitLayerVisible, emmitLayerIds])

  useEffect(() => {
    tiffLayer.setOpacity(methaneOpacity * 0.01);
  }, [methaneOpacity]);

  useEffect(() => {
    sn2Layer.setOpacity(emitSn2Opacity * 0.01);
  }, [emitSn2Opacity])

  useEffect(() => {
    // console.log('Active layers changed:', activeLayers);
    // console.log('Current sentinel layers:', sentinelLayers.length);
    
    const currentLayerIds = sentinelLayers.map(layer => layer.get('id'));
    const newLayers = activeLayers.filter(layerConfig => 
      !currentLayerIds.includes(layerConfig.id)
    );
    
    // console.log('New layers to add:', newLayers);
    
    newLayers.forEach(layerConfig => {
      if (!mapInstance.current) return;

      // console.log('Creating layer for:', layerConfig);
      
      const layer = createSentinelLayer(
        'sentinel2',
        layerConfig.id,
        layerConfig.bands,
        layerConfig.startDate,
        layerConfig.endDate,
        layerConfig.opacity
      );

      mapInstance.current.addLayer(layer);

      setSentinelLayers(prev => [...prev, layer]);
      // console.log(sentinelLayers)
      
      // console.log('Added Sentinel layer to map:', layerConfig);
    });
  }, [activeLayers]);

  useEffect(() => {
    console.log('Sentinel-3 active layers changed:', activeLayers3);
    console.log('Current Sentinel-3 layers:', sentinel3Layers.length);
    
    const currentLayer3Ids = sentinel3Layers.map(layer => layer.get('id'));
    const newLayers3 = activeLayers3.filter(layerConfig => 
      !currentLayer3Ids.includes(layerConfig.id)
    );
    
    console.log('New Sentinel-3 layers to add:', newLayers3);
    
    newLayers3.forEach(layerConfig => {
      if (!mapInstance.current) return;
      
      const layer = createSentinelLayer(
        'sentinel3',
        layerConfig.id,
        layerConfig.bands,
        layerConfig.startDate,
        layerConfig.endDate,
        layerConfig.opacity
      );

      if (layer) {
        mapInstance.current.addLayer(layer);
        setSentinel3Layers(prev => [...prev, layer]);
        console.log('Added Sentinel-3 layer to map:', layerConfig);
      }
    });
  }, [activeLayers3])

  useEffect(() => {
    console.log('Sentinel-5 active layers changed:', activeLayers3);
    console.log('Current Sentinel-5 layers:', sentinel3Layers.length);
    
    const currentLayer5Ids = sentinel5Layers.map(layer => layer.get('id'));
    const newLayers5 = activeLayers5.filter(layerConfig => 
      !currentLayer5Ids.includes(layerConfig.id)
    );
    
    console.log('New Sentinel-5 layers to add:', newLayers5);
    
    newLayers5.forEach(layerConfig => {
      if (!mapInstance.current) return;
      
      const layer = createSentinelLayer(
        'sentinel5',
        layerConfig.id,
        layerConfig.bands,
        layerConfig.startDate,
        layerConfig.endDate,
        layerConfig.opacity
      );

      if (layer) {
        mapInstance.current.addLayer(layer);
        setSentinel5Layers(prev => [...prev, layer]);
        console.log('Added Sentinel-5 layer to map:', layerConfig);
      }
    });
  }, [activeLayers5])

  useEffect(() => {
    // console.log('Sentinel-1 active layers changed:', activeLayers1);
    // console.log('Current Sentinel-1 layers:', sentinel1Layers.length);
    
    const currentLayer1Ids = sentinel1Layers.map(layer => layer.get('id'));
    const newLayers1 = activeLayers1.filter(layerConfig => 
      !currentLayer1Ids.includes(layerConfig.id)
    );
    
    // console.log('New Sentinel-1 layers to add:', newLayers1);
    
    newLayers1.forEach(layerConfig => {
      if (!mapInstance.current) return;
      
      const layer = createSentinelLayer(
        'sentinel1',
        layerConfig.id,
        layerConfig.bands,
        layerConfig.startDate,
        layerConfig.endDate,
        layerConfig.opacity
      );

      if (layer) {
        mapInstance.current.addLayer(layer);
        setSentinel1Layers(prev => [...prev, layer]);
        // console.log('Added Sentinel-1 layer to map:', layerConfig);
      }
    });
  }, [activeLayers1])

  useEffect(() => {
    if (activeLayers.length === 0 && sentinelLayers.length > 0) {
      // Clear all sentinel layers
      sentinelLayers.forEach(layer => {
        mapInstance.current.removeLayer(layer);
      });
      setSentinelLayers([]);
      // console.log('Cleared all Sentinel layers');
    }
  }, [activeLayers.length, sentinelLayers])

  const loadFireData = useCallback(async (fireStartDate, fireEndDate) => {
    if (!fireLayer || !mapInstance.current) return;

    setIsLoadingFires(true);
    try {
      const layers = fireLayer.getLayers();
      layers.forEach(layer => {
        if (!mapInstance.current.getLayers().getArray().includes(layer)) {
          mapInstance.current.addLayer(layer);
        }
      });

      fireLayer.attachToMap(mapInstance.current);
      // console.log(fireStartDate, fireEndDate)

      await fireLayer.loadFireData(fireStartDate, fireEndDate);

      fireLayer.setVisible(fireLayerVisible);
      fireLayer.getLayers().forEach((layer, index) => {
        layer.setZIndex(1000 + index);
      });
    } finally {
      setIsLoadingFires(false);
    }
  }, [fireLayer, fireLayerVisible]);

  
  const kazBoundary0 = useMemo(() => createAdminBoundary('1', layerVisibility.adminBoundary1), []);
  useEffect(() => {
    kazBoundary0.setVisible(layerVisibility.adminBoundary1)
  }, [layerVisibility.adminBoundary1])

  const kazBoundary1 = useMemo(() => createAdminBoundary('2', layerVisibility.adminBoundary2), []);
  useEffect(() => {
    kazBoundary1.setVisible(layerVisibility.adminBoundary2)
  }, [layerVisibility.adminBoundary2])

  const kazBoundary2 = useMemo(() => createAdminBoundary('3', layerVisibility.adminBoundary3), []);
  useEffect(() => {
    kazBoundary2.setVisible(layerVisibility.adminBoundary3)
  }, [layerVisibility.adminBoundary3])

  useEffect(() => {
    sentinelLayers.forEach(layer => {
      layer.setVisible(sentinelVisible);
    });
  }, [sentinelVisible, sentinelLayers]);

  useEffect(() => {
    sentinelLayers.forEach(layer => {
      layer.setOpacity(sentinelOpacity / 100);
    });
  }, [sentinelOpacity, sentinelLayers]);

    // Add visibility control for Sentinel-3
  useEffect(() => {
    sentinel3Layers.forEach(layer => {
      layer.setVisible(sentinel3Visible);
    });
  }, [sentinel3Visible, sentinel3Layers]);

  // Add opacity control for Sentinel-3
  useEffect(() => {
    sentinel3Layers.forEach(layer => {
      layer.setOpacity(sentinel3Opacity / 100);
    });
  }, [sentinel3Opacity, sentinel3Layers]);

    useEffect(() => {
    if (activeLayers3.length === 0 && sentinel3Layers.length > 0) {
      sentinel3Layers.forEach(layer => {
        mapInstance.current.removeLayer(layer);
      });
      setSentinel3Layers([]);
      // console.log('Cleared all Sentinel-3 layers');
    }
  }, [activeLayers3.length, sentinel3Layers]);

  // Add visibility control for Sentinel-3
  useEffect(() => {
    sentinel5Layers.forEach(layer => {
      layer.setVisible(sentinel5Visible);
    });
  }, [sentinel5Visible, sentinel5Layers]);

  // Add opacity control for Sentinel-5
  useEffect(() => {
    sentinel5Layers.forEach(layer => {
      layer.setOpacity(sentinel5Opacity / 100);
    });
  }, [sentinel5Opacity, sentinel5Layers]);

    // Add visibility control for Sentinel-1
  useEffect(() => {
    sentinel1Layers.forEach(layer => {
      layer.setVisible(sentinel1Visible);
    });
  }, [sentinel1Visible, sentinel1Layers]);

  // Add opacity control for Sentinel-1
  useEffect(() => {
    sentinel1Layers.forEach(layer => {
      layer.setOpacity(sentinel1Opacity / 100);
    });
  }, [sentinel1Opacity, sentinel1Layers]);

  useEffect(() => {
    if (activeLayers1.length === 0 && sentinel1Layers.length > 0) {
      sentinel1Layers.forEach(layer => {
        mapInstance.current.removeLayer(layer);
      });
      setSentinel1Layers([]);
      // console.log('Cleared all Sentinel-1 layers');
    }
  }, [activeLayers1.length, sentinel1Layers]);

    useEffect(() => {
    if (activeLayers5.length === 0 && sentinel5Layers.length > 0) {
      sentinel5Layers.forEach(layer => {
        mapInstance.current.removeLayer(layer);
      });
      setSentinel5Layers([]);
      // console.log('Cleared all Sentinel-5 layers');
    }
  }, [activeLayers5.length, sentinel5Layers]);
  

  useEffect(() => {
    if (!mapRef.current) return;

    const { zoom, center, rotation } = getMapStateFromHash();

    const view = new View({
      center,
      zoom,
      rotation,
      showFullExtent: true,
    });

    const geocoder = createGeocoder();

    const map = new Map({
      pixelRatio: window.devicePixelRatio || 1,
      loadTilesWhileInteracting: true,
      loadTilesWhileAnimating: true,
      moveTolerance: 5,
      target: mapRef.current,
      layers: [
        basemap, kazBoundary0, kazBoundary1, kazBoundary2, 
        tiffLayer, emitJsonLayer, ...emitLayer, sn2Layer, ...sentinelLayers, 
        ...sentinel3Layers, ...sentinel5Layers, ...sentinel1Layers, blanket,
      ],
      view,
      controls: defaultControls().extend([new FullScreen(), geocoder]),
    });

    mapInstance.current = map;
    setIsMapInitialized(true);

    map.showPopup = showPopup;
    map.closePopup = closePopup;

    const contextMenu = createContextMenu(map, view, DEFAULT_POSITION, styles);
    map.addControl(contextMenu);

    // fireRiskLayers && (map.addLayer(fireRiskLayers))

    // sandbox
    const select = new Select({
      layers: [sandGeoVectorLayer]
    })

    map.addInteraction(select);

    select.on('select', function (e) {
      const selected = e.selected[0];

      if (selected) {
        const plumeUrl = selected.get('plume_tif');
        if (plumeUrl) {
          console.log('Загружаем новый GeoTIFF:', plumeUrl);

          const newSource = new GeoTIFF({
            sources: [
              {
                url: plumeUrl,
              },
            ],
          });
          sandGeoTiffLayer.setSource(newSource);
        }
      }
    });

    const fullscreenCleanUp = handleFullScreenChange(mapRef);

    let shouldUpdate = true;
    const updatePermalink = () => {
      if (!shouldUpdate) {
        shouldUpdate = true;
        return;
      }
      updateMapStateInHash(view);
    };

    map.on("moveend", updatePermalink);
    // handle plume feature click
    const handleClick = (event) => {
      map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
        if (layer === emitJsonLayer) {
          setSelectedFeature(feature.getProperties());
          setIsModalVisible(true);
          return true;
        }
      });
    };

    map.on('click', handleClick);

    const handlePopState = (event) => {
      if (event.state === null) return;
      view.setCenter(event.state.center);
      view.setZoom(event.state.zoom);
      view.setRotation(event.state.rotation);
      shouldUpdate = false;
    };

    window.addEventListener("popstate", handlePopState);

    // If fire layer should be visible, load it immediately
    setIsMapInitialized(true);
    // if (fireLayerVisible) {
    //   loadFireData();
    // }
    
    map.on('singleclick', function (evt) {
      const coordinate = evt.coordinate;
      console.log('Clicked at coordinates:', coordinate);
    });

    return () => {
      map.setTarget(null);
      fullscreenCleanUp();
      window.removeEventListener("popstate", handlePopState);
      map.un('moveend', updatePermalink);
      map.un('click', handleClick);
      setIsMapInitialized(false);
    };
  }, [basemap, blanket, tiffLayer, emitJsonLayer, sn2Layer]);


  // Set up popup interactions after map initialized
  useEffect(() => {
    if (!isMapInitialized || !mapInstance.current || !fireLayer || !isOverlayReady) {
      // console.log('Prerequisites not met for popup setup:', {
      //   isMapInitialized,
      //   hasMap: !!mapInstance.current,
      //   hasFireLayer: !!fireLayer,
      //   isOverlayReady
      // });
      return;
    }
    
    // console.log('Setting up popup interactions');
    const cleanup = setupPopupInteractions();
    
    return cleanup;
  }, [isMapInitialized, setupPopupInteractions, fireLayer?.getVisible(), isOverlayReady, fireLayer]);

  useEffect(() => {
    if (!fireLayer) return;

    if (showTechnogenicOnly) {
      fireLayer.showOnlyTechnogenic();
    } else if (showNaturalOnly) {
      fireLayer.showOnlyNatural();
    } else {
      fireLayer.clearAllFilters();
    }
  }, [showTechnogenicOnly, showNaturalOnly, fireLayer]);

  useEffect(() => {
    if (!fireLayer) return;

    if (selectedModel === 1) {
      fireLayer.showOnlyModel1();
    } else if (selectedModel === 0) {
      fireLayer.showOnlyModel0();
    } else {
      fireLayer.clearAllFilters();
    }
  }, [selectedModel, fireLayer]);

  useEffect(() => {
    if (!mapInstance.current || !fireModelLayer || !isMapInitialized) return;

    try {
      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(fireModelLayer, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
        }),
        style: styleFireModelFunction
      });

      // Create popup overlay
      const popupElement = document.createElement('div');
      popupElement.className = 'ol-popup';
      popupElement.innerHTML = `
        <a href="#" class="ol-popup-closer"></a>
        <div class="ol-popup-content"></div>
      `;

      const overlay = new Overlay({
        element: popupElement,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });

      mapInstance.current.addOverlay(overlay);

      const clickHandler = (evt) => {
        const feature = mapInstance.current.forEachFeatureAtPixel(
          evt.pixel,
          (feature, layer) => {
            // Only handle features from fire model layer
            if (layer === vectorLayer) {
              return feature;
            }
          }
        );

        if (feature) {
          const coordinate = evt.coordinate;
          const properties = feature.getProperties();
          
          const content = `
            <div>
              <h3>Fire Spread Model</h3>
              <p><strong>Accuracy:</strong> ${fireModelLayer.accuracy || 'High'}</p>
              <p><strong>Satellite:</strong> ${properties.satellite || 'System Generated'}</p>
              ${properties.fireimageid ? `<p><strong>fireimageid:</strong> ${properties.fireimageid}</p>` : ''}
              ${properties.dn ? `<p><strong>Order:</strong> ${properties.dn}</p>` : ''}
              ${properties['locality_names'] ? `<p><strong>Locality:</strong> ${properties['locality_names']}</p>` : ''}
            </div>
          `;

          popupElement.querySelector('.ol-popup-content').innerHTML = content;
          overlay.setPosition(coordinate);

          // close button functionality
          popupElement.querySelector('.ol-popup-closer').onclick = function() {
            overlay.setPosition(undefined);
            return false;
          };
        } else {
          // Hide popup if clicked outside features
          overlay.setPosition(undefined);
        }
      };

      mapInstance.current.on('singleclick', clickHandler);

      // Store references for cleanup
      vectorLayer.clickHandler = clickHandler;
      vectorLayer.overlay = overlay;

      addFireModellingLayer({
        id: Date.now(),
        layer: vectorLayer,
        opacity: 1,
        visible: true,
        name: fireModelLayer.name || 'Fire Spread Model',
        type: fireModelLayer.type || 'Prediction Model',
        color: '#ff6b6b',
        metadata: {
          source: fireModelLayer.source || 'System Generated',
          accuracy: fireModelLayer.accuracy || 'High',
          timestamp: new Date().toISOString(),
        }
      });

      mapInstance.current.addLayer(vectorLayer);
      setMapInstance(mapInstance.current);

      // Cleanup function
      return () => {
        if (mapInstance.current && vectorLayer.clickHandler) {
          mapInstance.current.un('singleclick', vectorLayer.clickHandler);
          mapInstance.current.removeOverlay(vectorLayer.overlay);
        }
      };

    } catch (error) {
      console.error('Error processing GeoJSON data:', error);
    }
  }, [fireModelLayer, isMapInitialized, addFireModellingLayer]);
  
  useEffect(() => {
    if (!isMapInitialized || !mapInstance.current || !fireLayer) return;

    if (fireLayerVisible) {
      if (fireLayer.getLayers().every(layer => !mapInstance.current.getLayers().getArray().includes(layer))) {
        loadFireData(fireStartDate, fireEndDate);
      } else {
        fireLayer.setVisible(true);
      }
    } else if (fireLayer.getVisible()) {
      fireLayer.setVisible(false);
    }

  }, [fireLayerVisible, isMapInitialized, fireLayer, loadFireData, fireStartDate, fireEndDate]);

  // update fire layer if date has changed
  useEffect(() => {
    if (fireLayerVisible && fireLayer && mapInstance.current) {
      loadFireData(fireStartDate, fireEndDate);
    }
  }, [dateHasChanged])

  return (
    <div id="fullscreen" className={styles.fullscreen}>
      <div ref={mapRef} className={styles.map__container}>
        <ToastContainer 
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          // theme="dark"
        />

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
            <Home />
          </button>
        </div>

        {/* Measurement Tools */}
        {isMapInitialized && (
          <MeasurementTools map={mapInstance.current} />
        )}

        {isModalVisible && selectedFeature && (
          <Popover
            open={true}
            onOpenChange={(visible) => setIsModalVisible(visible)}
            content={
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Информация</strong>
                  <button
                    onClick={() => setIsModalVisible(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '16px',
                      cursor: 'pointer',
                      lineHeight: '1',
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                </div>
                <hr style={{ margin: '8px 0' }} />
                {Object.entries(selectedFeature).filter(([key]) => !['layer', 'path', 'DAAC Scene Names'].includes(key)).map(([key, value]) =>
                  key !== 'geometry' ? (
                    <p key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </p>
                  ) : null
                )}
              </div>
            }
            placement="top"
            arrow={false}
          >
            <div
              style={{
                position: 'absolute',
                right: 250,
                bottom: 25,
                cursor: 'pointer',
              }}
            />
          </Popover>
        )}
        
        {/* Popup Overlay */}
        <FirePopup 
          popupRef={popupRef} 
          content={popupContent} 
          onClose={closePopup} 
        />
      </div>
    </div>
  );
};

export default MapView;