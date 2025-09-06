import { useState } from "react";
import {
  Calendar, Eye, EyeOff, Layers, Search, MapPin, Info,
  AlertCircle, Trash2, Cloud, Database,
} from "lucide-react";
import ProductMetadata from './ProductMetadata';
import LayerCard from "./LayerCard";
import { 
    formatDate, getCloudCoverLabel, getCloudCoverColor, showProductDetails
 } from "src/utils/sentinelUtils";
import styles from "./SentinelControls.module.scss";

const SentinelControlsContainer = ({
      // Handlers
  handleSearchSentinelData,
  addToMap,
  setActiveSection,
  
  // State
  error,
  activeSection,
  
  // Configuration
  bandOptions,
  
  // Store values
  sentinelVisible,
  setSentinelVisible,
  toggleLayerVisibility,
  sentinelOpacity,
  setSentinelOpacity,
  selectedBands,
  setSelectedBands,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  searchResults,
  isLoading,
  activeLayers,
  clearActiveLayers,
  removeActiveLayer,
}) => {    
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleVisibilityToggle = () => {
        setSentinelVisible(!sentinelVisible);
    };

    const handleOpacityChange = (e) => {
        setSentinelOpacity(Number(e.target.value));
    };

    const handleBandChange = (e) => {
        setSelectedBands(e.target.value);
    };


    return (
    <div className={styles.sentinelControls}>
      <div className={styles.sentinelControls__header}>
        <div className={styles.sentinelControls__visibility}>
          <button
            className={`${styles.sentinelControls__toggleBtn} ${
              sentinelVisible
                ? styles["sentinelControls__toggleBtn--active"]
                : ""
            }`}
            onClick={handleVisibilityToggle}
          >
            {sentinelVisible ? <Eye size={18} /> : <EyeOff size={18} />}
            <span>Sentinel-2</span>
          </button>
        </div>
      </div>

      {sentinelVisible && (
        <div className={styles.sentinelControls__content}>
          {/* Navigation Tabs */}
          <div className={styles.sentinelControls__tabs}>
            <button
              className={`${styles.sentinelControls__tab} ${
                activeSection === "search"
                  ? styles["sentinelControls__tab--active"]
                  : ""
              }`}
              onClick={() => setActiveSection("search")}
            >
              <Search size={16} />
              Искать
            </button>
            <button
              className={`${styles.sentinelControls__tab} ${
                activeSection === "results"
                  ? styles["sentinelControls__tab--active"]
                  : ""
              }`}
              onClick={() => setActiveSection("results")}
              disabled={searchResults.length === 0}
              style={{whiteSpace: 'nowrap'}}
            >
              <Database size={16} />
              Результаты ({searchResults.length})
            </button>
            <button
              className={`${styles.sentinelControls__tab} ${
                activeSection === "layers"
                  ? styles["sentinelControls__tab--active"]
                  : ""
              }`}
              onClick={() => setActiveSection("layers")}
              disabled={activeLayers.length === 0}
            >
              <Layers size={16} />
              Слои ({activeLayers.length})
            </button>
          </div>

          {/* Search Section */}
          {activeSection === "search" && (
            <div className={styles.sentinelControls__searchSection}>
              <div className={styles.sentinelControls__section}>
                <label className={styles.sentinelControls__label}>
                  Прозрачность: {sentinelOpacity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sentinelOpacity}
                  onChange={handleOpacityChange}
                  className={styles.sentinelControls__slider}
                />
              </div>

              <div className={styles.sentinelControls__section}>
                <label className={styles.sentinelControls__label}>
                  Комбинация каналов
                </label>
                <select
                  value={selectedBands}
                  onChange={handleBandChange}
                  className={styles.sentinelControls__select}
                >
                  {bandOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.sentinelControls__dateSection}>
                <div className={styles.sentinelControls__dateGroup}>
                  <label className={styles.sentinelControls__label}>
                    <Calendar size={16} />
                    Дата начала
                  </label>
                  <input
                    type="date"
                    lang="ru"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={styles.sentinelControls__dateInput}
                    max={endDate || undefined}
                  />
                </div>

                <div className={styles.sentinelControls__dateGroup}>
                  <label className={styles.sentinelControls__label}>
                    <Calendar size={16} />
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    lang="ru"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={styles.sentinelControls__dateInput}
                    min={startDate || undefined}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {error && (
                <div className={styles.sentinelControls__error}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                className={styles.sentinelControls__searchBtn}
                onClick={handleSearchSentinelData}
                disabled={isLoading || !startDate || !endDate}
              >
                <Search size={16} />
                {isLoading ? "Поиск..." : "Поиск данных Sentinel-2"}
              </button>
            </div>
          )}

          {/* Results Section */}
          {activeSection === "results" && searchResults.length > 0 && (
            <div className={styles.sentinelControls__resultsSection}>
              <div className={styles.sentinelControls__resultsList}>
                {searchResults.map((result) => (
                  <div key={result.Id} className={styles.resultCard}>
                    <div className={styles.resultCard__header}>
                      <div className={styles.resultCard__info}>
                        <span className={styles.resultCard__date}>
                          {formatDate(result.ContentDate?.beginPosition)}
                        </span>
                        <div className={styles.resultCard__cloudBadge}>
                          <Cloud
                            size={14}
                            style={{
                              color: getCloudCoverColor(
                                result.CloudCoverPercentage
                              ),
                            }}
                          />
                          <span
                            style={{
                              color: getCloudCoverColor(
                                result.CloudCoverPercentage
                              ),
                            }}
                          >
                            {result.CloudCoverPercentage?.toFixed(1) || "N/A"}%
                          </span>
                          <span className={styles.resultCard__cloudLabel}>
                            {getCloudCoverLabel(result.CloudCoverPercentage)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.resultCard__actions}>
                        <button
                          className={styles.resultCard__infoBtn}
                          onClick={() => showProductDetails(setSelectedProduct, selectedProduct, result)}
                          title="Подробнее"
                        >
                          <Info size={14} />
                        </button>
                        <button
                          className={styles.resultCard__addBtn}
                          onClick={() => addToMap(result)}
                          title="Добавить на карту"
                        >
                          <MapPin size={14} />
                          Add
                        </button>
                      </div>
                    </div>

                    {selectedProduct?.Id === result.Id && (
                      <ProductMetadata product={result} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Layers Section */}
          {activeSection === "layers" && activeLayers.length > 0 && (
            <div className={styles.sentinelControls__layersSection}>
              <div className={styles.sentinelControls__layersHeader}>
                <button
                  className={styles.sentinelControls__clearBtn}
                  onClick={() => clearActiveLayers()}
                  disabled={activeLayers.length === 0}
                >
                  <Trash2 size={16} />
                  Очистить всё ({activeLayers.length})
                </button>
              </div>
              <div className={styles.sentinelControls__layersList}>
                {activeLayers.map((layer, index) => (
                  <LayerCard key={layer.id} layer={layer} index={index} 
                    bandOptions={bandOptions} toggleLayerVisibility={toggleLayerVisibility}
                    removeActiveLayer={removeActiveLayer}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SentinelControlsContainer;