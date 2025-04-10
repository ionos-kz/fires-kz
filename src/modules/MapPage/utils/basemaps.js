import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";

// Base map layers
export const osmLayer = new TileLayer({
  source: new OSM({attributions: [], crossOrigin: 'anonymous'}),
  preload: Infinity,
  useInterimTilesOnError: false, 
});

export const esriLayer = new TileLayer({
  source: new XYZ({
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attributions: "Tiles © Esri",
    crossOrigin: "anonymous",
  }),
});

export const bingLayer = new TileLayer({
  source: new XYZ({
    url: "https://ecn.t3.tiles.virtualearth.net/tiles/a{q}.jpeg?g=1",
    attributions: "Tiles © Microsoft Bing",
    crossOrigin: "anonymous",
  }),
});

export const cartoLayer = new TileLayer({
  source: new XYZ({
    url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attributions: "Tiles © CartoDB",
    crossOrigin: "anonymous",
  }),
});

export const basemapOptions = {
  osm: osmLayer,
  esri: esriLayer,
  bing: bingLayer,
  carto: cartoLayer,
};