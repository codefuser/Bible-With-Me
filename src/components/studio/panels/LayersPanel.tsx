import React from 'react';
import {
  Layers, Eye, EyeOff, Lock, Unlock, Trash2, Copy,
  ArrowUp, ArrowDown, Type, Image as ImageIcon, Square, Sparkles, Check
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
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {/* Type Icon */}
                <div className="w-6 h-6 rounded bg-slate-900/80 flex items-center justify-center shrink-0">
                  {getLayerIcon(layer.type)}
                </div>

                {/* Layer Name / Text snippet */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                    {layer.name}
                  </div>
                  {layer.type === 'text' && (
                    <div className="text-[10px] text-slate-400 truncate">
                      {layer.text}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  {/* Visibility Toggle */}
                  <button
                    onClick={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                    className={`p-1 rounded hover:bg-slate-700 transition-colors ${
                      layer.visible ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>

                  {/* Lock Toggle */}
                  <button
                    onClick={() => onUpdateLayer(layer.id, { locked: !layer.locked })}
                    title={layer.locked ? 'Unlock' : 'Lock'}
                    className={`p-1 rounded hover:bg-slate-700 transition-colors ${
                      layer.locked ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  >
                    {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>

                  {/* Move Up */}
                  <button
                    onClick={() => onMoveLayer(layer.id, 'up')}
                    disabled={index === 0}
                    title="Bring forward"
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowUp size={13} />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => onMoveLayer(layer.id, 'down')}
                    disabled={index === sortedLayers.length - 1}
                    title="Send backward"
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowDown size={13} />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => onDuplicateLayer(layer.id)}
                    title="Duplicate"
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-amber-400"
                  >
                    <Copy size={13} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteLayer(layer.id)}
                    title="Delete"
                    className="p-1 rounded hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
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
