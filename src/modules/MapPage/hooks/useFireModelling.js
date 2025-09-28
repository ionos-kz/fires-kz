import { useEffect } from 'react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';
import { styleFireModelFunction } from "../utils/colorFireModel.js";

export const useFireModelling = (fireModelLayer, mapInstance, isMapInitialized, addFireModellingLayer, setMapInstance) => {
  useEffect(() => {
    if (!mapInstance || !fireModelLayer || !isMapInitialized) return;

    try {
      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(fireModelLayer, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
        }),
        style: styleFireModelFunction
      });

      // Create popup overlay
      const popupElement = document.createElement('div');
      popupElement.className = 'ol-popup';
      popupElement.innerHTML = `
        <a href="#" class="ol-popup-closer"></a>
        <div class="ol-popup-content"></div>
      `;

      const overlay = new Overlay({
        element: popupElement,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });

      mapInstance.addOverlay(overlay);

      const clickHandler = (evt) => {
        const feature = mapInstance.forEachFeatureAtPixel(
          evt.pixel,
          (feature, layer) => {
            // Only handle features from fire model layer
            if (layer === vectorLayer) {
              return feature;
            }
          }
        );

        if (feature) {
          const coordinate = evt.coordinate;
          const properties = feature.getProperties();
          
          const content = `
            <div>
              <h3>Fire Spread Model</h3>
              <p><strong>Accuracy:</strong> ${fireModelLayer.accuracy || 'High'}</p>
              <p><strong>Satellite:</strong> ${properties.satellite || 'System Generated'}</p>
              ${properties.fireimageid ? `<p><strong>fireimageid:</strong> ${properties.fireimageid}</p>` : ''}
              ${properties.dn ? `<p><strong>Order:</strong> ${properties.dn}</p>` : ''}
              ${properties['locality_names'] ? `<p><strong>Locality:</strong> ${properties['locality_names']}</p>` : ''}
            </div>
          `;

          popupElement.querySelector('.ol-popup-content').innerHTML = content;
          overlay.setPosition(coordinate);

          // Close button functionality
          popupElement.querySelector('.ol-popup-closer').onclick = function() {
            overlay.setPosition(undefined);
            return false;
          };
        } else {
          // Hide popup if clicked outside features
          overlay.setPosition(undefined);
        }
      };

      mapInstance.on('singleclick', clickHandler);

      // Store references for cleanup
      vectorLayer.clickHandler = clickHandler;
      vectorLayer.overlay = overlay;

      addFireModellingLayer({
        id: Date.now(),
        layer: vectorLayer,
        opacity: 1,
        visible: true,
        name: fireModelLayer.name || 'Fire Spread Model',
        type: fireModelLayer.type || 'Prediction Model',
        color: '#ff6b6b',
        metadata: {
          source: fireModelLayer.source || 'System Generated',
          accuracy: fireModelLayer.accuracy || 'High',
          timestamp: new Date().toISOString(),
        }
      });

      mapInstance.addLayer(vectorLayer);
      setMapInstance(mapInstance);

      // Cleanup function
      return () => {
        if (mapInstance && vectorLayer.clickHandler) {
          mapInstance.un('singleclick', vectorLayer.clickHandler);
          mapInstance.removeOverlay(vectorLayer.overlay);
        }
      };

    } catch (error) {
      console.error('Error processing GeoJSON data:', error);
    }
  }, [fireModelLayer, isMapInitialized, addFireModellingLayer, mapInstance, setMapInstance]);
};