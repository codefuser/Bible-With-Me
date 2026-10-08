import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Plus, Trash2, Check, RefreshCw } from 'lucide-react';
import { StudioProject, ImageLayer } from '../types';

interface PhotosPanelProps {
  project: StudioProject;
  onAddLayer: (layer: ImageLayer) => void;
  onSetBackgroundWallpaper: (src: string) => void;
  isTa?: boolean;
}

const CURATED_TEXTURES = [
  { name: 'Heavenly Rays', nameTa: 'பரலோக ஒளி', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Misty Mountains', nameTa: 'பனிமலை சிகரம்', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Sunset Worship', nameTa: 'சூரிய அஸ்தமனம்', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Starry Sky', nameTa: 'விண்மீன் வானம்', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Quiet Waters', nameTa: 'அமைதியான நதி', url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Golden Wheat', nameTa: 'தங்க வயல்வெளி', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80' }
];

export const PhotosPanel: React.FC<PhotosPanelProps> = ({
  project,
  onAddLayer,
  onSetBackgroundWallpaper,
  isTa
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { width: canvasW, height: canvasH } = project.canvas;
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const src = reader.result;
        setUploadedPhotos((prev) => [src, ...prev]);
        addImageToCanvas(src, file.name || 'Photo');
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addImageToCanvas = (src: string, name: string) => {
    const img = new Image();
    img.onload = () => {
      const aspect = img.width / img.height;
      const targetW = Math.min(canvasW * 0.7, 500);
      const targetH = targetW / aspect;

      const newLayer: ImageLayer = {
        id: `img-${Date.now()}`,
        name: name.slice(0, 16) || 'Photo Layer',
        type: 'image',
        src,
        aspectRatio: aspect,
        x: (canvasW - targetW) / 2,
        y: (canvasH - targetH) / 2,
        width: targetW,
        height: targetH,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: project.layers.length + 1,
        flipH: false,
        flipV: false,
        maskShape: 'rounded',
        borderRadius: 20,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        vignette: 0,
        sepia: 0,
        grayscale: false,
        overlayColor: '#000000',
        overlayOpacity: 0,
        blendMode: 'normal',
        borderColor: '#ffffff',
        borderWidth: 0,
        shadowBlur: 16,
        shadowColor: 'rgba(0,0,0,0.5)'
      };
      onAddLayer(newLayer);
    };
    img.src = src;
  };

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <ImageIcon size={16} className="text-amber-400" />
          <span>{isTa ? 'புகைப்படங்கள்' : 'Photos & Imagery'}</span>
        </h3>
      </div>

      {/* Upload Photo Dropzone Card */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="studio-upload-card"
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}
          >
            <Upload size={18} />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24' }}>
            {isTa ? '+ படத்தை பதிவேற்றவும்' : '+ Upload Photo'}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            JPG, PNG, WEBP (Devotional Wallpaper)
          </span>
        </button>
      </div>

      {/* Uploaded Photos Library */}
      {uploadedPhotos.length > 0 && (
        <div className="studio-section">
          <label className="studio-section-label">
            {isTa ? 'பதிவேற்றிய படங்கள்' : 'Your Uploads'}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {uploadedPhotos.map((src, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem',
                  borderRadius: '10px',
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <img
                  src={src}
                  alt="Upload"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => addImageToCanvas(src, `Photo ${i + 1}`)}
                    className="studio-btn-card"
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      color: '#fbbf24'
                    }}
                  >
                    + Layer
                  </button>
                  <button
                    onClick={() => onSetBackgroundWallpaper(src)}
                    className="studio-btn-card"
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    Set BG
                  </button>
                </div>
                <button
                  onClick={() => setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  className="studio-btn-icon"
                  style={{ color: '#fb7185' }}
                  title="Delete upload"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curated Background Textures Grid */}
      <div className="studio-section">
        <label className="studio-section-label">
          {isTa ? 'தியானப் பின்னணிகள் (Presets)' : 'Devotional Inspiration'}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {CURATED_TEXTURES.map((photo, i) => (
            <div
              key={i}
              onClick={() => onSetBackgroundWallpaper(photo.url)}
              style={{
                position: 'relative',
                borderRadius: '10px',
                overflow: 'hidden',
                height: '95px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer',
                backgroundColor: '#111827',
                transition: 'transform 140ms ease, border-color 140ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#fbbf24';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img
                src={photo.url}
                alt={photo.name}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '6px 8px'
                }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isTa ? photo.nameTa : photo.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
