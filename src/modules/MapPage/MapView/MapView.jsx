import { useEffect, useRef, useMemo, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import FullScreen from "ol/control/FullScreen";
import { defaults as defaultControls } from "ol/control/defaults";
import { ToastContainer } from 'react-toastify';
import { Home, LucideAArrowDown } from 'lucide-react';

import TileLayer from 'ol/layer/Tile.js';
import XYZ from 'ol/source/XYZ.js';
import GeoTIFF from 'ol/source/GeoTIFF';

import Select from 'ol/interaction/Select';

import { Popover, List } from 'antd';

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

import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';

import "ol/ol.css";
import 'ol-geocoder/dist/ol-geocoder.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './mapStyles.scss'
import styles from "./MapView.module.scss";

import useMethaneStore from "src/app/store/methaneStore";
import { projection } from "@turf/turf";

const MapView = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [basemap, setBasemap] = useState(osmLayer);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isLoadingFires, setIsLoadingFires] = useState(false);
  const { fireLayerVisible } = useFireStore();

  const blanket = useMemo(() => createBlanketLayer(), []);
  const fireLayer = useMemo(() => createFireLayer(), []);

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

  // const plumeLayer = useMemo(() => {
  //   const source = new VectorSource({
  //     url: '/layers/unep_methanedata_detected_plumes.geojson',
  //     projection: 'EPSG:3857',
  //     format: new GeoJSON(),
  //   });

  //   return new VectorLayer({
  //     source,
  //     style: new Style({
  //       stroke: new Stroke({
  //         color: '#333',
  //         width: 1,
  //       }),
  //       fill: new Fill({
  //         color: "#999",
  //       })
  //     }),
  //     visible: methaneFlumesVisible
  //   });
  // }, [methaneFlumesVisible]);

  const sandGeoTiffLayer = new TileLayer({
    source: new GeoTIFF({
      sources: [
        {
          url: 'https://catalog.carbonmapper.org/l3a-vis-ch4-mfa-v002/2025/02/20/tan20250220t061843c00s4001-B/tan20250220t061843c00s4001-B_l3a-vis-ch4-mfa-v002_plume.tif?c=1114f5e56156b712772168b8b626b51c60ad59a99f1f&Expires=1747102441&Signature=kX0S9lRMFSqjOqpxVDhnQGVFK8TYzyQS4RKY6r5z3iepbShN-OqpPStaXq-gb5DnS46zuietqNZuvbqtgRWP0bmIgD~XA3JWiF8JC73FNSVT4P~Wd~ml6PIJDxEvMibYmgriROnzXs3g4ji1xo7FNqNpk-lgDto4fWY0hf5eub2~8h82TUP-zjZTwkSG8T3zjTbAvKZQBmDdBoCvS2x1fay2IVC~1VpOy93eCXD5mJFTs~~AChlL9hDQrIAKnRIBXzmXN4XpaY~p7SN9qoEXFdxXx4nYEvyG-d6jmJkpcpEr~eXmvUIrn9x9ic1229woYdx1d964p6UtasxtJoUA-A__&Key-Pair-Id=K1ZO5DZQBTMNGZ',
        },
      ],
    }),
  });

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
      showFullExtent: true,
    });

    const geocoder = createGeocoder();

    const map = new Map({
      pixelRatio: window.devicePixelRatio || 1,
      loadTilesWhileInteracting: true,
      loadTilesWhileAnimating: true,
      moveTolerance: 5,
      target: mapRef.current,
      layers: [basemap, tiffLayer, emitJsonLayer, ...emitLayer, sn2Layer],
      view,
      controls: defaultControls().extend([new FullScreen(), geocoder]),
    });

    mapInstance.current = map;

    const contextMenu = createContextMenu(map, view, DEFAULT_POSITION, styles);
    map.addControl(contextMenu);

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

    setIsMapInitialized(true);

    if (fireLayerVisible) {
      loadFireData();
    }

    return () => {
      map.setTarget(null);
      fullscreenCleanUp();
      window.removeEventListener("popstate", handlePopState);
      map.un('moveend', updatePermalink);
      map.un('click', handleClick);
      setIsMapInitialized(false);
    };
  }, [basemap, blanket, tiffLayer, emitJsonLayer, sn2Layer]);


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
      </div>
    </div>
  );
};

export default MapView;