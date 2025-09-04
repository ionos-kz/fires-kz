export const sentinelConfigs = {
  sentinel2: {
    satelliteType: 'sentinel2',
    title: 'Sentinel-2 Layer',
    bandOptions: [
      { value: 'true-color', label: 'True Color (RGB)', icon: '🌍', description: 'Natural color composite' },
      { value: 'false-color', label: 'False Color (NIR-R-G)', icon: '🌿', description: 'Vegetation analysis' },
      { value: 'ndvi', label: 'NDVI (Vegetation)', icon: '🌱', description: 'Normalized Difference Vegetation Index' },
      { value: 'ndwi', label: 'NDWI (Water)', icon: '💧', description: 'Water body detection' },
      { value: 'ndbr', label: 'NDBR (Burn Ratio)', icon: '🔥', description: 'Burn severity mapping' }
    ]
  },
  sentinel3: {
    satelliteType: 'sentinel3',
    title: 'Sentinel-3 Layer',
    bandOptions: [
      { value: 'OTCI', label: 'Terrestrial Chlorophyll Index', icon: '🌍', description: 'Natural color composite' },
      { value: 'PAR', label: 'Photosynthetically Active Radiation', icon: '🌿', description: 'Vegetation analysis' },
    ]
  }
};