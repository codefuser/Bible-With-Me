import React from 'react';
import { Award, Shield, Check } from 'lucide-react';
import { StudioProject } from '../types';

interface BrandPanelProps {
  project: StudioProject;
  onUpdateWatermark: (watermark: Partial<StudioProject['watermark']>) => void;
  isTa?: boolean;
}

export const BrandPanel: React.FC<BrandPanelProps> = ({
  project,
  onUpdateWatermark,
  isTa
}) => {
  const { watermark } = project;

  const BRAND_PRESETS = [
    'Bible With Me',
    'என்னோடு வேதாகமம்',
    'Daily Scripture | தினசரி வசனம்',
    'Tamil Christian Fellowship',
    'Grace & Peace'
  ];

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <Award size={16} className="text-amber-400" />
          <span>{isTa ? 'முத்திரை (Branding)' : 'Watermark & Brand'}</span>
        </h3>
      </div>

      {/* Enable Toggle Card */}
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
            {isTa ? 'முத்திரையைக் காட்டு' : 'Show Watermark'}
          </span>
          <input
            type="checkbox"
            checked={watermark.enabled}
            onChange={(e) => onUpdateWatermark({ enabled: e.target.checked })}
          />
        </div>

        {watermark.enabled && (
          <div
            style={{
              paddingTop: '0.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div>
              <label className="studio-section-label">
                {isTa ? 'முத்திரை உரை (Watermark Text)' : 'Watermark Text'}
              </label>
              <input
                type="text"
                value={watermark.text}
                onChange={(e) => onUpdateWatermark({ text: e.target.value })}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                <span>{isTa ? 'தெளிவுத்திறன்' : 'Opacity'}</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>{Math.round(watermark.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={Math.round(watermark.opacity * 100)}
                onChange={(e) => onUpdateWatermark({ opacity: Number(e.target.value) / 100 })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Brand Presets */}
      {watermark.enabled && (
        <div className="studio-section">
          <label className="studio-section-label">
            {isTa ? 'பரிந்துரைக்கப்பட்ட பெயர்கள்' : 'Brand Presets'}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {BRAND_PRESETS.map((name, i) => (
              <button
                key={i}
                onClick={() => onUpdateWatermark({ text: name })}
                className="studio-btn-card"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.75rem'
                }}
              >
                <span>{name}</span>
                {watermark.text === name && <Check size={14} color="#fbbf24" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
