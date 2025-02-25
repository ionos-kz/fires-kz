import { useEffect, useRef, useMemo, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import FullScreen from "ol/control/FullScreen";
import { defaults as defaultControls } from "ol/control/defaults";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { ToastContainer } from 'react-toastify';
import Geocoder from 'ol-geocoder';
import { Home, Map as MapIcon } from 'lucide-react';

import { getMapStateFromHash, updateMapStateInHash } from "../../utils/mapState.js";
import { DEFAULT_POSITION, KAZAKHSTAN_EXTENT } from "../../utils/mapConstants.js";
import { createBlanketLayer } from "../../utils/layers.js";
import { createContextMenu } from "../../utils/contextMenu.js";
import { handleFullScreenChange } from "../../utils/fullScreen.js";

import "ol/ol.css";
import 'ol-geocoder/dist/ol-geocoder.min.css';
import styles from "./MapView.module.scss";
import './mapStyles.scss'
import { flyHome } from "../../utils/flyHome.js";

// TODO separate basemaps
const osmLayer = new TileLayer({
  source: new OSM({attributions: [], crossOrigin: 'anonymous'}),
  preload: Infinity,
  useInterimTilesOnError: false, 
});

const esriLayer = new TileLayer({
  source: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attributions: "Tiles © Esri",
    crossOrigin: "anonymous",
  }),
});

const bingLayer = new TileLayer({
  source: new XYZ({
    url: "https://ecn.t3.tiles.virtualearth.net/tiles/a{q}.jpeg?g=1",
    attributions: "Tiles © Microsoft Bing",
    crossOrigin: "anonymous",
  }),
});

const cartoLayer = new TileLayer({
  source: new XYZ({
    url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attributions: "Tiles © CartoDB",
    crossOrigin: "anonymous",
  }),
});

const basemapOptions = {
  osm: osmLayer,
  esri: esriLayer,
  bing: bingLayer,
  carto: cartoLayer,
}

const MapView = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const [basemap, setBasemap] = useState(osmLayer);
  const [isBasemapOpen, setIsBasemapOpen] = useState(false);

  const blanket = useMemo(() => createBlanketLayer(), []);

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

    // TODO Geocoder button is not suitable for screen reader. Add arial-label
    // TODO create util for geocoder
    const geocoder = new Geocoder('nominatim', {
      provider: 'osm',
      lang: 'kz',
      placeholder: 'Поиск...',
      targetType: 'glass-button',
      limit: 3,
      countrycodes: 'KZ',
      keepOpen: true,
      // preventDefault: true, // preventing zoom to the location
    });

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

    const contextMenu = createContextMenu(map, view, DEFAULT_POSITION, styles)
    map.addControl(contextMenu);

    const fullscreenCleanUp = handleFullScreenChange(mapRef)

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

    return () => {
      map.setTarget(null);
      fullscreenCleanUp();
      window.removeEventListener("popstate", handlePopState);
      map.un('moveend', updatePermalink);
    };
  }, [basemap, blanket]);

  // TODO create component for basemap switcher
  return (
    <div id="fullscreen" className={styles.fullscreen}>
      <div ref={mapRef} className={styles.map__container}>
        <ToastContainer />

          {/* Basemap Switcher */}
          <div className={styles.basemapSwitcher}>
            <button 
              className={styles.basemapButton} 
              onClick={() => setIsBasemapOpen(!isBasemapOpen)}
              aria-label="Toggle Basemap Options"
            >
              <MapIcon color="#4999E8" />
            </button>

            {isBasemapOpen && (
              <div className={styles.basemapOptions}>
                {Object.keys(basemapOptions).map((key) => (
                  <button 
                    key={key} 
                    className={`${styles.basemapOption} ${basemap === key ? styles.active : ''}`}
                    onClick={() => {
                      setBasemap(basemapOptions[key]);
                      setIsBasemapOpen(false);
                    }}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* Home */}
        <div className={styles.goHome}>
            <button 
              className={styles.homeButton} 
              onClick={() => flyHome(mapInstance.current.getView())}
              aria-label="Toggle Basemap Options"
            >
              <Home color="#4999E8" />
            </button>
        </div>

      </div>
    </div>
  );
};

export default MapView;