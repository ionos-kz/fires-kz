// src/shared/components/Sidebar/DropDown/SentinelControls.jsx
import { useState } from 'react';
import { Calendar, Eye, EyeOff, Layers, Search, MapPin } from 'lucide-react';
import useSentinelStore from '../../../../app/store/sentinelStore';
import { searchSentinelData } from 'src/utils/sentinelUtils';
import styles from './SentinelControls.module.scss';

const SentinelControls = () => {
  const {
    sentinelVisible,
    sentinelOpacity,
    selectedBands,
    startDate,
    endDate,
    cloudCoverage,
    searchResults,
    isLoading,
    activeLayers,
    setSentinelVisible,
    setSentinelOpacity,
    setSelectedBands,
    setStartDate,
    setEndDate,
    setCloudCoverage,
    setSearchResults,
    setIsLoading,
    addActiveLayer,
    clearActiveLayers
  } = useSentinelStore();

  const bandOptions = [
    { value: 'true-color', label: 'True Color' },
    { value: 'false-color', label: 'False Color' },
    { value: 'ndvi', label: 'NDVI' },
    { value: 'ndwi', label: 'NDWI' },
    { value: 'ndbr', label: 'NDBR' }
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
      alert('Please select both start and end dates');
      return;
    }

    setIsLoading(true);
    try {
      const data = await searchSentinelData(startDate, endDate);
      setSearchResults(data.value || []);
    } catch (error) {
      console.error('Error searching Sentinel data:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToMap = (productId) => {
    if (!startDate || !endDate) {
      alert('Please set date range first');
      return;
    }

    const layerConfig = {
      id: productId,
      bands: selectedBands,
      startDate,
      endDate,
      opacity: sentinelOpacity / 100
    };

    addActiveLayer(layerConfig);
    setSentinelVisible(true);
  };

  return (
    <div className={styles.sentinelControls}>
      <div className={styles.sentinelControls__header}>
        <div className={styles.sentinelControls__visibility}>
          <button
            className={`${styles.sentinelControls__toggleBtn} ${
              sentinelVisible ? styles['sentinelControls__toggleBtn--active'] : ''
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
              {bandOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
              />
            </div>
          </div>

          <div className={styles.sentinelControls__section}>
            <button 
              className={styles.sentinelControls__searchBtn}
              onClick={() => clearActiveLayers()}
              style={{ backgroundColor: '#ff4444', marginBottom: '10px' }}
            >
              Clear All Layers ({activeLayers.length})
            </button>
          </div>

          <button 
            className={styles.sentinelControls__searchBtn}
            onClick={handleSearchSentinelData}
            disabled={isLoading}
          >
            <Search size={16} />
            {isLoading ? 'Searching...' : 'Search Data'}
          </button>

          {searchResults.length > 0 && (
            <div className={styles.sentinelControls__results}>
              <h4 className={styles.sentinelControls__resultsTitle}>
                Search Results ({searchResults.length})
              </h4>
              <div className={styles.sentinelControls__resultsList}>
                {searchResults.slice(0, 5).map((result, index) => (
                  <div key={index} className={styles.sentinelControls__resultItem}>
                    <div className={styles.sentinelControls__resultInfo}>
                      <span className={styles.sentinelControls__resultDate}>
                        {result.ContentDate?.beginPosition?.split('T')[0] || 'Unknown date'}
                      </span>
                      <span className={styles.sentinelControls__resultCloud}>
                        Cloud: {result.CloudCoverPercentage || 'N/A'}%
                      </span>
                    </div>
                    <button
                      className={styles.sentinelControls__addBtn}
                      onClick={() => addToMap(result.Id)}
                    >
                      <MapPin size={14} />
                      Add
                    </button>
                  </div>
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