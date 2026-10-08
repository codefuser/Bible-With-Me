import React, { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { StudioProject, ElementLayer } from '../types';
import { STUDIO_ELEMENTS, StudioElementDef } from '../studioElements';

interface ElementsPanelProps {
  project: StudioProject;
  onAddLayer: (layer: ElementLayer) => void;
  isTa?: boolean;
}

export const ElementsPanel: React.FC<ElementsPanelProps> = ({
  project,
  onAddLayer,
  isTa
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { width: canvasW, height: canvasH } = project.canvas;

  const categories = ['All', ...Array.from(new Set(STUDIO_ELEMENTS.map(e => e.category)))];

  const filteredElements = selectedCategory === 'All'
    ? STUDIO_ELEMENTS
    : STUDIO_ELEMENTS.filter(e => e.category === selectedCategory);

  const handleAddElement = (elem: StudioElementDef) => {
    const size = Math.round(canvasW * 0.12);
    const newLayer: ElementLayer = {
      id: `elem-${Date.now()}`,
      name: elem.name,
      type: 'element',
      elementId: elem.id,
      svgPath: elem.svgPath,
      x: (canvasW - size) / 2,
      y: canvasH * 0.18,
      width: size,
      height: size,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: project.layers.length + 1,
      color: elem.defaultColor,
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 10
    };
    onAddLayer(newLayer);
  };

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <Sparkles size={16} className="text-amber-400" />
          <span>{isTa ? 'சின்னங்கள்' : 'Christian Symbols'}</span>
        </h3>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(cat => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`studio-chip ${isActive ? 'active' : ''}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Elements 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
        {filteredElements.map(elem => (
          <button
            key={elem.id}
            onClick={() => handleAddElement(elem)}
            className="studio-btn-card"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem 0.5rem',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.4rem'
              }}
            >
              <svg
                viewBox={elem.viewBox}
                style={{ width: '36px', height: '36px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
                fill={elem.svgPath.includes('M2 22') || elem.svgPath.includes('M12 22') ? 'none' : elem.defaultColor}
                stroke={elem.svgPath.includes('M2 22') || elem.svgPath.includes('M12 22') ? elem.defaultColor : 'none'}
                strokeWidth={elem.svgPath.includes('M2 22') || elem.svgPath.includes('M12 22') ? 2 : 0}
              >
                <path d={elem.svgPath} />
              </svg>
            </div>

            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#f8fafc',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {isTa ? elem.nameTa : elem.name}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
              {elem.category}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
