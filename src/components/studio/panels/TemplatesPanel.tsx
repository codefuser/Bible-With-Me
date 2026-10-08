import React, { useState } from 'react';
import { StudioTemplate, StudioProject } from '../types';
import { STUDIO_TEMPLATES } from '../studioTemplates';

interface TemplatesPanelProps {
  onApplyTemplate: (template: StudioTemplate) => void;
  activeTemplateId?: string;
}

const TEMPLATE_CATEGORIES = [
  'All',
  'Luxury',
  'Cinematic',
  'Minimal',
  'Warm',
  'Serene',
  'Nature'
];

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ onApplyTemplate, activeTemplateId }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates =
    selectedCategory === 'All'
      ? STUDIO_TEMPLATES
      : STUDIO_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#f8fafc' }}>
          Templates
        </h2>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.25rem 0.625rem',
              borderRadius: '999px',
              border: `1px solid ${selectedCategory === cat ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}`,
              backgroundColor: selectedCategory === cat ? 'rgba(245, 158, 11, 0.15)' : '#171d2d',
              color: selectedCategory === cat ? '#fbbf24' : '#cbd5e1',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {filteredTemplates.map((tpl) => {
          const isSelected = activeTemplateId === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => onApplyTemplate(tpl)}
              style={{
                borderRadius: '10px',
                border: `2px solid ${isSelected ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}`,
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: '#171d2d',
                transition: 'all 160ms ease',
                boxShadow: isSelected ? '0 0 0 2px rgba(245, 158, 11, 0.4)' : 'none'
              }}
            >
              {/* Thumbnail Gradient Preview */}
              <div
                style={{
                  height: '110px',
                  background: tpl.thumbnailGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  position: 'relative'
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#ffffff',
                    fontWeight: 700,
                    textAlign: 'center',
                    textShadow: '0 2px 6px rgba(0,0,0,0.8)'
                  }}
                >
                  {tpl.nameTa}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    fontSize: '0.625rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#cbd5e1'
                  }}
                >
                  {tpl.canvasRatio}
                </span>
              </div>

              {/* Title info */}
              <div style={{ padding: '0.5rem 0.625rem' }}>
                <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                  {tpl.name}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.6875rem', color: '#94a3b8' }}>
                  {tpl.category}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
