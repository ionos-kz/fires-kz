import { useState, useCallback, useMemo, useEffect } from 'react';
import useFireStore from "src/app/store/fireStore";
import { 
  Flame, 
  Calendar, 
  Sliders, 
  Eye, 
  EyeOff, 
  MapPin,
  Filter,
  RefreshCw,
  BarChart3,
  X,
  TrendingUp,
  Activity,
  Thermometer,
  Clock,
  Wind,
  Target,
  AlertTriangle,
  Download,
  Map,
  History,
} from 'lucide-react';

import './fireControls.scss';
import MapFireControls from './MapFireControls/MapFireControls';
import LinearDateChooser from './LinearDateChooser';

const FireControls = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasDateChanges, setHasDateChanges] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleShowTimeline = useCallback(() => {
    setShowTimeline(true);
  }, []);
  
  const {
    setFireLayerVisible,  
    fireLayerVisible,
    setFireOpacity,  
    fireIntensityFilter,   
    fireStartDate,   
    fireEndDate,     
    setFireStartDate,
    setFireEndDate,
    fireLength,
    setDateHasChanged,
    avgIntensity,
    totalTechnogenicFires,
    totalNaturalFires,
    firesBySatellite,
    avgConfidence,
    firesByConfidence,
    firesByRegion,
    newFiresSinceLastDay,
    setShowTechnogenicOnly,
    selectedRegions,
    setSelectedRegions,
    setShowNaturalOnly,
    selectedModel,
    setSelectedModel,
    firesByModel,  
    confidenceFilter,
    setConfidenceFilter,
    confidenceFilterTimeout,
    setConfidenceFilterTimeout,
  } = useFireStore();
  const fireData = [];

  const [areaTypeFilter, setAreaTypeFilter] = useState("all");
  console.log(firesByRegion)

  const handleAreaTypeFilterChange = (event) => {
    const newValue = event.target.value;
    setAreaTypeFilter(newValue);

    switch (newValue) {
      case 'nature':
        setShowNaturalOnly(true);
        setShowTechnogenicOnly(false);
        break;
      case 'urban':
        setShowNaturalOnly(false);
        setShowTechnogenicOnly(true);
        break;
      default:
        setShowNaturalOnly(false);
        setShowTechnogenicOnly(false);
    }
  };

  const maxDaysDifference = 14;

  const processRegionalFireData = (fireData) => {
    const regionalStats = {};
    
    fireData.forEach(fire => {
      const region = fire.properties.region || 'Unknown';
      const confidence = fire.properties.confidence || 0;
      const satellite = fire.properties.satellite || 'Unknown';
      const technogenic = fire.properties.technogenic || false;
      
      if (!regionalStats[region]) {
        regionalStats[region] = {
          totalFires: 0,
          avgConfidence: 0,
          satellites: {},
          totalTechnogenicFires: 0,
          totalNaturalFires: 0,
          confidenceSum: 0,
          localities: new Set(),
          emergencyDepartment: fire.properties.firedep || 'Unknown'
        };
      }
      
      const stats = regionalStats[region];
      stats.totalFires++;
      stats.confidenceSum += confidence;
      stats.avgConfidence = stats.confidenceSum / stats.totalFires;
      
      // Track satellites
      stats.satellites[satellite] = (stats.satellites[satellite] || 0) + 1;
      
      // Track fire types
      if (technogenic) {
        stats.technogenic++;
      } else {
        stats.natural++;
      }
      
      // Track localities
      if (fire.properties.locality) {
        stats.localities.add(fire.properties.locality);
      }
    });
    
    return regionalStats;
  };

  const fireStats = useMemo(() => ({
    totalFires: fireLength,
    averageIntensity: avgIntensity,
    peakIntensity: 0,
    affectedArea: 0,
    riskLevel: avgConfidence,
    
    regionalData: processRegionalFireData(fireData || []),
    
    satelliteDistribution: {
      'Terra': firesBySatellite['Terra'],
      'Aqua': firesBySatellite['Aqua'],
      'NOAA-20': firesBySatellite['NOAA-20'],
      'Suomi NPP': firesBySatellite['Suomi NPP'],
    },
    
    fireTypes: {
      natural: totalNaturalFires,
      technogenic: totalTechnogenicFires
    },
    
    confidenceDistribution: {
      high: firesByConfidence['High'],
      medium: firesByConfidence['Medium'],
      low: firesByConfidence['Low'],
    },
    
    weatherConditions: {
      temperature: 'X',
      humidity: 'X',
      windSpeed: 'X',
      windDirection: 'X'
    },
    
    intensityDistribution: {
      low: null,
      medium: null,
      high: null,
      extreme: null
    },
    
    timeAnalysis: {
      newFires24h: newFiresSinceLastDay,
      extinguished24h: 8,
      trend: 'increasing'
    }
  }), [fireLength, fireData]);

  useEffect(() => {
    console.log(fireStats.regionalData)
  }, [fireStats.regionalData])

  const handleToggleLayer = useCallback(() => {
    setFireLayerVisible(!fireLayerVisible);
  }, [fireLayerVisible, setFireLayerVisible]);

  const handleOpacityChange = useCallback((e) => {
    setFireOpacity(Number(e.target.value));
  }, [setFireOpacity]);

  useEffect(() => {
    
  }, [])

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

  const handleShowStats = useCallback(() => {
    setIsLoadingStats(true);
    setTimeout(() => {
      setIsLoadingStats(false);
      setShowStats(true);
    }, 500);
  }, []);

  const handleExportData = useCallback(() => {
    const data = {
      fireData: fireStats,
      exportDate: new Date().toISOString(),
      dateRange: { start: fireStartDate, end: fireEndDate },
      filters: { intensity: fireIntensityFilter }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fire_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }, [fireStats, fireStartDate, fireEndDate, fireIntensityFilter]);

  const getMaxEndDate = useCallback(() => {
    if (!fireStartDate) return new Date().toISOString().split('T')[0];
    const startDate = new Date(fireStartDate);
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(startDate.getDate() + maxDaysDifference);
    const today = new Date().toISOString().split('T')[0];
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

  const getRiskColor = (level) => {
    switch(level) {
      case 'Low': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
      case 'Extreme': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <>
      <div className="fire-controls">
        {/* Main Layer Toggle */}
        <div className="fire-controls__header">
          <div className="fire-controls__toggle" onClick={handleToggleLayer}>
            <div className="fire-controls__toggle-icon">
              {fireLayerVisible ? (
                <Eye size={16} className="fire-controls__icon-active" />
              ) : (
                <EyeOff size={16} className="fire-controls__icon-inactive" />
              )}
            </div>
            <span className="fire-controls__toggle-label">
              Fire Pinpoints Layer
            </span>
            <Flame 
              size={16} 
              className={`fire-controls__flame-icon ${
                fireLayerVisible ? 'fire-controls__flame-icon--active' : ''
              }`}
            />
          </div>
          
          <button 
            className={`fire-controls__expand-btn ${
              isExpanded ? 'fire-controls__expand-btn--expanded' : ''
            }`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Sliders size={14} />
          </button>
        </div>

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="fire-controls__content">
            
            {/* Opacity Control */}
            {/* <div className="fire-controls__section">
              <label className="fire-controls__label">
                <MapPin size={12} />
                Opacity: {fireOpacity}%
              </label>
              <div className="fire-controls__slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fireOpacity}
                  onChange={handleOpacityChange}
                  className="fire-controls__slider"
                />
              </div>
            </div> */}

            {/* Date Range */}
            <div className="fire-controls__section">
              <label className="fire-controls__label">
                <Calendar size={12} />
                Date Range (max 14 days)
              </label>
              <div className="fire-controls__date-inputs">
                <input
                  type="date"
                  value={fireStartDate || lastWeek}
                  onChange={handleStartDateChange}
                  max={getMaxEndDate()}
                  min={getMinStartDate()}
                  className="fire-controls__date-input"
                  placeholder="Start Date"
                />
                <span className="fire-controls__date-separator">to</span>
                <input
                  type="date"
                  value={fireEndDate || today}
                  onChange={handleEndDateChange}
                  max={today}
                  min={fireStartDate || lastWeek}
                  className="fire-controls__date-input"
                  placeholder="End Date"
                />
              </div>
              <div className="fire-controls__buttons">
                <button
                  onClick={setDateHasChanged}
                  disabled={!hasDateChanges}
                  className={`fire-controls__update-btn ${
                    hasDateChanges ? 'fire-controls__update-btn--active' : ''
                  }`}
                  title="Update fire data with new date range"
                >
                  <RefreshCw size={14} />
                  Update Data
                </button>
                <button
                  className={`fire-controls__update-btn ${'fire-controls__update-btn--active'}`}
                  title="Show timeline date selector"
                  onClick={handleShowTimeline}
                >
                  <History size={14} />
                  Show Timeline
                </button>
              </div>
            </div>

            <div className='fire-controls__filters'>
              <button
                className={`fire-controls__update-btn ${!showFilters && 'fire-controls__update-btn--active'}`}
                title="Show filters"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={14} />
                Show Filters
              </button>

              {showFilters && (
                <div style={{
                  width: '100%'
                }}>
                  {/* Intensity Filter */}
                  {/* <div className="fire-controls__section">
                    <label className="fire-controls__label">
                      <Filter size={12} />
                      Fire Intensity
                    </label>
                    <select
                      value={fireIntensityFilter}
                      onChange={handleIntensityFilterChange}
                      className="fire-controls__select"
                    >
                      <option value="all">All Intensities</option>
                      <option value="low">Low (0-30)</option>
                      <option value="medium">Medium (30-60)</option>
                      <option value="high">High (60-80)</option>
                      <option value="extreme">Extreme (80+)</option>
                    </select>
                  </div> */}

                  {/* Confidence Filter */}
                  <div className="fire-controls__section">
                    <label className="fire-controls__label">
                      <Filter size={12} />
                      Confidence Filter (min %)
                    </label>

                    <div className="fire-controls__confidence-filter">
                      <div className="fire-controls__confidence-input">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={confidenceFilter}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setConfidenceFilter(value);
                            
                            // Clear existing timeout
                            if (confidenceFilterTimeout) {
                              clearTimeout(confidenceFilterTimeout);
                            }
                            
                            // Set new timeout for delayed application
                            const newTimeout = setTimeout(() => {
                              // Apply filter through fireLayer if it exists
                              if (window.fireLayerInstance) {
                                window.fireLayerInstance.filterByConfidence(value);
                              }
                            }, 500);
                            
                            setConfidenceFilterTimeout(newTimeout);
                          }}
                          className="fire-controls__confidence-number-input"
                          placeholder="0"
                        />
                        <span className="fire-controls__confidence-unit">%</span>
                      </div>
                      
                      <div className="fire-controls__confidence-presets">
                        {[0, 30, 70, 90].map(preset => (
                          <button
                            key={preset}
                            className={`fire-controls__confidence-preset ${
                              confidenceFilter === preset ? 'fire-controls__confidence-preset--active' : ''
                            }`}
                            onClick={() => {
                              setConfidenceFilter(preset);
                              if (window.fireLayerInstance) {
                                window.fireLayerInstance.filterByConfidence(preset);
                              }
                            }}
                          >
                            {preset}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Area Type Filter */}
                  <div className="fire-controls__section">
                    <label className="fire-controls__label">
                      <Filter size={12} />
                      Area Type
                    </label>

                    <div className="fire-controls__radio-group">
                      <label className="fire-controls__radio">
                        <input
                          type="radio"
                          name="areaType"
                          value="all"
                          checked={areaTypeFilter === "all"}
                          onChange={handleAreaTypeFilterChange}
                        />
                        All Areas
                      </label>

                      <label className="fire-controls__radio">
                        <input
                          type="radio"
                          name="areaType"
                          value="nature"
                          checked={areaTypeFilter === "nature"}
                          onChange={handleAreaTypeFilterChange}
                        />
                        Nature Only
                      </label>

                      <label className="fire-controls__radio">
                        <input
                          type="radio"
                          name="areaType"
                          value="urban"
                          checked={areaTypeFilter === "urban"}
                          onChange={handleAreaTypeFilterChange}
                        />
                        Urban Only
                      </label>
                    </div>
                  </div>

                  {/* Model Filter */}
                  <div className="fire-controls__section">
                    <label className="fire-controls__label">
                      <Filter size={12} />
                      Detection Model
                    </label>

                    <div className="fire-controls__radio-group">
                      <label className="fire-controls__radio">
                        <input
                          type="radio"
                          name="modelType"
                          value="all"
                          checked={selectedModel === null}
                          onChange={() => setSelectedModel(null)}
                        />
                        All Models
                      </label>

                      <label className="fire-controls__radio">
                        <input
                          type="radio"
                          name="modelType"
                          value="model0"
                          checked={selectedModel === 0}
                          onChange={() => setSelectedModel(0)}
                        />
                        Model 0
                      </label>

                      <label className="fire-controls__radio">
                        <input
                          type="radio"
                          name="modelType"
                          value="model1"
                          checked={selectedModel === 1}
                          onChange={() => setSelectedModel(1)}
                        />
                        Model 1
                      </label>
                    </div>
                  </div>

                  {/* Region Filter */}
                  <div className="fire-controls__section">
                    <label className="fire-controls__label">
                      <Filter size={12} />
                      Region Filter
                    </label>

                    <div className="fire-controls__multi-select">
                      <div className="fire-controls__selected-regions">
                        {selectedRegions.length === 0 ? (
                          <span className="fire-controls__placeholder">All Regions</span>
                        ) : (
                          selectedRegions.map(region => (
                            <span key={region} className="fire-controls__selected-tag">
                              {region}
                              <button
                                onClick={() => {
                                  const newRegions = selectedRegions.filter(r => r !== region);
                                  setSelectedRegions(newRegions);
                                }}
                                className="fire-controls__tag-remove"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                      
                      {Object.keys(firesByRegion).length > 0 && (
                        <div className="fire-controls__region-options">
                          {Object.entries(firesByRegion).map(([region, count]) => {
                            const isSelected = selectedRegions.includes(region);
                            return (
                              <label key={region} className="fire-controls__checkbox">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRegions([...selectedRegions, region]);
                                    } else {
                                      setSelectedRegions(selectedRegions.filter(r => r !== region));
                                    }
                                  }}
                                />
                                <span className="fire-controls__checkbox-label">
                                  {region} ({count})
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Stats Display */}
            <div className="fire-controls__stats">
              <div className="fire-controls__stat-header">
                <h4 className="fire-controls__stat-title">
                  <Activity size={14} />
                  Fire Activity Summary
                </h4>
              </div>
              
              <div className="fire-controls__stat-grid">
                <div className="fire-controls__stat-item">
                  <span className="fire-controls__stat-label">Active Points</span>
                  <span className="fire-controls__stat-value">{fireLength}</span>
                </div>
                <div className="fire-controls__stat-item">
                  <span className="fire-controls__stat-label">Risk Level</span>
                  <span 
                    className="fire-controls__stat-value fire-controls__stat-value--risk"
                    style={{ color: getRiskColor(fireStats.riskLevel) }}
                  >
                    {fireStats.riskLevel}
                  </span>
                </div>
                <div className="fire-controls__stat-item">
                  <span className="fire-controls__stat-label">New (24h)</span>
                  <span className="fire-controls__stat-value">
                    {fireStats.timeAnalysis.newFires24h > 0
                      ? `+${fireStats.timeAnalysis.newFires24h}`
                      : fireStats.timeAnalysis.newFires24h}
                  </span>
                </div>
                <div className="fire-controls__stat-item">
                  <span className="fire-controls__stat-label">Avg Intensity</span>
                  <span className="fire-controls__stat-value">{fireStats.averageIntensity}</span>
                </div>
              </div>
              
              <div className="fire-controls__stat-actions">
                <button 
                  className="fire-controls__stat-btn fire-controls__stat-btn--primary"
                  onClick={handleShowStats}
                  disabled={isLoadingStats}
                >
                  {isLoadingStats ? (
                    <RefreshCw size={14} className="fire-controls__spinning" />
                  ) : (
                    <BarChart3 size={14} />
                  )}
                  {isLoadingStats ? 'Loading...' : 'Detailed Stats'}
                </button>
                <button 
                  className="fire-controls__stat-btn"
                  onClick={handleExportData}
                  title="Export fire data"
                >
                  <Download size={14} />
                </button>
                {/* <button 
                  className="fire-controls__stat-btn"
                  title="Share fire data"
                >
                  <Share2 size={14} />
                </button> */}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Modal */}
      {showStats && (
        <div className="fire-stats-modal">
          <div className="fire-stats-modal__backdrop" onClick={() => setShowStats(false)} />
          <div className="fire-stats-modal__content">
            <div className="fire-stats-modal__header">
              <h2 className="fire-stats-modal__title">
                <Flame size={20} />
                Fire Activity Statistics
              </h2>
              <button 
                className="fire-stats-modal__close"
                onClick={() => setShowStats(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="fire-stats-modal__body">
              {/* Overview Cards */}
              <div className="fire-stats-modal__overview">
                <div className="fire-stats-card">
                  <div className="fire-stats-card__icon fire-stats-card__icon--total">
                    <Flame size={20} />
                  </div>
                  <div className="fire-stats-card__content">
                    <div className="fire-stats-card__value">{fireStats.totalFires}</div>
                    <div className="fire-stats-card__label">Total Fire Points</div>
                  </div>
                </div>

                <div className="fire-stats-card">
                  <div className="fire-stats-card__icon fire-stats-card__icon--temp">
                    <Thermometer size={20} />
                  </div>
                  <div className="fire-stats-card__content">
                    <div className="fire-stats-card__value">{fireStats.peakIntensity}</div>
                    <div className="fire-stats-card__label">Peak Intensity</div>
                  </div>
                </div>

                <div className="fire-stats-card">
                  <div className="fire-stats-card__icon fire-stats-card__icon--area">
                    <MapPin size={20} />
                  </div>
                  <div className="fire-stats-card__content">
                    <div className="fire-stats-card__value">{fireStats.affectedArea.toLocaleString()}</div>
                    <div className="fire-stats-card__label">Affected Area (ha)</div>
                  </div>
                </div>
              </div>

              {/* Intensity Distribution */}
              <div className="fire-stats-section">
                <h3 className="fire-stats-section__title">
                  <BarChart3 size={16} />
                  Intensity Distribution
                </h3>
                <div className="fire-stats-intensity">
                  <div className="fire-stats-intensity__bar">
                    <div className="fire-stats-intensity__item fire-stats-intensity__item--low">
                      <div className="fire-stats-intensity__label">Low</div>
                      <div className="fire-stats-intensity__value">{fireStats.intensityDistribution.low}</div>
                    </div>
                    <div className="fire-stats-intensity__item fire-stats-intensity__item--medium">
                      <div className="fire-stats-intensity__label">Medium</div>
                      <div className="fire-stats-intensity__value">{fireStats.intensityDistribution.medium}</div>
                    </div>
                    <div className="fire-stats-intensity__item fire-stats-intensity__item--high">
                      <div className="fire-stats-intensity__label">High</div>
                      <div className="fire-stats-intensity__value">{fireStats.intensityDistribution.high}</div>
                    </div>
                    <div className="fire-stats-intensity__item fire-stats-intensity__item--extreme">
                      <div className="fire-stats-intensity__label">Extreme</div>
                      <div className="fire-stats-intensity__value">{fireStats.intensityDistribution.extreme}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Conditions */}
              <div className="fire-stats-section">
                <h3 className="fire-stats-section__title">
                  <Wind size={16} />
                  Current Weather Conditions
                </h3>
                <div className="fire-stats-weather">
                  <div className="fire-stats-weather__item">
                    <Thermometer size={14} />
                    <span className="fire-stats-weather__label">Temperature</span>
                    <span className="fire-stats-weather__value">{fireStats.weatherConditions.temperature}°C</span>
                  </div>
                  <div className="fire-stats-weather__item">
                    <Activity size={14} />
                    <span className="fire-stats-weather__label">Humidity</span>
                    <span className="fire-stats-weather__value">{fireStats.weatherConditions.humidity}%</span>
                  </div>
                  <div className="fire-stats-weather__item">
                    <Wind size={14} />
                    <span className="fire-stats-weather__label">Wind Speed</span>
                    <span className="fire-stats-weather__value">{fireStats.weatherConditions.windSpeed} km/h</span>
                  </div>
                  <div className="fire-stats-weather__item">
                    <Wind size={14} />
                    <span className="fire-stats-weather__label">Wind Direction</span>
                    <span className="fire-stats-weather__value">{fireStats.weatherConditions.windDirection}</span>
                  </div>
                </div>
              </div>

              {/* Time Analysis */}
              <div className="fire-stats-section">
                <h3 className="fire-stats-section__title">
                  <Clock size={16} />
                  24-Hour Analysis
                </h3>
                <div className="fire-stats-time">
                  <div className="fire-stats-time__item">
                    <div className="fire-stats-time__icon fire-stats-time__icon--new">
                      <TrendingUp size={16} />
                    </div>
                    <div className="fire-stats-time__content">
                      <div className="fire-stats-time__value">+{fireStats.timeAnalysis.newFires24h}</div>
                      <div className="fire-stats-time__label">New Fire Points</div>
                    </div>
                  </div>
                  <div className="fire-stats-time__item">
                    <div className="fire-stats-time__icon fire-stats-time__icon--trend">
                      <TrendingUp size={16} />
                    </div>
                    <div className="fire-stats-time__content">
                      <div className="fire-stats-time__value">
                        {fireStats.timeAnalysis.trend === 'increasing' ? '↗' : '↘'}
                      </div>
                      <div className="fire-stats-time__label">Trend</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="fire-stats-section">
                <h3 className="fire-stats-section__title">
                  <AlertTriangle size={16} />
                  Risk Assessment
                </h3>
                <div className="fire-stats-risk">
                  <div className="fire-stats-risk__level">
                    <div 
                      className="fire-stats-risk__indicator"
                      style={{ backgroundColor: getRiskColor(fireStats.riskLevel) }}
                    >
                      <AlertTriangle size={20} />
                    </div>
                    <div className="fire-stats-risk__content">
                      <div className="fire-stats-risk__value">{fireStats.riskLevel} Risk</div>
                      <div className="fire-stats-risk__description">
                        Based on current fire activity, weather conditions, and historical patterns
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regional Breakdown */}
              <div className="fire-stats-section">
                <h3 className="fire-stats-section__title">
                  <MapPin size={16} />
                  Regional Fire Distribution
                </h3>
                <div className="fire-stats-regional">
                  {Object.entries(fireStats.regionalData).map(([region, stats]) => (
                    <div key={region} className="fire-stats-regional__item">
                      <div className="fire-stats-regional__header">
                        <h4 className="fire-stats-regional__name">{region}</h4>
                        <span className="fire-stats-regional__count">{stats.totalFires} fires</span>
                      </div>
                      <div className="fire-stats-regional__details">
                        <div className="fire-stats-regional__detail">
                          <span className="fire-stats-regional__label">Avg Confidence:</span>
                          <span className="fire-stats-regional__value">{stats.avgConfidence.toFixed(1)}%</span>
                        </div>
                        <div className="fire-stats-regional__detail">
                          <span className="fire-stats-regional__label">Natural:</span>
                          <span className="fire-stats-regional__value">{stats.natural}</span>
                        </div>
                        <div className="fire-stats-regional__detail">
                          <span className="fire-stats-regional__label">Technogenic:</span>
                          <span className="fire-stats-regional__value">{stats.technogenic}</span>
                        </div>
                        <div className="fire-stats-regional__detail">
                          <span className="fire-stats-regional__label">Localities:</span>
                          <span className="fire-stats-regional__value">{stats.localities.size}</span>
                        </div>
                        <div className="fire-stats-regional__detail">
                          <span className="fire-stats-regional__label">Emergency Dept:</span>
                          <span className="fire-stats-regional__value" title={stats.emergencyDepartment}>
                            {stats.emergencyDepartment.length > 20 ? 
                              stats.emergencyDepartment.substring(0, 20) + '...' : 
                              stats.emergencyDepartment}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Satellite Data */}
              <div className="fire-stats-section">
                <h3 className="fire-stats-section__title">
                  <Activity size={16} />
                  Detection Sources
                </h3>
                <div className="fire-stats-satellites">
                  {Object.entries(fireStats.satelliteDistribution).map(([satellite, count]) => (
                    <div key={satellite} className="fire-stats-satellites__item">
                      <div className="fire-stats-satellites__name">{satellite}</div>
                      <div className="fire-stats-satellites__count">{count}</div>
                      <div className="fire-stats-satellites__percentage">
                        {((count / fireStats.totalFires) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fire Types */}
              <div className="fire-stats-section">
                <h3 className="fire-stats-section__title">
                  <Flame size={16} />
                  Fire Origin Classification
                </h3>
                <div className="fire-stats-types">
                  <div className="fire-stats-types__item fire-stats-types__item--natural">
                    <div className="fire-stats-types__icon">🌿</div>
                    <div className="fire-stats-types__content">
                      <div className="fire-stats-types__value">{fireStats.fireTypes.natural}</div>
                      <div className="fire-stats-types__label">Natural Fires</div>
                      <div className="fire-stats-types__percentage">
                        {((fireStats.fireTypes.natural / fireStats.totalFires) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="fire-stats-types__item fire-stats-types__item--technogenic">
                    <div className="fire-stats-types__icon">⚡</div>
                    <div className="fire-stats-types__content">
                      <div className="fire-stats-types__value">{fireStats.fireTypes.technogenic}</div>
                      <div className="fire-stats-types__label">Technogenic Fires</div>
                      <div className="fire-stats-types__percentage">
                        {((fireStats.fireTypes.technogenic / fireStats.totalFires) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Distribution */}
              <div className="fire-stats-section">
                <h3 className="fire-stats-section__title">
                  <Target size={16} />
                  Detection Models
                </h3>
                <div className="fire-stats-types">
                  {Object.entries(firesByModel).map(([model, count]) => (
                    <div key={model} className="fire-stats-types__item">
                      <div className="fire-stats-types__icon">🤖</div>
                      <div className="fire-stats-types__content">
                        <div className="fire-stats-types__value">{count || 0}</div>
                        <div className="fire-stats-types__label">{model}</div>
                        <div className="fire-stats-types__percentage">
                          {fireStats.totalFires > 0 ? 
                            (((count || 0) / fireStats.totalFires) * 100).toFixed(1) : '0'}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence Distribution */}
              <div className="fire-stats-section">
                <h3 className="fire-stats-section__title">
                  <Target size={16} />
                  Detection Confidence
                </h3>
                <div className="fire-stats-confidence">
                  <div className="fire-stats-confidence__item fire-stats-confidence__item--high">
                    <div className="fire-stats-confidence__label">High (70-100%)</div>
                    <div className="fire-stats-confidence__value">{fireStats.confidenceDistribution.high}</div>
                  </div>
                  <div className="fire-stats-confidence__item fire-stats-confidence__item--medium">
                    <div className="fire-stats-confidence__label">Medium (30-70%)</div>
                    <div className="fire-stats-confidence__value">{fireStats.confidenceDistribution.medium}</div>
                  </div>
                  <div className="fire-stats-confidence__item fire-stats-confidence__item--low">
                    <div className="fire-stats-confidence__label">Low (0-30%)</div>
                    <div className="fire-stats-confidence__value">{fireStats.confidenceDistribution.low}</div>
                  </div>
                </div>
              </div>

              {/* Map visualization */}
              <div className="fire-stats-section">
                <h3 className="fire-stats-section__title">
                  <Map size={16} />
                  Map Distribution
                </h3>
                <div className="fire-stats-map">
                  <MapFireControls firesByRegion={firesByRegion} />
                </div>
              </div>

            </div>

            <div className="fire-stats-modal__footer">
              <button 
                className="fire-stats-modal__btn fire-stats-modal__btn--secondary"
                onClick={handleExportData}
              >
                <Download size={16} />
                Export Data
              </button>
              <button 
                className="fire-stats-modal__btn fire-stats-modal__btn--primary"
                onClick={() => setShowStats(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Date Chooser */}
      {showTimeline && (
        <LinearDateChooser
          startDate={fireStartDate}
          endDate={fireEndDate}
          onDateRangeChange={(start, end) => {
            setFireStartDate(start.toISOString().split('T')[0]);
            setFireEndDate(end.toISOString().split('T')[0]);
            setHasDateChanges(true);
          }}
          onClose={() => setShowTimeline(false)}
          maxDays={maxDaysDifference}
        />
      )}

    </>
  );
};

export default FireControls;