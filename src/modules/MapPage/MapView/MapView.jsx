import { useEffect, useRef, useMemo, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import FullScreen from "ol/control/FullScreen";
import { defaults as defaultControls } from "ol/control/defaults";
import { ToastContainer } from 'react-toastify';
import { Home, LucideAArrowDown } from 'lucide-react';

import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

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

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import Fill from "ol/style/Fill";

import "ol/ol.css";
import 'ol-geocoder/dist/ol-geocoder.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './mapStyles.scss'
import styles from "./MapView.module.scss";

import useMethaneStore from "src/app/store/methaneStore";

const MapView = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [basemap, setBasemap] = useState(osmLayer);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isLoadingFires, setIsLoadingFires] = useState(false);
  const { fireLayerVisible } = useFireStore();

  const blanket = useMemo(() => createBlanketLayer(), []);
  const fireLayer = useMemo(() => createFireLayer(), []);

  const {
    methaneYear,
    methaneLayerVisible,
    methaneOpacity,
    methaneFlumesVisible
  } = useMethaneStore();

  const plumeLayer = useMemo(() => {
    const source = new VectorSource({
      url: '/layers/unep_methanedata_detected_plumes.geojson',
      projection: 'EPSG:3857',
      format: new GeoJSON(),
    });

    return new VectorLayer({
      source,
       style: new Style({
        stroke: new Stroke({
          color: '#333',
          width: 1,
        }),
        fill: new Fill({
          color: "#999",
        })
      }),
      visible: methaneFlumesVisible
    });
  }, [methaneFlumesVisible]);

  const tiffLayer = useMemo(() => {
    return new TileLayer({
      source: new XYZ({
        url: `https://fires.kz/data/ch4_tiles/${methaneYear}/{z}/{x}/{-y}.png`,
        projection: 'EPSG:3857',
        tileSize: [256, 256],
        maxZoom: 10,
        onError: function (error) {
          if (error.status !== 404) {
            console.error('Error loading XYZ tile:', error);
          } else {
            console.log(`Tile not found: ${error.url}`);
          }
        },
      }),
      opacity: methaneOpacity * 0.01,
      visible: methaneLayerVisible,
    });
  }, [methaneYear, methaneLayerVisible]);

  useEffect(() => {
    tiffLayer.setOpacity(methaneOpacity * 0.01);
  }, [methaneOpacity]);

  // const tiffLayer = useMemo(() => {
  //   return new TileLayer({
  //     source: new GeoTIFF({
  //       sources: [{
  //         url: `/rasters/sp/tiff/Kazakhstan_Super_Emitters_CH4_${methaneYear}.tif`,
  //       }],
  //       bandCount: 1,
  //       normalize: true,
  //       convertToRGB: true, // ensures renderable data
  //     }),
  //     opacity: 0.5,
  //     visible: methaneLayerVisible,
  //   });
  // }, [methaneYear, methaneLayerVisible]);

  const kazakhstanBorderLayer = useMemo(() => {
    return new VectorLayer({
      source: new VectorSource({
        url: '/layers/kz_1.json',
        format: new GeoJSON(),
      }),
      style: new Style({
        stroke: new Stroke({
          color: '#333',
          width: 1,
        }),
      }),
    });
  }, []);

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
      // extent: KAZAKHSTAN_EXTENT,
      showFullExtent: true,
    });

    const geocoder = createGeocoder();

    // map initialization and settings
    const map = new Map({
      pixelRatio: window.devicePixelRatio || 1,
      loadTilesWhileInteracting: true,
      loadTilesWhileAnimating: true,
      moveTolerance: 5,
      target: mapRef.current,
      layers: [basemap, tiffLayer, plumeLayer],
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
      loadFireData();
    }

    return () => {
      map.setTarget(null);
      fullscreenCleanUp();
      window.removeEventListener("popstate", handlePopState);
      map.un('moveend', updatePermalink);
      setIsMapInitialized(false);
    };
  }, [basemap, blanket, tiffLayer, plumeLayer]);

  useEffect(() => {
    if (!isMapInitialized || !mapInstance.current || !fireLayer) return;

    if (fireLayerVisible) {
      if (fireLayer.getLayers().every(layer => !mapInstance.current.getLayers().getArray().includes(layer))) {
        loadFireData();
      } else {
        fireLayer.setVisible(true);
      }
    } else if (fireLayer.getVisible()) {
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
    </div>
  );
};

export default MapView;