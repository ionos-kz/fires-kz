import { useState, useCallback, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  X, 
  AlertTriangle,
  Flame,
  Eye,
  EyeOff,
  Sliders
} from 'lucide-react';

import './FireControls/fireControls.scss';
import useRiskMapStore from 'src/app/store/riskMapStore';

const FireRisk = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [THISISARRAY, setTHISISARRAY] = useState([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);

  const riskDates = useRiskMapStore((state) => state.riskDates);
  const addDate = useRiskMapStore((state) => state.addDate);
  const removeDate = useRiskMapStore((state) => state.removeDate);

  useEffect(() => {
    const fetchFireDates = async () => {
      try {
        setIsLoadingDates(true);
        const response = await fetch('https://api.igmass.kz/fire/firehuzdates');
        const textData = await response.text();
        
        // Parse the string response: [['2024.10.2', ..], ...]
        // Convert to proper JSON
        const cleanedData = textData
          .replace(/'/g, '"')  // Replace single quotes with double quotes
          .replace(/(\d{4})\.(\d{1,2})\.(\d{1,2})/g, '$1-$2-$3');
        
        const data = JSON.parse(cleanedData);
        
        // Extract dates from the nested array format and ensure proper date format
        const dates = data.map(item => {
          const dateStr = item[0];
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        });
        
        setTHISISARRAY(dates);
      } catch (error) {
        console.error('Error fetching fire dates:', error);
        setTHISISARRAY([]);
      } finally {
        setIsLoadingDates(false);
      }
    };

    fetchFireDates();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRiskLevel = (dateString) => {
    const month = new Date(dateString).getMonth();
    if (month >= 5 && month <= 8) return 'High'; // Summer months
    if (month >= 3 && month <= 4 || month >= 9 && month <= 10) return 'Medium'; // Spring/Fall
    return 'Low'; // Winter months
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'Low': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleDateSelect = useCallback((e) => {
    setSelectedDate(e.target.value);
  }, []);

  const handleAddItem = useCallback(() => {
    if (selectedDate && !riskDates.some(item => item.date === selectedDate)) {
      addDate(selectedDate);
      setSelectedDate(''); // Clear selection after adding
    }
  }, [selectedDate, riskDates, addDate]);

  const handleRemoveItem = useCallback((id) => {
    removeDate(id);
  }, [removeDate]);

  const handleToggleVisibility = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  return (
    <div className="fire-controls">
      {/* Main Layer Toggle */}
      <div className="fire-controls__header">
        <div className="fire-controls__toggle" onClick={handleToggleVisibility}>
          <div className="fire-controls__toggle-icon">
            {isVisible ? (
              <Eye size={16} className="fire-controls__icon-active" />
            ) : (
              <EyeOff size={16} className="fire-controls__icon-inactive" />
            )}
          </div>
          <span className="fire-controls__toggle-label">
            Fire Risk Analysis
          </span>
          <AlertTriangle 
            size={16} 
            className={`fire-controls__flame-icon ${
              isVisible ? 'fire-controls__flame-icon--active' : ''
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
          
          {/* Date Selection */}
          <div className="fire-controls__section">
            <label className="fire-controls__label">
              <Calendar size={12} />
              Select Risk Assessment Date
            </label>
            
            <div className="fire-controls__date-inputs">
              <select
                value={selectedDate}
                onChange={handleDateSelect}
                className="fire-controls__select"
                style={{ flex: 1 }}
                disabled={isLoadingDates}
              >
                <option value="">
                  {isLoadingDates ? "Loading dates..." : "Choose a date..."}
                </option>
                {THISISARRAY.map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)} - {getRiskLevel(date)} Risk
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleAddItem}
                disabled={!selectedDate || riskDates.some(item => item.date === selectedDate)}
                className={`fire-controls__update-btn ${
                  selectedDate && !riskDates.some(item => item.date === selectedDate) 
                    ? 'fire-controls__update-btn--active' : ''
                }`}
                title="Add risk assessment"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </div>

          {riskDates.length > 0 && (
            <div className="fire-controls__section">
              <label className="fire-controls__label">
                <Flame size={12} />
                Risk Assessment Maps ({riskDates.length})
              </label>
              
              <div className="fire-controls__stats" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {riskDates.map(item => (
                  <div key={item.id} className="fire-stats-card" style={{ margin: '8px 0' }}>
                    <div className="fire-stats-card__content" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="fire-stats-card__value" style={{ fontSize: '14px' }}>
                          {formatDate(item.date)}
                        </span>
                        <span
                          className="fire-controls__stat-value fire-controls__stat-value--risk"
                          style={{ 
                            color: getRiskColor(getRiskLevel(item.date)),
                            fontSize: '12px',
                            backgroundColor: getRiskColor(getRiskLevel(item.date)) + '20',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {getRiskLevel(item.date)}
                        </span>
                      </div>
                      <div className="fire-stats-card__label" style={{ fontSize: '11px' }}>
                        Added: {new Date(item.addedAt).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="fire-controls__stat-btn"
                      title="Remove assessment"
                      style={{ 
                        minWidth: 'auto',
                        padding: '4px',
                        marginLeft: '8px'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="fire-controls__section">
            <div className="fire-controls__legend">
              <div className="fire-controls__legend-header">
                <AlertTriangle size={12} />
                Risk Scale Legend
              </div>
              <div className="fire-controls__legend-gradient"></div>
              <div className="fire-controls__legend-labels">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
              <div className="fire-controls__legend-description">
                Risk intensity scale: Green (Low) → Yellow (Moderate) → Orange (High) → Red (Extreme)
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="fire-controls__stats">
            <div className="fire-controls__stat-header">
              <h4 className="fire-controls__stat-title">
                <AlertTriangle size={14} />
                Risk Distribution Summary
              </h4>
            </div>
            
            <div className="fire-controls__stat-grid">
              <div className="fire-controls__stat-item">
                <span className="fire-controls__stat-label">Low Risk</span>
                <span 
                  className="fire-controls__stat-value"
                  style={{ color: getRiskColor('Low') }}
                >
                  {riskDates.filter(item => getRiskLevel(item.date) === 'Low').length}
                </span>
              </div>
              <div className="fire-controls__stat-item">
                <span className="fire-controls__stat-label">Medium Risk</span>
                <span 
                  className="fire-controls__stat-value"
                  style={{ color: getRiskColor('Medium') }}
                >
                  {riskDates.filter(item => getRiskLevel(item.date) === 'Medium').length}
                </span>
              </div>
              <div className="fire-controls__stat-item">
                <span className="fire-controls__stat-label">High Risk</span>
                <span 
                  className="fire-controls__stat-value"
                  style={{ color: getRiskColor('High') }}
                >
                  {riskDates.filter(item => getRiskLevel(item.date) === 'High').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FireRisk;