import { useEffect, useRef, useMemo, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import FullScreen from "ol/control/FullScreen";
import { defaults as defaultControls } from "ol/control/defaults";
import { ToastContainer } from 'react-toastify';
import { Home } from 'lucide-react';

import BasemapSwitcher from "./BasemapSwitcher.jsx";
import MeasurementTools from "./MeasurementTools.jsx";
import FirePopup from './FirePopup.jsx';
import usePopupManager from './PopupManager.jsx';
import { getMapStateFromHash, updateMapStateInHash } from "../utils/mapState.js";
import { DEFAULT_POSITION, KAZAKHSTAN_EXTENT } from "../utils/mapConstants.js";
import { createBlanketLayer } from "../utils/layers.js";
import { createFireLayer } from "../utils/fireLayer.js";
import { createContextMenu } from "../utils/contextMenu.js";
import { handleFullScreenChange } from "../utils/fullScreen.js";
import { osmLayer } from "../utils/basemaps.js";
import { createGeocoder } from "../utils/geocoder.js";
import { flyHome } from "../utils/flyHome.js";
import useFireStore from "src/app/store/fireStore";

import "ol/ol.css";
import 'ol-geocoder/dist/ol-geocoder.min.css';
import 'react-toastify/dist/ReactToastify.css';
import styles from "./MapView.module.scss";
import './mapStyles.scss';

const MapView = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [basemap, setBasemap] = useState(osmLayer);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isLoadingFires, setIsLoadingFires] = useState(false);
  const { fireLayerVisible } = useFireStore();  // controls fire point visibility via zustand
  
  const blanket = useMemo(() => createBlanketLayer(), []);
  const fireLayer = useMemo(() => createFireLayer(), []);
  
  const {
    popupRef,
    popupContent,
    closePopup,
    showPopup,
    setupPopupInteractions
  } = usePopupManager(mapInstance.current, fireLayer);

  // Function to load fire data with date range
  const loadFireData = async (startDate, endDate) => {
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
      
      await fireLayer.loadFireData(startDate, endDate);
      
      fireLayer.setVisible(fireLayerVisible);
    } finally {
      setIsLoadingFires(false);
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
    setIsMapInitialized(true);

    map.showPopup = showPopup;
    map.closePopup = closePopup;

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

    map.on("moveend", updatePermalink);

    const handlePopState = (event) => {
      if (event.state === null) return;
      view.setCenter(event.state.center);
      view.setZoom(event.state.zoom);
      view.setRotation(event.state.rotation);
      shouldUpdate = false;
    };
    
    window.addEventListener("popstate", handlePopState);

    // If fire layer should be visible, load it immediately
    if (fireLayerVisible) {
      loadFireData();
    }
    
    map.on('singleclick', function (evt) {
      const coordinate = evt.coordinate;
      console.log('Clicked at coordinates:', coordinate);
    });

    return () => {
      map.setTarget(null);
      fullscreenCleanUp();
      window.removeEventListener("popstate", handlePopState);
      map.un('moveend', updatePermalink);
      setIsMapInitialized(false);
    };
  }, [basemap, blanket]);

  // Set up popup interactions after map initialized
  useEffect(() => {
    if (!isMapInitialized || !mapInstance.current) return;
    const cleanup = setupPopupInteractions();
    return cleanup;
  }, [isMapInitialized, setupPopupInteractions]);

  useEffect(() => {
    if (!isMapInitialized || !mapInstance.current || !fireLayer) return;
    
    if (fireLayerVisible) {
      if (fireLayer.getLayers().every(layer => !mapInstance.current.getLayers().getArray().includes(layer))) {
        loadFireData();
      } else {
        fireLayer.setVisible(true);
      }
    } else if (fireLayer.getVisible) {
      fireLayer.setVisible(false);
    }
  }, [fireLayerVisible, isMapInitialized]);

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
            <Home />
          </button>
        </div>

        {/* Measurement Tools */}
        {isMapInitialized && (
          <MeasurementTools map={mapInstance.current} />
        )}
      </div>

      {/* Popup Overlay */}
      <FirePopup 
        popupRef={popupRef} 
        content={popupContent} 
        onClose={closePopup} 
      />
    </div>
  );
};

export default MapView;