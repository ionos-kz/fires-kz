import React, { useState, useCallback } from 'react';
import { 
  Flame, 
  Calendar, 
  Sliders, 
  Eye, 
  EyeOff, 
  MapPin,
  Filter,
  RefreshCw
} from 'lucide-react';
import styles from './FireControls.module.scss';

const FireControls = ({ 
  fireLayerVisible = false,
  setFireLayerVisible,
  fireOpacity = 100,
  setFireOpacity,
  fireIntensityFilter = 'all',
  setFireIntensityFilter,
  fireStartDate = '',
  fireEndDate = '',
  setFireStartDate,
  setFireEndDate,
  fireHeatmapMode = false,
  setFireHeatmapMode,
  autoRefresh = false,
  setAutoRefresh
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleLayer = useCallback(() => {
    setFireLayerVisible(!fireLayerVisible);
  }, [fireLayerVisible, setFireLayerVisible]);

  const handleOpacityChange = useCallback((e) => {
    setFireOpacity(Number(e.target.value));
  }, [setFireOpacity]);

  const handleIntensityFilterChange = useCallback((e) => {
    setFireIntensityFilter(e.target.value);
  }, [setFireIntensityFilter]);

  const handleStartDateChange = useCallback((e) => {
    setFireStartDate(e.target.value);
  }, [setFireStartDate]);

  const handleEndDateChange = useCallback((e) => {
    setFireEndDate(e.target.value);
  }, [setFireEndDate]);

  const handleHeatmapToggle = useCallback(() => {
    setFireHeatmapMode(!fireHeatmapMode);
  }, [fireHeatmapMode, setFireHeatmapMode]);

  const handleAutoRefreshToggle = useCallback(() => {
    setAutoRefresh(!autoRefresh);
  }, [autoRefresh, setAutoRefresh]);

  const today = new Date().toISOString().split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className={styles.fireControls}>
      {/* Main Layer Toggle */}
      <div className={styles.fireControls__header}>
        <div className={styles.fireControls__toggle} onClick={handleToggleLayer}>
          <div className={styles.fireControls__toggleIcon}>
            {fireLayerVisible ? (
              <Eye size={16} className={styles.fireControls__iconActive} />
            ) : (
              <EyeOff size={16} className={styles.fireControls__iconInactive} />
            )}
          </div>
          <span className={styles.fireControls__toggleLabel}>
            Fire Pinpoints Layer
          </span>
          <Flame 
            size={16} 
            className={`${styles.fireControls__flameIcon} ${
              fireLayerVisible ? styles.fireControls__flameIcon_active : ''
            }`}
          />
        </div>
        
        <button 
          className={`${styles.fireControls__expandBtn} ${
            isExpanded ? styles.fireControls__expandBtn_expanded : ''
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!fireLayerVisible}
        >
          <Sliders size={14} />
        </button>
      </div>

      {/* Expanded Controls */}
      {isExpanded && fireLayerVisible && (
        <div className={styles.fireControls__content}>
          
          {/* Opacity Control */}
          <div className={styles.fireControls__section}>
            <label className={styles.fireControls__label}>
              <MapPin size={12} />
              Opacity: {fireOpacity}%
            </label>
            <div className={styles.fireControls__sliderContainer}>
              <input
                type="range"
                min="0"
                max="100"
                value={fireOpacity}
                onChange={handleOpacityChange}
                className={styles.fireControls__slider}
              />
              {/* <div className={styles.fireControls__sliderTrack}>
                <div 
                  className={styles.fireControls__sliderFill}
                  style={{ width: `${fireOpacity}%` }}
                />
              </div> */}
            </div>
          </div>

          {/* Date Range */}
          <div className={styles.fireControls__section}>
            <label className={styles.fireControls__label}>
              <Calendar size={12} />
              Date Range
            </label>
            <div className={styles.fireControls__dateInputs}>
              <input
                type="date"
                value={fireStartDate || lastWeek}
                onChange={handleStartDateChange}
                max={today}
                className={styles.fireControls__dateInput}
                placeholder="Start Date"
              />
              <span className={styles.fireControls__dateSeparator}>to</span>
              <input
                type="date"
                value={fireEndDate || today}
                onChange={handleEndDateChange}
                max={today}
                min={fireStartDate || lastWeek}
                className={styles.fireControls__dateInput}
                placeholder="End Date"
              />
            </div>
          </div>

          {/* Intensity Filter */}
          <div className={styles.fireControls__section}>
            <label className={styles.fireControls__label}>
              <Filter size={12} />
              Fire Intensity
            </label>
            <select
              value={fireIntensityFilter}
              onChange={handleIntensityFilterChange}
              className={styles.fireControls__select}
            >
              <option value="all">All Intensities</option>
              <option value="low">Low (0-30)</option>
              <option value="medium">Medium (30-60)</option>
              <option value="high">High (60-80)</option>
              <option value="extreme">Extreme (80+)</option>
            </select>
          </div>

          {/* Display Mode Toggles */}
          <div className={styles.fireControls__section}>
            <div className={styles.fireControls__toggleRow}>
              <label className={styles.fireControls__checkboxLabel}>
                <input
                  type="checkbox"
                  checked={fireHeatmapMode}
                  onChange={handleHeatmapToggle}
                  className={styles.fireControls__checkbox}
                />
                <span className={styles.fireControls__checkboxCustom}></span>
                Heatmap Mode
              </label>
            </div>
            
            <div className={styles.fireControls__toggleRow}>
              <label className={styles.fireControls__checkboxLabel}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={handleAutoRefreshToggle}
                  className={styles.fireControls__checkbox}
                />
                <span className={styles.fireControls__checkboxCustom}></span>
                <RefreshCw size={12} />
                Auto Refresh (5min)
              </label>
            </div>
          </div>

          {/* Stats Display */}
          <div className={styles.fireControls__stats}>
            <div className={styles.fireControls__stat}>
              <span className={styles.fireControls__statLabel}>Active Fires:</span>
              <span className={styles.fireControls__statValue}>1,247</span>
            </div>
            <div className={styles.fireControls__stat}>
              <span className={styles.fireControls__statLabel}>Last Updated:</span>
              <span className={styles.fireControls__statValue}>2 min ago</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FireControls;