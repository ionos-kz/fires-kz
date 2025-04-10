import { useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { basemapOptions } from '../utils/basemaps';

const BasemapSwitcher = ({ styles, currentBasemap, onBasemapChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.basemapSwitcher}>
      <button 
        className={styles.basemapButton} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Basemap Options"
      >
        <MapIcon />
      </button>

      {isOpen && (
        <div className={styles.basemapOptions}>
          {Object.keys(basemapOptions).map((key) => (
            <button 
              key={key} 
              className={`${styles.basemapOption} ${currentBasemap === basemapOptions[key] ? styles.active : ''}`}
              onClick={() => {
                onBasemapChange(basemapOptions[key]);
                setIsOpen(false);
              }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BasemapSwitcher;