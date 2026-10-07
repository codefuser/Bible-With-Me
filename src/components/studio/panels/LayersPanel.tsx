import React from 'react';
import {
  Layers, Eye, EyeOff, Lock, Unlock, Trash2, Copy,
  ArrowUp, ArrowDown, Type, Image as ImageIcon, Square, Sparkles
} from 'lucide-react';
import { StudioProject, StudioLayer } from '../types';

interface LayersPanelProps {
  project: StudioProject;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<StudioLayer>) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  isTa?: boolean;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  project,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onMoveLayer,
  isTa
}) => {
  // Sort layers descending by zIndex so topmost layer appears at top of the UI list
  const sortedLayers = [...project.layers].sort((a, b) => b.zIndex - a.zIndex);

  const getLayerIcon = (type: StudioLayer['type']) => {
    switch (type) {
      case 'text': return <Type size={14} className="text-amber-400" />;
      case 'image': return <ImageIcon size={14} className="text-indigo-400" />;
      case 'shape': return <Square size={14} className="text-emerald-400" />;
      case 'element': return <Sparkles size={14} className="text-rose-400" />;
    }
  };

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <Layers size={16} className="text-amber-400" />
          <span>{isTa ? 'அடுக்குகள்' : 'Layers'}</span>
          <span className="text-[11px] text-slate-400 ml-auto font-normal">
            ({project.layers.length})
          </span>
        </h3>
      </div>

      {sortedLayers.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500">
          {isTa ? 'எந்த லேயரும் இல்லை. புதிய உரை அல்லது சின்னத்தைச் சேர்க்கவும்.' : 'No layers on canvas. Add text or elements.'}
        </div>
      ) : (
        <div className="space-y-1.5">
          {sortedLayers.map((layer, index) => {
            const isSelected = layer.id === selectedLayerId;
            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={`studio-layer-card ${isSelected ? 'active' : ''}`}
              >
                {/* Type Icon Badge */}
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getLayerIcon(layer.type)}
                </div>

                {/* Layer Name / Text snippet */}
                <div className="flex-1 min-w-0" style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: isSelected ? '#fbbf24' : '#f1f5f9',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {layer.name}
                  </div>
                  {layer.type === 'text' && (
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: '#94a3b8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '1px'
                      }}
                    >
                      {layer.text}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Visibility Toggle */}
                  <button
                    onClick={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                    className={`studio-btn-icon ${layer.visible ? '' : 'text-slate-600'}`}
                  >
                    {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>

                  {/* Lock Toggle */}
                  <button
                    onClick={() => onUpdateLayer(layer.id, { locked: !layer.locked })}
                    title={layer.locked ? 'Unlock' : 'Lock'}
                    className={`studio-btn-icon ${layer.locked ? 'active' : ''}`}
                  >
                    {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>

                  {/* Move Up */}
                  <button
                    onClick={() => onMoveLayer(layer.id, 'up')}
                    disabled={index === 0}
                    title="Bring forward"
                    className="studio-btn-icon"
                  >
                    <ArrowUp size={13} />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => onMoveLayer(layer.id, 'down')}
                    disabled={index === sortedLayers.length - 1}
                    title="Send backward"
                    className="studio-btn-icon"
                  >
                    <ArrowDown size={13} />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => onDuplicateLayer(layer.id)}
                    title="Duplicate"
                    className="studio-btn-icon"
                  >
                    <Copy size={13} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteLayer(layer.id)}
                    title="Delete"
                    className="studio-btn-icon"
                    style={{ color: '#fb7185' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
