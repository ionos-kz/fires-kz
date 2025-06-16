import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

const BASE_URL = "https://sh.dataspace.copernicus.eu/ogc/wms/4c423dbd-36df-4327-a20b-19a08f888c59";

const BAND_LAYERS = {
  'true-color': {
    layerName: 'TRUE_COLOR',
  },
  'false-color': {
    layerName: 'TEST',
  },
  'ndvi': {
    layerName: 'NDVI_FIRESKZ',
  },
  'ndwi': {
    layerName: 'NDWI',
  },
  'ndbr': {
    layerName: 'NDBR',
  }
};

export const createSentinelLayer = (layerId, bands, startDate, endDate, opacity = 0.8) => {
  const timeRange = `${startDate}/${endDate}`;
  const config = BAND_LAYERS[bands];
  
  console.log('Creating WMS layer with params:', {
    url: BASE_URL + BAND_LAYERS[bands][1],
    layers: BAND_LAYERS[bands][0] || 'TRUE_COLOR',
    time: timeRange,
    layerId
  });
  
  const layer = new TileLayer({
    source: new TileWMS({
      url: BASE_URL,
      params: {
        'LAYERS': config.layerName,
        'TIME': timeRange,
        'MAXCC': 20,
        'FORMAT': 'image/png',
        'TRANSPARENT': true,
        'TILED': true,
        'VERSION': '1.3.0',
        // 'CRS': 'EPSG:3857'
      },
    //   serverType: 'geoserver',
    //   transition: 0,
    }),
    opacity: opacity,
    // visible: true,
    title: `Sentinel - ${bands}`
  });
  
  // Set custom property to identify the layer
//   layer.set('id', layerId);
//   layer.set('type', 'sentinel');
  
  return layer;
};

export const searchSentinelData = async (startDate, endDate, bbox = null) => {
  try {
    // unique ids
    const mockResults = [
      {
        Id: `sentinel-${startDate}-${Date.now()}-1`,
        ContentDate: { beginPosition: `${startDate}T10:00:00.000Z` },
        CloudCoverPercentage: Math.floor(Math.random() * 30),
        Name: `S2A_MSIL2A_${startDate.replace(/-/g, '')}T100000_N0500_R001_T42TTP_20231201T120000`
      },
      {
        Id: `sentinel-${endDate}-${Date.now()}-2`,
        ContentDate: { beginPosition: `${endDate}T10:00:00.000Z` },
        CloudCoverPercentage: Math.floor(Math.random() * 30),
        Name: `S2B_MSIL2A_${endDate.replace(/-/g, '')}T100000_N0500_R001_T42TTP_20231201T120000`
      }
    ];
    
    return { value: mockResults };
  } catch (error) {
    console.error('Error searching Sentinel data:', error);
    return { value: [] };
  }
};