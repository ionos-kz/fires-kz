import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

const BASE_URL = "https://sh.dataspace.copernicus.eu/ogc/wms/d7e26b68-ae7e-416a-86a4-a875713b4ab5";
const SEARCH_API_BASE = "https://catalogue.dataspace.copernicus.eu/resto/api/collections/Sentinel5P/search.json";

const BAND_LAYERS = {
  'NO2': {
    layerName: 'NO2',
  },
  'O3': {
    layerName: 'O3',
  },
  'CH4': {
    layerName: 'CH4',
  },
};

const createFootprint = (bounds = null) => {
  if (bounds) {
    const [minLon, minLat, maxLon, maxLat] = bounds;
    return `POLYGON((${minLon} ${minLat},${maxLon} ${minLat},${maxLon} ${maxLat},${minLon} ${maxLat},${minLon} ${minLat}))`;
  }
  
  return "POLYGON((14.0 46.0,16.0 46.0,16.0 47.0,14.0 47.0,14.0 46.0))";
};

export const searchSentinelData = async (startDate, endDate, bbox = null, maxRecords = 5) => {
  try {
    const footprint = createFootprint(bbox);
    
    const start = startDate;
    const end = endDate;
    
    const searchUrl = `${SEARCH_API_BASE}?startDate=${start}&completionDate=${end}&geometry=${encodeURIComponent(footprint)}&maxRecords=${maxRecords}`;
    
    console.log('Searching Sentinel-5 data with URL:', searchUrl);
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    const transformedResults = data.features?.map(feature => ({
      Id: feature.id,
      Name: feature.properties.title,
      ContentDate: { 
        beginPosition: feature.properties.startDate 
      },
      CloudCoverPercentage: feature.properties.cloudCover,
      Platform: feature.properties.platform,
      Instrument: feature.properties.instrument,
      ProductType: feature.properties.productType,
      ProcessingLevel: feature.properties.processingLevel,
      Footprint: feature.geometry,
      ThumbnailUrl: feature.properties.thumbnail,
      OrbitNumber: feature.properties.orbitNumber,
      RelativeOrbitNumber: feature.properties.relativeOrbitNumber,
      TileId: feature.properties.tileId,
      IngestionDate: feature.properties.published,
      ModificationDate: feature.properties.updated,
      Size: feature.properties.size
    })) || [];
    
    console.log('Found', transformedResults.length, 'Sentinel-5 products');
    
    return { 
      value: transformedResults,
      totalResults: data.properties?.totalResults || 0,
      startIndex: data.properties?.startIndex || 0
    };
    
  } catch (error) {
    console.error('Error searching Sentinel-5 data:', error);
    throw error;
  }
};

export const createSentinel5Layer = (layerId, bands, startDate, endDate, opacity = 0.8, productId = null) => {
  const timeRange = `${startDate}/${endDate}`;
  const config = BAND_LAYERS[bands];
  
  if (!config) {
    console.error(`Band configuration not found for: ${bands}`);
    return null;
  }
  
  console.log('Creating Sentinel-5 WMS layer with params:', {
    url: BASE_URL,
    layers: config.layerName,
    time: timeRange,
    layerId,
    productId
  });
  
  const wmsParams = {
    'LAYERS': config.layerName,
    'TIME': timeRange,
    'MAXCC': 20,
    'FORMAT': 'image/png',
    'TRANSPARENT': true,
    'TILED': true,
    'VERSION': '1.3.0',
    'CRS': 'EPSG:3857'
  };
  
  if (productId) {
    wmsParams['PRODUCT_ID'] = productId;
  }
  
  const layer = new TileLayer({
    source: new TileWMS({
      url: BASE_URL,
      params: wmsParams,
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    }),
    opacity: opacity,
    visible: true,
    title: `Sentinel-5 ${bands} (${startDate} to ${endDate})` 
  });
  
  // Set custom properties to identify and manage the layer
  layer.set('id', layerId);
  layer.set('type', 'sentinel5');
  layer.set('bands', bands);
  layer.set('timeRange', timeRange);
  layer.set('productId', productId);
  
  return layer;
};

export const getProductDetails = async (productId) => {
  try {
    const detailUrl = `https://catalogue.dataspace.copernicus.eu/resto/api/collections/Sentinel5P/${productId}.json`;
    
    const response = await fetch(detailUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error fetching Sentinel-5 product details:', error);
    throw error;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};