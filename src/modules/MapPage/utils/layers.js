import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import TopoJSON from 'ol/format/TopoJSON.js';
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

export const createBlanketLayer = () => {
  return new VectorLayer({
    declutter: true,
    source: new VectorSource({
      url: "/layers/blanket.topojson",
      format: new TopoJSON(),
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
