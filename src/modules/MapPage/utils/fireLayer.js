import axios from "axios";
import Icon from 'ol/style/Icon.js';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Style from "ol/style/Style";
// import CircleStyle from "ol/style/Circle";
// import Fill from "ol/style/Fill";
// import Stroke from "ol/style/Stroke";
import { toast } from "react-toastify";

// format date as yyyy-mm-dd
const formatDate = (date) => date.toISOString().split('T')[0];

// Get today's date and 7 days ago
const today = new Date();
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const defaultDateStart = formatDate(sevenDaysAgo);
const defaultDateEnd = formatDate(today);

export const createFireLayer = () => {
  const source = new VectorSource();

  // const pointStyle = new Style({
  //   image: new CircleStyle({
  //     radius: 4,
  //     fill: new Fill({ color: "rgba(255, 69, 0, 0.7)" }),
  //     stroke: new Stroke({ color: "#ff4500", width: 1 }),
  //   }),
  // });

  const pointStyle = new Style({
    image: new Icon({
      src: '/flame.png',
      scale: 0.5, // Adjust this value to control the size (e.g., 0.5 for half the original size)
      size: [30, 30], // Optionally, specify the rendered size in pixels (overrides intrinsic size)
      // anchor: [0.5, 1], // Optional: Set the anchor point (default is bottom-center [0.5, 1])
      // opacity: 0.8,   // Optional: Set the opacity
      // rotation: Math.PI / 4, // Optional: Rotate the icon (in radians)
    }),
  });

  const layer = new VectorLayer({
    declutter: true,
    source,
    renderMode: "vector",
    style: pointStyle,
    properties: { id: "fireLayer" },
    visible: false,
  });

  layer.loadFireData = async (date1 = defaultDateStart, date2 = defaultDateEnd) => {
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
      layer.setVisible(true);

      toast.success(`✅ Loaded ${features.length} fire point${features.length === 1 ? '' : 's'}`);
      return features.length;
    } catch (error) {
      console.error("🔥 Failed to fetch fire data:", error);
      toast.error("Failed to load fire data.");
      return 0;
    }
  };

  return layer;
};
