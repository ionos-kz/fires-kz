import { useState, useEffect, useRef } from 'react';
import { Style } from 'ol/style';
import {
  Layers,
  Eye,
  EyeOff,
  Sliders,
  Trash2,
  RotateCcw,
  Info,
  Play,
  Pause,
  SkipBack,
} from 'lucide-react';

import './fireControls.scss';
import useFireModellingStore from 'src/app/store/fireModellingStore';

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
        total_area
    } = useFireModellingStore();

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

        const features = layer.layer.getSource().getFeatures();
        const maxDn = Math.max(...features.map(f => f.get('dn') || 0));

        setAnimatingLayers(prev => ({
            ...prev,
            [layerId]: { isPlaying: true, currentFrame: 0, maxFrame: maxDn, speed: 500 }
        }));

        animationIntervals.current[layerId] = setInterval(() => {
            setAnimatingLayers(prev => {
                const layerAnim = prev[layerId];
                if (!layerAnim) return prev;

                const nextFrame = layerAnim.currentFrame >= layerAnim.maxFrame
                    ? 0
                    : layerAnim.currentFrame + 1;

                features.forEach(feature => {
                    const dn = feature.get('dn') || 0;
                    feature.setStyle(dn <= nextFrame ? undefined : new Style({}));
                });

                return { ...prev, [layerId]: { ...layerAnim, currentFrame: nextFrame } };
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
            [layerId]: { ...prev[layerId], isPlaying: false }
        }));
    };

    const resetAnimation = (layerId) => {
        pauseAnimation(layerId);
        const layer = fireModellingLayers[layerId];
        if (layer?.layer) {
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
            feature.setStyle(dn <= frame ? undefined : new Style({}));
        });

        setAnimatingLayers(prev => ({
            ...prev,
            [layerId]: { ...prev[layerId], currentFrame: frame }
        }));
    };

    useEffect(() => {
        return () => {
            Object.keys(animationIntervals.current).forEach(layerId => {
                clearInterval(animationIntervals.current[layerId]);
            });
        };
    }, []);

    const visibleCount = modellingLayers.filter(l => l.visible).length;
    const hiddenCount = modellingLayers.length - visibleCount;
    const avgOpacity = modellingLayers.length > 0
        ? Math.round(modellingLayers.reduce((acc, l) => acc + l.opacity, 0) / modellingLayers.length * 100)
        : 0;

    return (
        <div className="fire-controls">
            {/* Header */}
            <div className="fire-controls__header">
                <div className="fire-controls__toggle" onClick={handleToggleVisibility}>
                    <div className="fire-controls__toggle-icon">
                        {isVisible
                            ? <Eye size={15} className="fire-controls__icon-active" />
                            : <EyeOff size={15} className="fire-controls__icon-inactive" />
                        }
                    </div>
                    <span className="fire-controls__toggle-label">Fire Modelling</span>
                    <Layers
                        size={15}
                        className={`fire-controls__flame-icon${isVisible ? ' fire-controls__flame-icon--active' : ''}`}
                    />
                </div>

                <button
                    className={`fire-controls__expand-btn${isExpanded ? ' fire-controls__expand-btn--expanded' : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                    title="Layer settings"
                >
                    <Sliders size={13} />
                </button>
            </div>

            {/* Expanded panel */}
            {isExpanded && (
                <div className="fire-controls__content">

                    {modellingLayers.length > 0 ? (
                        <div className="fire-modelling__layers-container">
                            <div className="fire-modelling__section-header">
                                <Layers size={11} />
                                <span>Modelling Layers ({modellingLayers.length})</span>
                            </div>

                            <div className="fire-modelling__layers">
                                {modellingLayers.map(layer => {
                                    const anim = animatingLayers[layer.id];
                                    return (
                                        <div key={layer.id} className="fire-modelling__layer-card">

                                            {/* Row 1: dot + name + eye + delete */}
                                            <div className="fire-modelling__card-header">
                                                <div
                                                    className="fire-modelling__layer-dot"
                                                    style={{ backgroundColor: layer.color }}
                                                />
                                                <span className="fire-modelling__layer-name">{layer.name}</span>
                                                <div className="fire-modelling__card-actions">
                                                    <button
                                                        onClick={() => handleLayerVisibilityToggle(layer.id)}
                                                        className={`fire-modelling__icon-btn${layer.visible ? ' fire-modelling__icon-btn--eye-on' : ''}`}
                                                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                                                    >
                                                        {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteLayer(layer.id)}
                                                        className="fire-modelling__icon-btn fire-modelling__icon-btn--danger"
                                                        title="Delete layer"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Row 2: meta */}
                                            <div className="fire-modelling__card-meta">
                                                {formatTime(layer.addedAt)} · {layer.type}
                                                {total_area ? ` · ${total_area}` : ''}
                                            </div>

                                            {/* Opacity slider */}
                                            <div className="fire-modelling__control-row">
                                                <span className="fire-modelling__control-label">
                                                    Opacity: {Math.round(layer.opacity * 100)}%
                                                </span>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={Math.round(layer.opacity * 100)}
                                                    onChange={(e) => handleOpacityChange(layer.id, e.target.value)}
                                                    className="fire-modelling__slider"
                                                />
                                            </div>

                                            {/* Animation controls */}
                                            <div className="fire-modelling__anim-row">
                                                {anim ? (
                                                    <>
                                                        <button
                                                            onClick={() => resetAnimation(layer.id)}
                                                            className="fire-modelling__anim-btn"
                                                            title="Reset animation"
                                                        >
                                                            <SkipBack size={11} /> Reset
                                                        </button>
                                                        <button
                                                            onClick={() => anim.isPlaying
                                                                ? pauseAnimation(layer.id)
                                                                : startAnimation(layer.id)
                                                            }
                                                            className="fire-modelling__anim-btn fire-modelling__anim-btn--primary"
                                                            title={anim.isPlaying ? 'Pause' : 'Play'}
                                                        >
                                                            {anim.isPlaying
                                                                ? <><Pause size={11} /> Pause</>
                                                                : <><Play size={11} /> Play</>
                                                            }
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => startAnimation(layer.id)}
                                                        className="fire-modelling__anim-btn fire-modelling__anim-btn--primary"
                                                        title="Animate layer"
                                                    >
                                                        <Play size={11} /> Animate
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleResetLayer(layer.id)}
                                                    className="fire-modelling__anim-btn fire-modelling__anim-btn--icon"
                                                    title="Reset settings"
                                                >
                                                    <RotateCcw size={11} />
                                                </button>
                                            </div>

                                            {/* Frame slider (visible during animation) */}
                                            {anim && (
                                                <div className="fire-modelling__control-row">
                                                    <span className="fire-modelling__control-label">
                                                        Frame: {anim.currentFrame} / {anim.maxFrame}
                                                    </span>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max={anim.maxFrame}
                                                        value={anim.currentFrame}
                                                        onChange={(e) => setAnimationFrame(layer.id, parseInt(e.target.value))}
                                                        className="fire-modelling__slider"
                                                    />
                                                </div>
                                            )}

                                            {/* Metadata */}
                                            {Object.keys(layer.metadata).length > 0 && (
                                                <div className="fire-modelling__metadata">
                                                    {Object.entries(layer.metadata).map(([key, value]) => (
                                                        <div key={key} className="fire-modelling__meta-row">
                                                            <span className="fire-modelling__meta-key">
                                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                                            </span>
                                                            <span className="fire-modelling__meta-val">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary bar */}
                            <div className="fire-modelling__summary">
                                <div className="fire-modelling__summary-item">
                                    <span className="fire-modelling__summary-label">Total</span>
                                    <span className="fire-modelling__summary-value">{modellingLayers.length}</span>
                                </div>
                                <div className="fire-modelling__summary-item">
                                    <span className="fire-modelling__summary-label">Visible</span>
                                    <span className="fire-modelling__summary-value fire-modelling__summary-value--green">{visibleCount}</span>
                                </div>
                                <div className="fire-modelling__summary-item">
                                    <span className="fire-modelling__summary-label">Hidden</span>
                                    <span className="fire-modelling__summary-value fire-modelling__summary-value--muted">{hiddenCount}</span>
                                </div>
                                <div className="fire-modelling__summary-item">
                                    <span className="fire-modelling__summary-label">Opacity</span>
                                    <span className="fire-modelling__summary-value">{avgOpacity}%</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty state */
                        <div className="fire-modelling__empty">
                            <Layers size={28} className="fire-modelling__empty-icon" />
                            <p className="fire-modelling__empty-title">No Modelling Layers</p>
                            <p className="fire-modelling__empty-desc">
                                Add fire spread models, evacuation zones, or weather analysis layers to get started.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FireModelling;
