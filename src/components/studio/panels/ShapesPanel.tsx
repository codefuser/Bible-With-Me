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
      nameTa: 'பின்னணி அட்டை',
      wRatio: 0.84,
      hRatio: 0.55,
      radius: 28,
      fill: 'rgba(15, 23, 42, 0.65)',
      border: 'rgba(255, 255, 255, 0.15)',
      borderW: 1.5,
      icon: <Square size={18} />
    },
    {
      id: 'rect',
      name: 'Gold Border Box',
      nameTa: 'தங்க எல்லை',
      wRatio: 0.86,
      hRatio: 0.86,
      radius: 12,
      fill: 'transparent',
      border: '#fbbf24',
      borderW: 2,
      icon: <Square size={18} />
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
      icon: <Circle size={18} />
    },
    {
      id: 'line',
      name: 'Accent Divider',
      nameTa: 'கோடு',
      wRatio: 0.5,
      hRatio: 0.005,
      radius: 99,
      fill: '#fbbf24',
      border: 'transparent',
      borderW: 0,
      icon: <Minus size={18} />
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
      zIndex: 1, // behind text
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
          <Square size={16} className="text-amber-400" />
          <span>{isTa ? 'வடிவங்கள்' : 'Shapes & Frames'}</span>
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
        {SHAPE_PRESETS.map((shape) => (
          <button
            key={shape.id}
            onClick={() => handleAddShape(shape)}
            className="studio-btn-card"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.65rem 0.5rem'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#090d16',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
                flexShrink: 0
              }}
            >
              {shape.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#f8fafc',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {isTa ? shape.nameTa : shape.name}
              </div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>+ Insert</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
