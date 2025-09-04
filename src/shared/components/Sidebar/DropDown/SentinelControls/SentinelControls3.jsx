import { useState } from "react";
import {
  Calendar, Eye, EyeOff, Layers, Search, MapPin, Info,
  AlertCircle, Trash2, Cloud, Database,
} from "lucide-react";
import ProductMetadata from './ProductMetadata';
import LayerCard from "./LayerCard";
import useSentinel3Store from "../../../../../app/store/sentinel3Store";
import { 
  searchSentinelData, formatDate, getCloudCoverLabel, getCloudCoverColor
 } from "src/utils/sentinelUtils";
import styles from "./SentinelControls.module.scss";


const SentinelControls3 = () => {
  const {
    sentinel3Visible,
    sentinel3Opacity,
    selectedBands3,
    startDate,
    endDate,
    searchResults,
    isLoading,
    activeLayers3,
    setSentinel3Visible,
    setSentinel3Opacity,
    setSelectedBands3,
    setStartDate,
    setEndDate,
    setSearchResults,
    setIsLoading,
    addActiveLayer3,
    clearActiveLayers3,
    removeActiveLayer3,
    toggleLayerVisibility,
  } = useSentinel3Store();

  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeSection, setActiveSection] = useState("search");

  const bandOptions = [
    {
      value: "IW_VV",
      label: "IW_VV",
      icon: "🌍",
      description: "Natural color composite",
    },
  ];

  const handleVisibilityToggle3 = () => {
    setSentinel3Visible(!sentinel3Visible);
  };

  const handleOpacityChange = (e) => {
    setSentinel3Opacity(Number(e.target.value));
  };

  const handleBandChange = (e) => {
    setSelectedBands3(e.target.value);
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
      const data = await searchSentinelData(startDate, endDate, bbox, 10);
      setSearchResults(data.value || []);

      if (data.value?.length === 0) {
        setError("No Sentinel-3 images found for the specified criteria");
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

    const layerId = `sentinel_${product.Id}_${3}_${Date.now()}`;

    const layerConfig = {
      id: layerId,
      bands: selectedBands3,
      startDate,
      endDate,
      opacity: sentinel3Opacity / 100,
      productId: product.Id,
      name: product.Name,
      cloudCover: product.CloudCoverPercentage,
      visible: true,
      acquisitionDate: product.ContentDate?.beginPosition,
    };
    console.log(layerConfig);

    addActiveLayer3(layerConfig);
    setSentinel3Visible(true);
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
              sentinel3Visible
                ? styles["sentinelControls__toggleBtn--active"]
                : ""
            }`}
            onClick={handleVisibilityToggle3}
          >
            {sentinel3Visible ? <Eye size={18} /> : <EyeOff size={18} />}
            <span>Sentinel-1 Layer</span>
          </button>
        </div>
      </div>

      {sentinel3Visible && (
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
              disabled={activeLayers3.length === 0}
            >
              <Layers size={16} />
              Layers ({activeLayers3.length})
            </button>
          </div>

          {/* Search Section */}
          {activeSection === "search" && (
            <div className={styles.sentinelControls__searchSection}>
              <div className={styles.sentinelControls__section}>
                <label className={styles.sentinelControls__label}>
                  Opacity: {sentinel3Opacity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sentinel3Opacity}
                  onChange={handleOpacityChange}
                  className={styles.sentinelControls__slider}
                />
              </div>

              <div className={styles.sentinelControls__section}>
                <label className={styles.sentinelControls__label}>
                  Band Combination
                </label>
                <select
                  value={selectedBands3}
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
                {isLoading ? "Searching..." : "Search Sentinel-3 Data"}
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
          {activeSection === "layers" && activeLayers3.length > 0 && (
            <div className={styles.sentinelControls__layersSection}>
              <div className={styles.sentinelControls__layersHeader}>
                <button
                  className={styles.sentinelControls__clearBtn}
                  onClick={() => clearActiveLayers3()}
                  disabled={activeLayers3.length === 0}
                >
                  <Trash2 size={16} />
                  Clear All ({activeLayers3.length})
                </button>
              </div>
              <div className={styles.sentinelControls__layersList}>
                {activeLayers3.map((layer, index) => (
                  <LayerCard key={layer.id} layer={layer} index={index} 
                    bandOptions={bandOptions} toggleLayerVisibility={toggleLayerVisibility}
                    removeActiveLayer={removeActiveLayer3}
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

export default SentinelControls3;
