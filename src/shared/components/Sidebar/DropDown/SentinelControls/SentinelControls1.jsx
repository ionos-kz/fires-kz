import { useState } from "react";
import {
  Calendar,
  Eye,
  EyeOff,
  Layers,
  Search,
  MapPin,
  Info,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Satellite,
  Cloud,
  Calendar as CalendarIcon,
  Database,
  Settings,
  Image,
} from "lucide-react";
import useSentinel1Store from "../../../../../app/store/sentinel1Store";
import { searchSentinelData, formatDate } from "src/utils/sentinelUtils1";
import styles from "./SentinelControls.module.scss";

const SentinelControls1 = () => {
  const {
    sentinel1Visible,
    sentinel1Opacity,
    selectedBands1,
    startDate,
    endDate,
    searchResults,
    isLoading,
    activeLayers1,
    setSentinel1Visible,
    setSentinel1Opacity,
    setSelectedBands1,
    setStartDate,
    setEndDate,
    setSearchResults,
    setIsLoading,
    addActiveLayer1,
    clearActiveLayers1,
    removeActiveLayer1,
    toggleLayerVisibility,
  } = useSentinel1Store();

  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expandedLayers, setExpandedLayers] = useState(new Set());
  const [activeSection, setActiveSection] = useState("search");

  const bandOptions = [
    {
      value: "OLCI-TRUE",
      label: "OLCI-TRUE",
      icon: "🌍",
      description: "Nitrogen Dioxide",
    },
  ];

  const handleVisibilityToggle1 = () => {
    setSentinel1Visible(!sentinel1Visible);
  };

  const handleOpacityChange = (e) => {
    setSentinel1Opacity(Number(e.target.value));
  };

  const handleBandChange = (e) => {
    setSelectedBands1(e.target.value);
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

    if (daysDiff > 161) {
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

    const layerId = `sentinel_${product.Id}_${1}_${Date.now()}`;

    const layerConfig = {
      id: layerId,
      bands: selectedBands1,
      startDate,
      endDate,
      opacity: sentinel1Opacity / 100,
      productId: product.Id,
      name: product.Name,
      cloudCover: product.CloudCoverPercentage,
      visible: true,
      acquisitionDate: product.ContentDate?.beginPosition,
    };
    console.log(layerConfig);

    addActiveLayer1(layerConfig);
    setSentinel1Visible(true);
    setError(null);
    setActiveSection("layers");
  };

  const toggleLayerVisibilityHandler = (layerId) => {
    toggleLayerVisibility(layerId);
  };

  const removeLayer = (layerId) => {
    removeActiveLayer1(layerId);
    setExpandedLayers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(layerId);
      return newSet;
    });
  };

  const toggleLayerExpansion = (layerId) => {
    setExpandedLayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
  };

  const showProductDetails = (product) => {
    setSelectedProduct(selectedProduct?.Id === product.Id ? null : product);
  };

  const getCloudCoverColor = (cloudCover) => {
    if (cloudCover <= 10) return "#10b981"; // Emerald
    if (cloudCover <= 10) return "#f19e0b"; // Amber
    if (cloudCover <= 60) return "#ef4444"; // Red
    return "#7c2d12"; // Dark red
  };

  const getCloudCoverLabel = (cloudCover) => {
    if (cloudCover <= 10) return "Excellent";
    if (cloudCover <= 10) return "Good";
    if (cloudCover <= 60) return "Fair";
    return "Poor";
  };

  const getBandInfo = (bandValue) => {
    return (
      bandOptions.find((option) => option.value === bandValue) || {
        label: bandValue,
        icon: "📡",
      }
    );
  };

  const ProductMetadata = ({ product }) => (
    <div className={styles.metadata}>
      <div className={styles.metadata__grid}>
        <div className={styles.metadata__item}>
          <div className={styles.metadata__icon}>
            <Satellite size={16} />
          </div>
          <div className={styles.metadata__content}>
            <span className={styles.metadata__label}>Platform</span>
            <span className={styles.metadata__value}>
              {product.Platform || "N/A"}
            </span>
          </div>
        </div>

        <div className={styles.metadata__item}>
          <div className={styles.metadata__icon}>
            <Database size={16} />
          </div>
          <div className={styles.metadata__content}>
            <span className={styles.metadata__label}>Product Type</span>
            <span className={styles.metadata__value}>
              {product.ProductType || "N/A"}
            </span>
          </div>
        </div>

        <div className={styles.metadata__item}>
          <div className={styles.metadata__icon}>
            <Settings size={16} />
          </div>
          <div className={styles.metadata__content}>
            <span className={styles.metadata__label}>Processing Level</span>
            <span className={styles.metadata__value}>
              {product.ProcessingLevel || "N/A"}
            </span>
          </div>
        </div>

        <div className={styles.metadata__item}>
          <div className={styles.metadata__icon}>
            <CalendarIcon size={16} />
          </div>
          <div className={styles.metadata__content}>
            <span className={styles.metadata__label}>Ingestion Date</span>
            <span className={styles.metadata__value}>
              {formatDate(product.IngestionDate)}
            </span>
          </div>
        </div>

        <div className={styles.metadata__item}>
          <div className={styles.metadata__icon}>
            <span className={styles.metadata__orbitIcon}>🛰️</span>
          </div>
          <div className={styles.metadata__content}>
            <span className={styles.metadata__label}>Orbit Number</span>
            <span className={styles.metadata__value}>
              {product.OrbitNumber || "N/A"}
            </span>
          </div>
        </div>

        <div className={styles.metadata__item}>
          <div className={styles.metadata__icon}>
            <span className={styles.metadata__tileIcon}>🗂️</span>
          </div>
          <div className={styles.metadata__content}>
            <span className={styles.metadata__label}>Tile ID</span>
            <span className={styles.metadata__value}>
              {product.TileId || "N/A"}
            </span>
          </div>
        </div>

        {/* {product.Size && (
          <div className={styles.metadata__item}>
            <div className={styles.metadata__icon}>
              <span className={styles.metadata__sizeIcon}>💾</span>
            </div>
            <div className={styles.metadata__content}>
              <span className={styles.metadata__label}>File Size</span>
              <span className={styles.metadata__value}>{formatFileSize(product.Size)}</span>
            </div>
          </div>
        )} */}
      </div>

      {product.ThumbnailUrl && (
        <div className={styles.metadata__thumbnail}>
          <div className={styles.metadata__thumbnailHeader}>
            <Image size={16} />
            <span>Preview</span>
          </div>
          <img
            src={product.ThumbnailUrl}
            alt="Product thumbnail"
            className={styles.metadata__thumbnailImage}
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      )}
    </div>
  );

  const LayerCard = ({ layer, index }) => {
    const bandInfo = getBandInfo(layer.bands);
    const isExpanded = expandedLayers.has(layer.id);

    return (
      <div className={styles.layerCard}>
        <div className={styles.layerCard__header}>
          <div className={styles.layerCard__info}>
            <div className={styles.layerCard__bandInfo}>
              <span className={styles.layerCard__bandIcon}>
                {bandInfo.icon}
              </span>
              <span className={styles.layerCard__bandName}>
                {bandInfo.label}
              </span>
            </div>
            <div className={styles.layerCard__details}>
              <span className={styles.layerCard__date}>
                {formatDate(layer.acquisitionDate)}
              </span>
              {layer.cloudCover !== undefined && (
                <div className={styles.layerCard__cloudBadge}>
                  <Cloud
                    size={12}
                    style={{ color: getCloudCoverColor(layer.cloudCover) }}
                  />
                  <span style={{ color: getCloudCoverColor(layer.cloudCover) }}>
                    {layer.cloudCover.toFixed(1)}%
                  </span>
                  <span className={styles.layerCard__cloudLabel}>
                    {getCloudCoverLabel(layer.cloudCover)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className={styles.layerCard__actions}>
            <button
              className={`${styles.layerCard__actionBtn} ${
                layer.visible ? styles["layerCard__actionBtn--active"] : ""
              }`}
              onClick={() => toggleLayerVisibilityHandler(layer.id)}
              title={layer.visible ? "Hide layer" : "Show layer"}
            >
              {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button
              className={styles.layerCard__actionBtn}
              onClick={() => toggleLayerExpansion(layer.id)}
              title="Toggle details"
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              className={`${styles.layerCard__actionBtn} ${styles.layerCard__actionBtn}--danger`}
              onClick={() => removeLayer(layer.id)}
              title="Remove layer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className={styles.layerCard__expandedContent}>
            <div className={styles.layerCard__properties}>
              <div className={styles.layerCard__property}>
                <span className={styles.layerCard__propertyLabel}>
                  Date Range:
                </span>
                <span className={styles.layerCard__propertyValue}>
                  {layer.startDate} → {layer.endDate}
                </span>
              </div>
              <div className={styles.layerCard__property}>
                <span className={styles.layerCard__propertyLabel}>
                  Opacity:
                </span>
                <span className={styles.layerCard__propertyValue}>
                  {Math.round(layer.opacity * 100)}%
                </span>
              </div>
              <div className={styles.layerCard__property}>
                <span className={styles.layerCard__propertyLabel}>
                  Product ID:
                </span>
                <span
                  className={styles.layerCard__propertyValue}
                  title={layer.productId}
                >
                  {layer.productId?.substring(0, 20)}...
                </span>
              </div>
            </div>
            {bandInfo.description && (
              <div className={styles.layerCard__description}>
                <span className={styles.layerCard__descriptionLabel}>
                  Band Info:
                </span>
                <span className={styles.layerCard__descriptionText}>
                  {bandInfo.description}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.sentinelControls}>
      <div className={styles.sentinelControls__header}>
        <div className={styles.sentinelControls__visibility}>
          <button
            className={`${styles.sentinelControls__toggleBtn} ${
              sentinel1Visible
                ? styles["sentinelControls__toggleBtn--active"]
                : ""
            }`}
            onClick={handleVisibilityToggle1}
          >
            {sentinel1Visible ? <Eye size={18} /> : <EyeOff size={18} />}
            <span>Sentinel-3 Layer</span>
          </button>
        </div>
      </div>

      {sentinel1Visible && (
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
              disabled={activeLayers1.length === 0}
            >
              <Layers size={16} />
              Layers ({activeLayers1.length})
            </button>
          </div>

          {/* Search Section */}
          {activeSection === "search" && (
            <div className={styles.sentinelControls__searchSection}>
              <div className={styles.sentinelControls__section}>
                <label className={styles.sentinelControls__label}>
                  Opacity: {sentinel1Opacity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sentinel1Opacity}
                  onChange={handleOpacityChange}
                  className={styles.sentinelControls__slider}
                />
              </div>

              <div className={styles.sentinelControls__section}>
                <label className={styles.sentinelControls__label}>
                  Band Combination
                </label>
                <select
                  value={selectedBands1}
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
                {searchResults.map((result, index) => (
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
          {activeSection === "layers" && activeLayers1.length > 0 && (
            <div className={styles.sentinelControls__layersSection}>
              <div className={styles.sentinelControls__layersHeader}>
                <button
                  className={styles.sentinelControls__clearBtn}
                  onClick={() => clearActiveLayers1()}
                  disabled={activeLayers1.length === 0}
                >
                  <Trash2 size={16} />
                  Clear All ({activeLayers1.length})
                </button>
              </div>
              <div className={styles.sentinelControls__layersList}>
                {activeLayers1.map((layer, index) => (
                  <LayerCard key={layer.id} layer={layer} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SentinelControls1;
