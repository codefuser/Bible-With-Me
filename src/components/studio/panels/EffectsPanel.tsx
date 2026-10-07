import React from 'react';
import { Sparkles, Wand2, Contrast } from 'lucide-react';
import { StudioProject, StudioEffects, StudioBackground } from '../types';

interface EffectsPanelProps {
  project: StudioProject;
  onUpdateEffects: (effects: Partial<StudioEffects>) => void;
  onUpdateBackground: (bg: Partial<StudioBackground>) => void;
  onAutoReadability: () => void;
  isTa?: boolean;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  project,
  onUpdateEffects,
  onUpdateBackground,
  onAutoReadability,
  isTa
}) => {
  const { effects, background } = project;

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <Sparkles size={16} className="text-amber-400" />
          <span>{isTa ? 'விளைவுகள்' : 'Atmosphere & FX'}</span>
        </h3>
      </div>

      {/* Auto Readability Enhancer */}
      <button
        onClick={onAutoReadability}
        className="studio-btn-primary"
        style={{ marginBottom: '0.5rem' }}
      >
        <Contrast size={15} />
        <span>{isTa ? 'தானியங்கி தெளிவுபடுத்து' : 'Improve Readability'}</span>
      </button>

      {/* Cinematic Frame */}
      <div
        style={{
          padding: '0.75rem',
          borderRadius: '10px',
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>
            {isTa ? 'திரைப்பட எல்லை (Cinematic Frame)' : 'Cinematic Frame'}
          </span>
          <input
            type="checkbox"
            checked={effects.cinematicBorder}
            onChange={(e) => onUpdateEffects({ cinematicBorder: e.target.checked })}
          />
        </div>

        {effects.cinematicBorder && (
          <div
            style={{
              paddingTop: '0.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
              <span>{isTa ? 'எல்லை அகலம்' : 'Border Width'}</span>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>{effects.borderWidth}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={16}
              value={effects.borderWidth}
              onChange={(e) => onUpdateEffects({ borderWidth: Number(e.target.value) })}
            />
          </div>
        )}
      </div>

      {/* Frosted Glass & Atmospheric Lighting */}
      <div
        style={{
          padding: '0.75rem',
          borderRadius: '10px',
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>
            {isTa ? 'பனி கண்ணாடி விளைவு' : 'Frosted Glass (Backdrop Blur)'}
          </span>
          <input
            type="checkbox"
            checked={effects.frostedGlass}
            onChange={(e) => onUpdateEffects({ frostedGlass: e.target.checked })}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>
            {isTa ? 'சூரிய ஒளிக்கற்றை' : 'Sun Ray Light Leak'}
          </span>
          <input
            type="checkbox"
            checked={effects.lightLeak}
            onChange={(e) => onUpdateEffects({ lightLeak: e.target.checked })}
          />
        </div>
      </div>
    </div>
  );
};
