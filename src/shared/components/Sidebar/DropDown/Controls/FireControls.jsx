import { useState, useCallback, useEffect } from 'react';
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
  setAutoRefresh,
  fireLength,
  setDateHasChanged,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasDateChanges, setHasDateChanges] = useState(false);

  const maxDaysDifference = 14;

  const handleToggleLayer = useCallback(() => {
    setFireLayerVisible(!fireLayerVisible);
  }, [fireLayerVisible, setFireLayerVisible]);

  const handleOpacityChange = useCallback((e) => {
    setFireOpacity(Number(e.target.value));
  }, [setFireOpacity]);

  const handleIntensityFilterChange = useCallback((e) => {
    setFireIntensityFilter(e.target.value);
  }, [setFireIntensityFilter]);

  const isWithinRange = (date1, date2) => {
    if (!date1 || !date2) return true;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= maxDaysDifference;
  };

  const handleStartDateChange = useCallback((e) => {
    const newStartDate = e.target.value;
    
    if (fireEndDate && !isWithinRange(newStartDate, fireEndDate)) {
      alert('Maximum difference between dates is 14 days.');
      return;
    }
    
    setFireStartDate(newStartDate);
    setHasDateChanges(true);
  }, [fireEndDate, setFireStartDate]);

  const handleEndDateChange = useCallback((e) => {
    const newEndDate = e.target.value;

    if (fireStartDate && !isWithinRange(fireStartDate, newEndDate)) {
      alert('Maximum difference between dates is 14 days.');
      return;
    }
    
    setFireEndDate(newEndDate);
    setHasDateChanges(true);
  }, [fireStartDate, setFireEndDate]);

  useEffect(() => {
    console.log('fireStartDate changed:', fireStartDate);
  }, [fireStartDate]);

  useEffect(() => {
    console.log('fireEndDate changed:', fireEndDate);
  }, [fireEndDate]);

  const handleHeatmapToggle = useCallback(() => {
    setFireHeatmapMode(!fireHeatmapMode);
  }, [fireHeatmapMode, setFireHeatmapMode]);

  const handleAutoRefreshToggle = useCallback(() => {
    setAutoRefresh(!autoRefresh);
  }, [autoRefresh, setAutoRefresh]);

  const getMaxEndDate = useCallback(() => {
    if (!fireStartDate) return today;
    const startDate = new Date(fireStartDate);
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(startDate.getDate() + maxDaysDifference);
    // Don't exceed today's date
    const maxDate = new Date(Math.min(maxEndDate.getTime(), new Date(today).getTime()));
    return maxDate.toISOString().split('T')[0];
  }, [fireStartDate]);

  const getMinStartDate = useCallback(() => {
    if (!fireEndDate) return '';
    const endDate = new Date(fireEndDate);
    const minStartDate = new Date(endDate);
    minStartDate.setDate(endDate.getDate() - maxDaysDifference);
    return minStartDate.toISOString().split('T')[0];
  }, [fireEndDate]);

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
          // disabled={!fireLayerVisible}
        >
          <Sliders size={14} />
        </button>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
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
            </div>
          </div>

          {/* Date Range */}
          <div className={styles.fireControls__section}>
            <label className={styles.fireControls__label}>
              <Calendar size={12} />
              Date Range (max 14 days)
            </label>
            <div className={styles.fireControls__dateInputs}>
              <input
                type="date"
                value={fireStartDate || lastWeek}
                onChange={handleStartDateChange}
                max={getMaxEndDate()}
                min={getMinStartDate()}
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
            {/* Update Button */}
            <button
              onClick={setDateHasChanged}
              disabled={!hasDateChanges}
              className={`${styles.fireControls__updateBtn} ${
                hasDateChanges ? styles.fireControls__updateBtn_active : ''
              }`}
              title="Update fire data with new date range"
            >
              <RefreshCw 
                size={14} 
                // className={isLoadingFires ? styles.fireControls__spinning : ''}
              />
              Update Data
            </button>
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
            {/* Commented out sections remain the same */}
          </div>

          {/* Stats Display */}
          <div className={styles.fireControls__stats}>
            <div className={styles.fireControls__stat}>
              <span className={styles.fireControls__statLabel}>Active Points:</span>
              <span className={styles.fireControls__statValue}>{fireLength}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FireControls;