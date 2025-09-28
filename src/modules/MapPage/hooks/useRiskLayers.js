import { useEffect, useRef } from 'react';
import TileLayer from 'ol/layer/Tile.js';
import XYZ from 'ol/source/XYZ.js';

export const useRiskLayers = (riskDates, mapInstance, isMapInitialized) => {
  const fireRiskLayers = useRef(null);

  useEffect(() => {
    const riskDatesFormatted = riskDates.map(item => 
      item.date.replace(/-/g, ".")
    );
    
    fireRiskLayers.current = (riskDatesFormatted && riskDatesFormatted.length > 0)
      ? riskDatesFormatted.map(item => new TileLayer({
          source: new XYZ({
            url: `http://old.fires.kz/data/fire_haz/${item}/{z}/{x}/{-y}.png`
          }),
          visible: true
        }))
      : [];
  }, [riskDates]);

  useEffect(() => {
    if (!mapInstance || !fireRiskLayers.current) return;
    
    // Remove existing risk layers
    const currentLayers = mapInstance.getLayers().getArray();
    currentLayers.forEach(layer => {
      if (layer.get('layerType') === 'fireRisk') {
        mapInstance.removeLayer(layer);
      }
    });
    
    // Add new risk layers
    fireRiskLayers.current.forEach(layer => {
      layer.set('layerType', 'fireRisk');
      mapInstance.addLayer(layer);
    });
  }, [riskDates, isMapInitialized, mapInstance]);

  return fireRiskLayers.current;
};