import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from 'ol/format/GeoJSON.js'
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import {bbox as bboxStrategy} from 'ol/loadingstrategy';

export const createBlanketLayer = () => {
  return new VectorLayer({
    declutter: true,
    source: new VectorSource({
      url: "/layers/blanket.geojson",
      format: new GeoJSON(),
      // strategy: bboxStrategy, // BUG BBOX startegy causes readding the layer on the max zoom out
    }),
    overlaps: false,
    renderMode: 'vector',
    style: new Style({
      stroke: new Stroke({ color: "#4999E8", width: 1 }),
      fill: new Fill({ color: "rgba(13, 14, 14, 0.7)" }),
    }),
  });
};

const sharedAdminStyle = new Style({
  stroke: new Stroke({ color: "#4999E8", width: 2 }),
  fill: new Fill({ color: "rgba(0, 0, 0, 0.05)" })
});

export const createAdminBoundary = (level, layerVisibility = false) => {
  return new VectorLayer({
    updateWhileAnimating: false,
    updateWhileInteracting: false,
    declutter: true,
    visible: layerVisibility,
    source: new VectorSource({
      url: `/layers/KAZ_OSM_BORDER_LVL${level}.geojson`,
      format: new GeoJSON()
    }),
    url: extent => `/api/boundaries?level=${level}&bbox=${extent.join(',')}`,
    strategy: bboxStrategy,
    overlaps: false,
    renderMode: 'image',
    style: sharedAdminStyle
  })
}