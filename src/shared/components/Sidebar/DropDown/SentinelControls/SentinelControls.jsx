import { useState } from "react";
import useSentinelStore from "../../../../../app/store/sentinelStore";
import { searchSentinelData } from "src/utils/sentinelUtils";
import SentinelControlsContainer from "./SentinelControlsContainer";

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
  ];

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
        productType,
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

  const setActiveSectionHandler = (section) => {
    setActiveSection(section);
    setError(null); // Clear errors when switching sections
  };

  return (
    <SentinelControlsContainer 
      // Handlers
      handleSearchSentinelData={handleSearchSentinelData}
      addToMap={addToMap}
      setActiveSection={setActiveSectionHandler}
      
      // State
      error={error}
      activeSection={activeSection}
      
      // Configuration
      bandOptions={bandOptions}
      
      // Store values
      sentinelVisible={sentinelVisible}
      setSentinelVisible={setSentinelVisible}
      toggleLayerVisibility={toggleLayerVisibility}
      sentinelOpacity={sentinelOpacity}
      setSentinelOpacity={setSentinelOpacity}
      selectedBands={selectedBands}
      setSelectedBands={setSelectedBands}
      startDate={startDate}
      endDate={endDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
      searchResults={searchResults}
      isLoading={isLoading}
      activeLayers={activeLayers}
      clearActiveLayers={clearActiveLayers}
      removeActiveLayer={removeActiveLayer}
    />
  );
};

export default SentinelControls;