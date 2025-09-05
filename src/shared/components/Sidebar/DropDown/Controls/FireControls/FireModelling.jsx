import { useState, useEffect, useRef } from 'react';
import { Style } from 'ol/style';
import { 
  Layers, 
  Eye,
  EyeOff,
  Sliders,
  Trash2,
  RotateCcw,
  Settings,
  Info,
  Play,        
  Pause,       
  SkipBack,    
  ChevronRight 
} from 'lucide-react';

import './fireControls.scss';
import useFireModellingStore from 'src/app/store/fireModellingStore'; // Uncomment when store is created

const FireModelling = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [animatingLayers, setAnimatingLayers] = useState({});
    const animationIntervals = useRef({});

    const { 
        fireModellingLayers,
        removeFireModellingLayer,
        updateFireModellingLayer,
        mapInstance,
    } = useFireModellingStore();

    // Convert fireModellingLayers object to array for rendering
    const modellingLayers = Object.values(fireModellingLayers).map(layer => ({
        id: layer.id,
        name: layer.name || `Layer ${layer.id}`,
        type: layer.type || 'Fire Model',
        color: layer.color || '#ff6b6b',
        opacity: layer.opacity,
        visible: layer.visible,
        addedAt: new Date(layer.id),
        metadata: layer.metadata || {}
    }));

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const handleToggleVisibility = () => {
        setIsVisible(!isVisible);
        Object.keys(fireModellingLayers).forEach(id => {
            updateFireModellingLayer(id, { visible: !isVisible });
            if (fireModellingLayers[id].layer) {
                fireModellingLayers[id].layer.setVisible(!isVisible);
            }
        });
    };

    const handleLayerVisibilityToggle = (id) => {
        const layer = fireModellingLayers[id];
        if (layer) {
            const newVisible = !layer.visible;
            updateFireModellingLayer(id, { visible: newVisible });
            if (layer.layer) {
                layer.layer.setVisible(newVisible);
            }
        }
    };

    const handleOpacityChange = (id, value) => {
        const opacity = value / 100;
        updateFireModellingLayer(id, { opacity });
        if (fireModellingLayers[id]?.layer) {
            fireModellingLayers[id].layer.setOpacity(opacity);
        }
    };

    const handleResetLayer = (id) => {
        updateFireModellingLayer(id, { opacity: 1, visible: true });
        if (fireModellingLayers[id]?.layer) {
            fireModellingLayers[id].layer.setOpacity(1);
            fireModellingLayers[id].layer.setVisible(true);
        }
    };

    const handleDeleteLayer = (id) => {
        const layer = fireModellingLayers[id];
        if (layer?.layer && mapInstance) {
            mapInstance.removeLayer(layer.layer);
        }
        removeFireModellingLayer(id);
    };
    const startAnimation = (layerId) => {
        const layer = fireModellingLayers[layerId];
        if (!layer?.layer) return;

        // Get all features and find max dn value
        const features = layer.layer.getSource().getFeatures();
        const maxDn = Math.max(...features.map(f => f.get('dn') || 0));
        
        setAnimatingLayers(prev => ({
            ...prev,
            [layerId]: {
                isPlaying: true,
                currentFrame: 0,
                maxFrame: maxDn,
                speed: 500 // ms
            }
        }));

        // Start animation interval
        animationIntervals.current[layerId] = setInterval(() => {
            setAnimatingLayers(prev => {
            const layerAnim = prev[layerId];
            if (!layerAnim) return prev;

            const nextFrame = layerAnim.currentFrame >= layerAnim.maxFrame 
                ? 0 
                : layerAnim.currentFrame + 1;

            // Update layer visibility based on dn value
            features.forEach(feature => {
                const dn = feature.get('dn') || 0;
                feature.setStyle(dn <= nextFrame ? undefined : new Style({}));
            });

            return {
                ...prev,
                [layerId]: {
                ...layerAnim,
                currentFrame: nextFrame
                }
            };
            });
        }, 500);
    };

    const pauseAnimation = (layerId) => {
        if (animationIntervals.current[layerId]) {
            clearInterval(animationIntervals.current[layerId]);
            delete animationIntervals.current[layerId];
        }
        
        setAnimatingLayers(prev => ({
            ...prev,
            [layerId]: {
                ...prev[layerId],
                isPlaying: false
            }
        }));
    };

    const resetAnimation = (layerId) => {
        pauseAnimation(layerId);
        
        const layer = fireModellingLayers[layerId];
        if (layer?.layer) {
            // Show all features
            layer.layer.getSource().getFeatures().forEach(feature => {
                feature.setStyle(undefined);
            });
        }
        
        setAnimatingLayers(prev => {
            const updated = { ...prev };
            delete updated[layerId];
            return updated;
        });
        };

        const setAnimationFrame = (layerId, frame) => {
        const layer = fireModellingLayers[layerId];
        if (!layer?.layer) return;

        const features = layer.layer.getSource().getFeatures();
        features.forEach(feature => {
            const dn = feature.get('dn') || 0;
            feature.setStyle(dn <= frame ? undefined : new ol.style.Style({}));
        });

        setAnimatingLayers(prev => ({
            ...prev,
            [layerId]: {
            ...prev[layerId],
            currentFrame: frame
            }
        }));
    };

    // Cleanup intervals on unmount
    useEffect(() => {
    return () => {
        Object.keys(animationIntervals.current).forEach(layerId => {
            clearInterval(animationIntervals.current[layerId]);
        });
    };
    }, []);

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
            Fire Modelling
          </span>
          <Layers 
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
          
          {/* Layer Management */}
          {modellingLayers.length > 0 && (
            <div className="fire-controls__section">
              <label className="fire-controls__label">
                <Layers size={12} />
                Modelling Layers ({modellingLayers.length})
              </label>
              
              <div className="fire-controls__stats" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {modellingLayers.map(layer => (
                  <div key={layer.id} className="fire-modelling__layer-card">
                    <div className="fire-modelling__layer-header">
                      <div className="fire-modelling__layer-info">
                        <div className="fire-modelling__layer-title">
                          <span className="fire-modelling__layer-name">
                            {layer.name}
                          </span>
                          <div 
                            className="fire-modelling__layer-indicator"
                            style={{ backgroundColor: layer.color }}
                          />
                        </div>
                        <div className="fire-modelling__layer-meta">
                          Added: {formatTime(layer.addedAt)} • {layer.type}
                        </div>
                      </div>
                      
                    <div className="fire-modelling__layer-actions">
                    {/* Animation controls */}
                    {animatingLayers[layer.id] ? (
                        <>
                        <button
                            onClick={() => resetAnimation(layer.id)}
                            className="fire-controls__stat-btn"
                            title="Reset animation"
                        >
                            <SkipBack size={12} />
                        </button>
                        <button
                            onClick={() => 
                            animatingLayers[layer.id]?.isPlaying 
                                ? pauseAnimation(layer.id) 
                                : startAnimation(layer.id)
                            }
                            className="fire-controls__stat-btn fire-modelling__btn--primary"
                            title={animatingLayers[layer.id]?.isPlaying ? 'Pause' : 'Play'}
                        >
                            {animatingLayers[layer.id]?.isPlaying ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                        </>
                    ) : (
                        <button
                        onClick={() => startAnimation(layer.id)}
                        className="fire-controls__stat-btn fire-modelling__btn--primary"
                        title="Animate layer"
                        >
                        <Play size={12} />
                        </button>
                    )}
                    
                    <button
                        onClick={() => handleLayerVisibilityToggle(layer.id)}
                        className={`fire-controls__stat-btn ${
                        layer.visible ? 'fire-modelling__btn--visible' : ''
                        }`}
                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                    >
                        {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    
                    <button
                        onClick={() => handleResetLayer(layer.id)}
                        className="fire-controls__stat-btn"
                        title="Reset layer settings"
                    >
                        <RotateCcw size={12} />
                    </button>
                    
                    <button
                        onClick={() => handleDeleteLayer(layer.id)}
                        className="fire-controls__stat-btn fire-modelling__btn--danger"
                        title="Delete layer"
                    >
                        <Trash2 size={12} />
                    </button>
                    </div>
                    </div>

                    {/* Opacity Control */}
                    <div className="fire-modelling__layer-controls">
                      <div className="fire-controls__section" style={{ marginBottom: '12px' }}>
                        <label className="fire-controls__label" style={{ marginBottom: '6px' }}>
                          <Settings size={10} />
                          Opacity: {Math.round(layer.opacity * 100)}%
                        </label>
                        <div className="fire-controls__slider-container">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round(layer.opacity * 100)}
                            onChange={(e) => handleOpacityChange(layer.id, e.target.value)}
                            className="fire-controls__slider"
                          />
                            <div 
                              className="fire-controls__slider-fill"
                              style={{ width: `${layer.opacity * 100}%` }}
                            />
                        </div>
                      </div>

                      {/* Animation Progress */}
                        {animatingLayers[layer.id] && (
                        <div className="fire-controls__section" style={{ marginBottom: '12px' }}>
                            <label className="fire-controls__label" style={{ marginBottom: '6px' }}>
                            <ChevronRight size={10} />
                            Frame: {animatingLayers[layer.id].currentFrame} / {animatingLayers[layer.id].maxFrame}
                            </label>
                            <div className="fire-controls__slider-container">
                            <input
                                type="range"
                                min="0"
                                max={animatingLayers[layer.id].maxFrame}
                                value={animatingLayers[layer.id].currentFrame}
                                onChange={(e) => setAnimationFrame(layer.id, parseInt(e.target.value))}
                                className="fire-controls__slider"
                            />
                            <div 
                                className="fire-controls__slider-fill"
                                style={{ 
                                width: `${(animatingLayers[layer.id].currentFrame / animatingLayers[layer.id].maxFrame) * 100}%` 
                                }}
                            />
                            </div>
                        </div>
                        )}

                      {/* Layer Metadata */}
                      {layer.metadata && (
                        <div className="fire-modelling__layer-metadata">
                          <div className="fire-controls__label" style={{ marginBottom: '6px' }}>
                            <Info size={10} />
                            Layer Details
                          </div>
                          <div className="fire-modelling__metadata-grid">
                            {Object.entries(layer.metadata).map(([key, value]) => (
                              <div key={key} className="fire-modelling__metadata-item">
                                <span className="fire-modelling__metadata-key">
                                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                                </span>
                                <span className="fire-modelling__metadata-value">
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {modellingLayers.length === 0 && (
            <div className="fire-controls__section">
              <div className="fire-modelling__empty-state">
                <Layers size={32} className="fire-modelling__empty-icon" />
                <h4 className="fire-modelling__empty-title">No Modelling Layers</h4>
                <p className="fire-modelling__empty-description">
                  Add fire spread models, evacuation zones, or weather analysis layers to get started.
                </p>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="fire-controls__stats">
            <div className="fire-controls__stat-header">
              <h4 className="fire-controls__stat-title">
                <Layers size={14} />
                Layer Summary
              </h4>
            </div>
            
            <div className="fire-controls__stat-grid">
              <div className="fire-controls__stat-item">
                <span className="fire-controls__stat-label">Total Layers</span>
                <span className="fire-controls__stat-value">
                  {modellingLayers.length}
                </span>
              </div>
              <div className="fire-controls__stat-item">
                <span className="fire-controls__stat-label">Visible</span>
                <span 
                  className="fire-controls__stat-value"
                  style={{ color: '#10b981' }}
                >
                  {modellingLayers.filter(layer => layer.visible).length}
                </span>
              </div>
              <div className="fire-controls__stat-item">
                <span className="fire-controls__stat-label">Hidden</span>
                <span 
                  className="fire-controls__stat-value"
                  style={{ color: '#6b7280' }}
                >
                  {modellingLayers.filter(layer => !layer.visible).length}
                </span>
              </div>
              <div className="fire-controls__stat-item">
                <span className="fire-controls__stat-label">Avg Opacity</span>
                <span className="fire-controls__stat-value">
                  {modellingLayers.length > 0 
                    ? Math.round(modellingLayers.reduce((acc, layer) => acc + layer.opacity, 0) / modellingLayers.length * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FireModelling;