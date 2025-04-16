import { useEffect, useRef, useMemo, useState } from "react";
import Map from "ol/Map";
import TileLayer from 'ol/Tile';
import TileWMS from 'ol/source/TileWMS';
import View from "ol/View";
import FullScreen from "ol/control/FullScreen";
import { defaults as defaultControls } from "ol/control/defaults";
import { ToastContainer } from 'react-toastify';
import { Home } from 'lucide-react';


import BasemapSwitcher from "./BasemapSwitcher.jsx";
import MeasurementTools from "./MeasurementTools.jsx";
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
import './mapStyles.scss'

const MapView = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [basemap, setBasemap] = useState(osmLayer);
  const [isMapInitialized, setIsMapInitialized] = useState(false); // Track map initialization
  const [isLoadingFires, setIsLoadingFires] = useState(false);
  const { fireLayerVisible } = useFireStore();

  const blanket = useMemo(() => createBlanketLayer(), []);
  const fireLayer = useMemo(() => createFireLayer(), []);

  // Function to load fire data with date range
  const loadFireData = async (startDate, endDate) => {
    if (!fireLayer || !mapInstance.current) return;
    
    setIsLoadingFires(true);
    try {
      await fireLayer.loadFireData(startDate, endDate);
      if (!mapInstance.current.getLayers().getArray().includes(fireLayer)) {
        mapInstance.current.addLayer(fireLayer);
      }
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

    // const sentinelLayer = new TileLayer({
    //   source: new TileWMS({
    //     url: 'https://services.sentinel-hub.com/ogc/wms/YOUR_INSTANCE_ID', // замените на свой instance ID
    //     params: {
    //       LAYERS: 'TRUE_COLOR',
    //       FORMAT: 'image/png',
    //       TRANSPARENT: true,
    //       TIME: '2024-08-01', // или диапазон: '2024-07-01/2024-08-01'
    //     },
    //     tileSize: 512,
    //     attributions: '© Sentinel-2 data from Copernicus',
    //   }),
    // });

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

    map.on('singleclick', function (evt) {
      const coordinate = evt.coordinate;
      console.log(coordinate)
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

    if (fireLayerVisible) {
      console.log(fireLayerVisible)
      loadFireData()
    } else {
      console.log(fireLayerVisible)
    }

    return () => {
      map.setTarget(null);
      fullscreenCleanUp();
      window.removeEventListener("popstate", handlePopState);
      map.un('moveend', updatePermalink);
      setIsMapInitialized(false); // Reset initialization state
    };
  }, [basemap, blanket, fireLayerVisible]);

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

    </div>
  );
};

export default MapView;