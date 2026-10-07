import React, { useRef } from 'react';
import { StudioBackground } from '../types';
import { preloadStudioImage } from '../studioRenderer';
import { Upload, Trash2, Sliders, Palette, Sparkles } from 'lucide-react';

interface BackgroundPanelProps {
  background: StudioBackground;
  onChangeBackground: (bg: StudioBackground) => void;
}

const GRADIENT_PALETTES = [
  { name: 'Sacred Gold', from: '#181206', to: '#451a03', angle: 145 },
  { name: 'Deep Midnight', from: '#0a0a23', to: '#170c36', angle: 180 },
  { name: 'Ocean Peace', from: '#041d30', to: '#0e7490', angle: 160 },
  { name: 'Sunset Fire', from: '#450a0a', to: '#ea580c', angle: 135 },
  { name: 'Emerald Sage', from: '#022c22', to: '#065f46', angle: 135 },
  { name: 'Royal Velvet', from: '#2e1065', to: '#701a75', angle: 145 },
  { name: 'Pure Charcoal', from: '#09090b', to: '#18181b', angle: 180 },
  { name: 'Divine Rose', from: '#3d0014', to: '#9f1239', angle: 135 },
];

export const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
  background,
  onChangeBackground
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const src = ev.target?.result as string;
      await preloadStudioImage(src);
      onChangeBackground({
        ...background,
        type: 'image',
        imageSrc: src,
        overlayOpacity: 0.45
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onChangeBackground({
      ...background,
      imageSrc: undefined,
      type: 'gradient'
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
      <div>
        <h2 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 800, color: '#f8fafc' }}>
          Background
        </h2>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
          Customize canvas background wallpaper, gradient or color
        </p>
      </div>

      {/* ── Background Type Tabs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', backgroundColor: '#131826', padding: '3px', borderRadius: '8px' }}>
        {(['gradient', 'solid', 'image'] as const).map((t) => (
          <button
            key={t}
            onClick={() => onChangeBackground({ ...background, type: t })}
            style={{
              padding: '0.4rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: background.type === t ? '#f59e0b' : 'transparent',
              color: background.type === t ? '#000000' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Upload Wallpaper Image Card ── */}
      <div
        style={{
          padding: '0.875rem',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: '#131826',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
            Custom Photo Wallpaper
          </span>
          {background.imageSrc && (
            <button
              onClick={handleRemoveImage}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Trash2 size={12} /> Remove
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '0.625rem',
            borderRadius: '8px',
            border: '1.5px dashed rgba(245, 158, 11, 0.5)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            color: '#fbbf24',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem'
          }}
        >
          <Upload size={15} />
          <span>{background.imageSrc ? 'Replace Wallpaper Photo' : 'Upload Wallpaper / Photo'}</span>
        </button>
      </div>

      {/* ── Gradient Presets (When in Gradient or Solid mode) ── */}
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
          Devotional Palettes
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {GRADIENT_PALETTES.map((p) => (
            <button
              key={p.name}
              onClick={() =>
                onChangeBackground({
                  ...background,
                  type: 'gradient',
                  gradientAngle: p.angle,
                  gradientStops: [
                    { offset: 0, color: p.from },
                    { offset: 1, color: p.to }
                  ]
                })
              }
              title={p.name}
              style={{
                height: '42px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: `linear-gradient(${p.angle}deg, ${p.from}, ${p.to})`,
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Image & Background Adjustments ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ margin: '0', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
          Atmosphere & Contrast
        </p>

        {/* Overlay Dark Dimness */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.72rem', color: '#cbd5e1' }}>
            <span>Dark Overlay (Readability)</span>
            <span style={{ fontWeight: 700, color: '#fbbf24' }}>{Math.round(background.overlayOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            value={Math.round(background.overlayOpacity * 100)}
            onChange={(e) =>
              onChangeBackground({
                ...background,
                overlayOpacity: Number(e.target.value) / 100
              })
            }
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />
        </div>

        {/* Blur */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.72rem', color: '#cbd5e1' }}>
            <span>Background Blur</span>
            <span style={{ fontWeight: 700, color: '#fbbf24' }}>{background.imageBlur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={background.imageBlur}
            onChange={(e) =>
              onChangeBackground({
                ...background,
                imageBlur: Number(e.target.value)
              })
            }
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />
        </div>

        {/* Vignette */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.72rem', color: '#cbd5e1' }}>
            <span>Vignette Edge Shadow</span>
            <span style={{ fontWeight: 700, color: '#fbbf24' }}>{background.vignette}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            value={background.vignette}
            onChange={(e) =>
              onChangeBackground({
                ...background,
                vignette: Number(e.target.value)
              })
            }
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />
        </div>
      </div>
    </div>
  );
};
