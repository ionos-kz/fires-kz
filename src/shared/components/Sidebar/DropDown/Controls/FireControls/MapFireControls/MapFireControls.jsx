import { useEffect, useRef, useCallback, useState } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import OSM from 'ol/source/OSM.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Style, Fill, Stroke } from 'ol/style.js';
import { DEFAULT_POSITION } from '../../../../../../../modules/MapPage/utils/mapConstants';

import styles from './MapFireControls.module.scss';

const MapFireControls = ({ firesByRegion }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const fireData = firesByRegion;

  const getColorForValue = useCallback((value) => {
    const maxValue = Math.max(...Object.values(fireData));
    if (maxValue === 0) return 'rgba(200, 200, 200, 0.3)';
    
    const intensity = value / maxValue;

    const colors = [
      { threshold: 0, color: '#ffffff' },
      { threshold: 0.2, color: '#ffd700' },
      { threshold: 0.4, color: '#ff8000' },
      { threshold: 0.6, color: '#ff4500' },
      { threshold: 0.8, color: '#cc0000' },
      { threshold: 1, color: '#7a0000' }
    ];

    for (let i = 0; i < colors.length - 1; i++) {
      if (intensity >= colors[i].threshold && intensity <= colors[i + 1].threshold) {
        const start = colors[i];
        const end = colors[i + 1];
        
        // Calculate interpolation factor within range
        const rangeIntensity = (intensity - start.threshold) / (end.threshold - start.threshold);
        
        // Interpolate between colors
        const startRgb = hexToRgb(start.color);
        const endRgb = hexToRgb(end.color);
        
        const r = Math.floor(startRgb.r + (endRgb.r - startRgb.r) * rangeIntensity);
        const g = Math.floor(startRgb.g + (endRgb.g - startRgb.g) * rangeIntensity);
        const b = Math.floor(startRgb.b + (endRgb.b - startRgb.b) * rangeIntensity);
        
        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    return colors[colors.length - 1].color;
  }, [fireData]);

  // hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const styleFunction = useCallback((feature) => {
    const regionName =
      feature.get('name') || feature.get('name_igmass');
    const fireCount = fireData[regionName] || 0;

    return new Style({
      fill: new Fill({ color: getColorForValue(fireCount) }),
      stroke: new Stroke({ color: '#333', width: 1 }),
    });
  }, [fireData, getColorForValue]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const vectorSource = new VectorSource({
      url: '/layers/KAZ_OSM_BORDER_LVL2.geojson',
      format: new GeoJSON(),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction,
    });

    const map = new Map({
      target: mapContainerRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
      ],
      view: new View({
        center: DEFAULT_POSITION.center,
        zoom: DEFAULT_POSITION.zoom,
        minZoom: DEFAULT_POSITION.zoom,
        maxZoom: 22,
      }),
    });

    mapRef.current = map;

    let lastFeature = null;

    map.on('click', (evt) => {
      if (lastFeature) lastFeature.setStyle(undefined);

      const feature = map.forEachFeatureAtPixel(evt.pixel, (feat) => feat);

      if (feature) {
        const regionName = feature.get('name') || feature.get('name_igmass');
        const fireCount = fireData[regionName] || 'N/A';

        setHoveredRegion({ name: regionName, count: fireCount });
        feature.setStyle(new Style({
          fill: new Fill({ color: getColorForValue(fireCount) }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }));

        lastFeature = feature;
      } else {
        setHoveredRegion(null);
      }
    });

    return () => {
      map.setTarget(null);
    };
  }, [styleFunction, fireData, getColorForValue]);

  // Show top 5 regions in legend
  const sortedRegions = Object.entries(fireData)
    .sort(([, a], [, b]) => b - a);

  const maxLegendItems = 5;

  return (
    <div className={styles.mapFireWrapper}>
      <div className={styles.mapSection}>
        <div ref={mapContainerRef} className={styles.mapFireControls}></div>

        {hoveredRegion && (
          <div className={styles.hoverBox}>
            <strong>{hoveredRegion.name}</strong>
            <p>{hoveredRegion.count} fires</p>
          </div>
        )}

        {/* Color intensity legend on the map */}
        <div className={styles.colorLegend}>
          <div className={styles.gradientBar}></div>
          <div className={styles.gradientLabels}>
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>

      <div className={styles.legendSection}>
        <div className={styles.legend}>
          <h4>Top Fire Regions</h4>
          <div className={styles.legendItems}>
            {sortedRegions.slice(0, maxLegendItems).map(([region, count]) => (
              <div key={region} className={styles.legendItem}>
                <div
                  className={styles.legendColor}
                  style={{ backgroundColor: getColorForValue(count) }}
                ></div>
                <span className={styles.regionName}>{region}</span>
                <span className={styles.fireCount}>{count}</span>
              </div>
            ))}
            {sortedRegions.length > maxLegendItems && (
              <div className={styles.moreRegions}>
                +{sortedRegions.length - maxLegendItems} more regions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapFireControls;