import { useRef, useState, useEffect } from "react";
import Overlay from 'ol/Overlay';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString('kz-KZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (e) {
    return dateStr;
  }
};

const getConfidenceLabel = (confidence) => {
  if (!confidence) return null;
  
  const confValue = parseFloat(confidence);
  if (isNaN(confValue)) {
    if (typeof confidence === 'string') {
      const lower = confidence.toLowerCase();
      if (lower.includes('high')) return ['high', 'High'];
      if (lower.includes('med')) return ['medium', 'Medium'];
      if (lower.includes('low')) return ['low', 'Low'];
    }
    return null;
  }
  
  if (confValue >= 80) return ['high', 'High'];
  if (confValue >= 50) return ['medium', 'Medium'];
  return ['low', 'Low'];
};

const usePopupManager = (map, fireLayer) => {
  const popupRef = useRef();
  const [popupContent, setPopupContent] = useState('');
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!map || !popupRef.current) return;

    const overlay = new Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    
    overlayRef.current = overlay;
    map.addOverlay(overlay);

    return () => {
      if (map && overlay) {
        map.removeOverlay(overlay);
      }
    };
  }, [map]);

  const closePopup = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (overlayRef.current) {
      overlayRef.current.setPosition(undefined);
    }
    return false;
  };
  
  const showPopup = (coordinate, content) => {
    if (overlayRef.current) {
      setPopupContent(content);
      overlayRef.current.setPosition(coordinate);
    }
  };

  const setupPopupInteractions = () => {
    if (!map) return () => {};

    map.on('pointermove', function(evt) {
      if (evt.dragging) return;
      
      const pixel = map.getEventPixel(evt.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel, {
        layerFilter: layer => {
          // if this layer belongs to the fire layer group
          return fireLayer.containsLayer ? 
          fireLayer.containsLayer(layer) : 
          fireLayer.getLayers().includes(layer);
        }
      });
      
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    const handleClick = (evt) => {
      closePopup();
      
      // if clicked on fire feature
      let foundFeature = false;
      
      map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        // if layer belongs to fireLayer group
        const isFireLayer = fireLayer.containsLayer ? 
                          fireLayer.containsLayer(layer) : 
                          fireLayer.getLayers().includes(layer);
        
        if (!foundFeature && isFireLayer) {
          if (layer === fireLayer.clusterLayer) {
            const features = feature.get('features');
            if (features && features.length > 0) {
              if (features.length > 1) {
                const coordinate = evt.coordinate;
                const content = `
                  <div class="fire-popup fire-cluster">
                    <div class="fire-popup-header">
                      <span class="fire-icon">🔥</span>
                      Fire Cluster
                      <span class="cluster-count">${features.length}</span>
                    </div>
                    <div class="fire-popup-content">
                      <div class="fire-popup-row">
                        <div class="fire-popup-label">Count:</div>
                        <div class="fire-popup-value">${features.length} fire points</div>
                      </div>
                      <div class="fire-popup-row">
                        <div class="fire-popup-label">Date Range:</div>
                        <div class="fire-popup-value">
                          ${formatDate(features[0].get('date') || features[0].get('datetime'))} - 
                          ${formatDate(features[features.length-1].get('date') || features[features.length-1].get('datetime'))}
                        </div>
                      </div>
                    </div>
                    <div class="fire-popup-footer">
                      Zoom in to see individual fire points
                    </div>
                  </div>
                `;
                showPopup(coordinate, content);
                foundFeature = true;
                return true;
              }
              // If one feature, show that feature
              feature = features[0];
            }
          }
          
          const coordinate = evt.coordinate;
          
          const name = feature.get('name') || 'Unnamed Fire';
          const date = formatDate(feature.get('date') || feature.get('datetime') || '');
          const confidenceRaw = feature.get('confidence') || '';
          const power = feature.get('power') || feature.get('brightness') || '';
          
          const confidenceInfo = getConfidenceLabel(confidenceRaw);
          const confidenceBadge = confidenceInfo ? 
            `<span class="confidence-badge confidence-${confidenceInfo[0]}">${confidenceInfo[1]}</span>` : '';
          
          // popup content
          let content = `
            <div class="fire-popup">
              <div class="fire-popup-header">
                <span class="fire-icon">🔥</span>
                ${name}
                ${confidenceBadge}
              </div>
              <div class="fire-popup-content">
          `;
          
          if (date) {
            content += `
              <div class="fire-popup-row">
                <div class="fire-popup-label">Date:</div>
                <div class="fire-popup-value">${date}</div>
              </div>
            `;
          }
          
          if (confidenceRaw) {
            content += `
              <div class="fire-popup-row">
                <div class="fire-popup-label">Confidence:</div>
                <div class="fire-popup-value">${confidenceRaw}</div>
              </div>
            `;
          }
          
          if (power) {
            content += `
              <div class="fire-popup-row">
                <div class="fire-popup-label">Power:</div>
                <div class="fire-popup-value">${power}</div>
              </div>
            `;
          }
          
          const props = feature.getProperties();
          Object.keys(props).forEach(key => {
            if (!['name', 'date', 'datetime', 'confidence', 'power', 'brightness', 'geometry'].includes(key) && 
                props[key] !== undefined && props[key] !== null && props[key] !== '') {
              content += `
                <div class="fire-popup-row">
                  <div class="fire-popup-label">${key}:</div>
                  <div class="fire-popup-value">${props[key]}</div>
                </div>
              `;
            }
          });
          
          content += `
              </div>
              <div class="fire-popup-footer">
                Fire detection data
              </div>
            </div>
          `;
          
          showPopup(coordinate, content);
          foundFeature = true;
          return true;
        }
        return false;
      });
    };

    map.on('click', handleClick);
    
    return () => {
      map.un('click', handleClick);
    };
  };

  return {
    popupRef,
    popupContent,
    closePopup,
    showPopup,
    setupPopupInteractions
  };
};

export default usePopupManager;