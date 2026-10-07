import React from 'react';
import { Square, Circle, Minus, Star, Heart, Plus } from 'lucide-react';
import { StudioProject, ShapeLayer } from '../types';

interface ShapesPanelProps {
  project: StudioProject;
  onAddLayer: (layer: ShapeLayer) => void;
  isTa?: boolean;
}

interface ShapeDef {
  id: ShapeLayer['shapeType'];
  name: string;
  nameTa: string;
  wRatio: number;
  hRatio: number;
  radius: number;
  fill: string;
  border: string;
  borderW: number;
  icon: React.ReactNode;
}

export const ShapesPanel: React.FC<ShapesPanelProps> = ({
  project,
  onAddLayer,
  isTa
}) => {
  const { width: canvasW, height: canvasH } = project.canvas;

  const SHAPE_PRESETS: ShapeDef[] = [
    {
      id: 'rounded',
      name: 'Card Backplate',
      nameTa: 'அட்டை பின்னணி பலகை',
      wRatio: 0.84,
      hRatio: 0.6,
      radius: 28,
      fill: 'rgba(15, 23, 42, 0.65)',
      border: 'rgba(255, 255, 255, 0.15)',
      borderW: 1.5,
      icon: <Square size={20} className="rounded-md" />
    },
    {
      id: 'rect',
      name: 'Rectangle Box',
      nameTa: 'செவ்வகம்',
      wRatio: 0.8,
      hRatio: 0.5,
      radius: 0,
      fill: 'rgba(0, 0, 0, 0.45)',
      border: '#fbbf24',
      borderW: 2,
      icon: <Square size={20} />
    },
    {
      id: 'circle',
      name: 'Circle Halo',
      nameTa: 'வட்டம்',
      wRatio: 0.35,
      hRatio: 0.35,
      radius: 999,
      fill: 'rgba(251, 191, 36, 0.12)',
      border: 'rgba(251, 191, 36, 0.4)',
      borderW: 1.5,
      icon: <Circle size={20} />
    },
    {
      id: 'arch',
      name: 'Cathedral Arch',
      nameTa: 'ஆலய வளைவு',
      wRatio: 0.75,
      hRatio: 0.65,
      radius: 36,
      fill: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.25)',
      borderW: 1.5,
      icon: <Square size={20} className="rounded-t-2xl" />
    },
    {
      id: 'line',
      name: 'Divider Line',
      nameTa: 'பிரிப்புக் கோடு',
      wRatio: 0.4,
      hRatio: 0.005,
      radius: 2,
      fill: '#fbbf24',
      border: 'transparent',
      borderW: 0,
      icon: <Minus size={20} />
    },
    {
      id: 'star',
      name: 'Light Star',
      nameTa: 'நட்சத்திரம்',
      wRatio: 0.15,
      hRatio: 0.15,
      radius: 0,
      fill: '#fbbf24',
      border: 'transparent',
      borderW: 0,
      icon: <Star size={20} />
    },
    {
      id: 'heart',
      name: 'Grace Heart',
      nameTa: 'அன்பின் இதயம்',
      wRatio: 0.15,
      hRatio: 0.15,
      radius: 0,
      fill: '#f43f5e',
      border: 'transparent',
      borderW: 0,
      icon: <Heart size={20} />
    }
  ];

  const handleAddShape = (shape: ShapeDef) => {
    const width = Math.round(canvasW * shape.wRatio);
    const height = Math.max(4, Math.round(canvasH * shape.hRatio));

    const newLayer: ShapeLayer = {
      id: `shape-${Date.now()}`,
      name: shape.name,
      type: 'shape',
      shapeType: shape.id,
      x: (canvasW - width) / 2,
      y: (canvasH - height) / 2,
      width,
      height,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 1, // usually behind text
      fillColor: shape.fill,
      borderColor: shape.border,
      borderWidth: shape.borderW,
      borderRadius: shape.radius,
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 12
    };
    onAddLayer(newLayer);
  };

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <Square size={18} className="text-amber-400" />
          <span>{isTa ? 'வடிவங்கள் & பலகைகள்' : 'Shapes & Backplates'}</span>
        </h3>
        <p className="studio-panel-desc">
          {isTa
            ? 'உரையின் கீழ் வைக்க கண்ணாடி பலகைகள், கோடுகள் மற்றும் வடிவங்களை சேர்க்கவும்'
            : 'Add frosted glass cards, divider accents, and framing shapes.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SHAPE_PRESETS.map(shape => (
          <button
            key={shape.id}
            onClick={() => handleAddShape(shape)}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 shrink-0 border border-slate-700">
              {shape.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 truncate">
                {isTa ? shape.nameTa : shape.name}
              </div>
              <div className="text-[10px] text-slate-400">Click to insert</div>
            </div>
            <Plus size={14} className="text-slate-500 group-hover:text-amber-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
