import { useState } from "react";
import {
  Calendar, Eye, EyeOff, Layers, Search, MapPin, Info,
  AlertCircle, Trash2, Cloud, Database,
} from "lucide-react";
import ProductMetadata from './ProductMetadata';
import LayerCard from "./LayerCard";
import useSentinelStore from "../../../../../app/store/sentinelStore";
import { 
  searchSentinelData, formatDate, getCloudCoverLabel, getCloudCoverColor
 } from "src/utils/sentinelUtils";
import styles from "./SentinelControls.module.scss";

const SentinelControls = ({ productType }) => {

  const {
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
    setSearchResults,
    isLoading,
    setIsLoading,
    activeLayers,
    addActiveLayer,
    clearActiveLayers,
    removeActiveLayer,
  } = useSentinelStore();

  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeSection, setActiveSection] = useState("search"); // 'search', 'results', 'layers'

  const bandOptions = [
    {
      value: "true-color",
      label: "True Color (RGB)",
      icon: "🌍",
      description: "Natural color composite",
    },
    {
      value: "false-color",
      label: "False Color (NIR-R-G)",
      icon: "🌿",
      description: "Vegetation analysis",
    },
    {
      value: "ndvi",
      label: "NDVI (Vegetation)",
      icon: "🌱",
      description: "Normalized Difference Vegetation Index",
    },
    {
      value: "ndwi",
      label: "NDWI (Water)",
      icon: "💧",
      description: "Water body detection",
    },
    {
      value: "ndbr",
      label: "NDBR (Burn Ratio)",
      icon: "🔥",
      description: "Burn severity mapping",
    },
    {
      value: "methane",
      label: "Methane",
      icon: "💨",
      description: "Atmospheric methane visualization",
    },
  ];

  const handleVisibilityToggle = () => {
    setSentinelVisible(!sentinelVisible);
  };

  const handleOpacityChange = (e) => {
    setSentinelOpacity(Number(e.target.value));
  };

  const handleBandChange = (e) => {
    setSelectedBands(e.target.value);
  };

  const handleSearchSentinelData = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);

    if (daysDiff < 0) {
      setError("End date must be after start date");
      return;
    }

    if (daysDiff > 365) {
      setError("Date range cannot exceed 1 year");
      return;
    }

    setError(null);
    setIsLoading(true);
    setSearchResults([]);
    setActiveSection("results");

    try {
      const bbox = null;
      const isBandMethane = selectedBands === "methane";
      console.log(isBandMethane, selectedBands);
      const data = await searchSentinelData(
        startDate,
        endDate,
        bbox,
        10,
        isBandMethane
      );
      setSearchResults(data.value || []);

      if (data.value?.length === 0) {
        setError("No Sentinel-2 images found for the specified criteria");
      }
    } catch (error) {
      console.error("Error searching Sentinel data:", error);
      setError(`Search failed: ${error.message}`);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToMap = (product) => {
    if (!startDate || !endDate) {
      setError("Please set date range first");
      return;
    }

    const layerId = `sentinel_${product.Id}_${selectedBands}_${Date.now()}`;

    const layerConfig = {
      id: layerId,
      bands: selectedBands,
      startDate,
      endDate,
      opacity: sentinelOpacity / 100,
      productId: product.Id,
      name: product.Name,
      cloudCover: product.CloudCoverPercentage,
      visible: true,
      acquisitionDate: product.ContentDate?.beginPosition,
    };

    console.log(layerConfig);

    addActiveLayer(layerConfig);
    setSentinelVisible(true);
    setError(null);
    setActiveSection("layers");
  };

  const showProductDetails = (product) => {
    setSelectedProduct(selectedProduct?.Id === product.Id ? null : product);
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
            <span>Sentinel-2 Layer</span>
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
              Search
            </button>
            <button
              className={`${styles.sentinelControls__tab} ${
                activeSection === "results"
                  ? styles["sentinelControls__tab--active"]
                  : ""
              }`}
              onClick={() => setActiveSection("results")}
              disabled={searchResults.length === 0}
            >
              <Database size={16} />
              Results ({searchResults.length})
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
              Layers ({activeLayers.length})
            </button>
          </div>

          {/* Search Section */}
          {activeSection === "search" && (
            <div className={styles.sentinelControls__searchSection}>
              <div className={styles.sentinelControls__section}>
                <label className={styles.sentinelControls__label}>
                  Opacity: {sentinelOpacity}%
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
                  Band Combination
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
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={styles.sentinelControls__dateInput}
                    max={endDate || undefined}
                  />
                </div>

                <div className={styles.sentinelControls__dateGroup}>
                  <label className={styles.sentinelControls__label}>
                    <Calendar size={16} />
                    End Date
                  </label>
                  <input
                    type="date"
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
                {isLoading ? "Searching..." : "Search Sentinel-2 Data"}
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
                          onClick={() => showProductDetails(result)}
                          title="Show details"
                        >
                          <Info size={14} />
                        </button>
                        <button
                          className={styles.resultCard__addBtn}
                          onClick={() => addToMap(result)}
                          title="Add to map"
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
                  Clear All ({activeLayers.length})
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

export default SentinelControls;
