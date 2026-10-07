import React, { useRef } from 'react';
import { Image as ImageIcon, Upload, Plus, Sparkles, SlidersHorizontal } from 'lucide-react';
import { StudioProject, ImageLayer } from '../types';

interface PhotosPanelProps {
  project: StudioProject;
  onAddLayer: (layer: ImageLayer) => void;
  onSetBackgroundWallpaper: (src: string) => void;
  isTa?: boolean;
}

const CURATED_DEVOTIONAL_PHOTOS = [
  {
    name: 'Heavenly Rays',
    nameTa: 'வான ஒளிக்கதிர்',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    category: 'Sky'
  },
  {
    name: 'Misty Mountains',
    nameTa: 'பனிமலை அமைதி',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    category: 'Nature'
  },
  {
    name: 'Sunset Prayer',
    nameTa: 'அந்தி மாலை ஜெபம்',
    url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=80',
    category: 'Worship'
  },
  {
    name: 'Starry Sky',
    nameTa: 'விண்மீன் வானம்',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    category: 'Night'
  },
  {
    name: 'Quiet Waters',
    nameTa: 'அமைதியான நதி',
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80',
    category: 'Peace'
  },
  {
    name: 'Golden Hour Wheat',
    nameTa: 'பொன் கதிர் நிலம்',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    category: 'Harvest'
  },
  {
    name: 'Sacred Light Beam',
    nameTa: 'பரிசுத்த வெளிச்சம்',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    category: 'Light'
  },
  {
    name: 'Vintage Parchment',
    nameTa: 'பழங்கால தோல்சுருள்',
    url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80',
    category: 'Texture'
  }
];

export const PhotosPanel: React.FC<PhotosPanelProps> = ({
  project,
  onAddLayer,
  onSetBackgroundWallpaper,
  isTa
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { width: canvasW, height: canvasH } = project.canvas;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.onload = () => {
          const aspect = img.width / img.height;
          const targetW = Math.min(canvasW * 0.7, 600);
          const targetH = targetW / aspect;

          const newLayer: ImageLayer = {
            id: `img-${Date.now()}`,
            name: file.name.slice(0, 16) || 'Photo Layer',
            type: 'image',
            src: reader.result as string,
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
            maskShape: 'rect',
            borderRadius: 16,
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
            shadowColor: 'rgba(0,0,0,0.4)'
          };
          onAddLayer(newLayer);
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so re-uploading same file triggers event
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddStockPhoto = (url: string, name: string) => {
    const targetW = canvasW * 0.8;
    const targetH = canvasH * 0.5;

    const newLayer: ImageLayer = {
      id: `img-${Date.now()}`,
      name: name,
      type: 'image',
      src: url,
      aspectRatio: 1.5,
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
      borderRadius: 24,
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
      shadowBlur: 20,
      shadowColor: 'rgba(0,0,0,0.5)'
    };
    onAddLayer(newLayer);
  };

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <ImageIcon size={18} className="text-amber-400" />
          <span>{isTa ? 'புகைப்படங்கள் & படங்கள்' : 'Photos & Imagery'}</span>
        </h3>
        <p className="studio-panel-desc">
          {isTa
            ? 'சொந்த படங்களை பதிவேற்றவும் அல்லது தியான பின்னணி படங்களைத் தேர்ந்தெடுக்கவும்'
            : 'Upload personal photos or choose from curated devotional imagery.'}
        </p>
      </div>

      {/* Upload Button */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Upload size={16} />
          <span>{isTa ? 'படத்தை பதிவேற்றவும் (Upload Photo)' : 'Upload New Image'}</span>
        </button>
      </div>

      {/* Curated Devotional Imagery Grid */}
      <div className="studio-section">
        <span className="studio-section-label">
          {isTa ? 'ஆன்மீக புகைப்படத் தொகுப்பு' : 'Devotional Inspiration'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          {CURATED_DEVOTIONAL_PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-slate-700/60 bg-slate-900"
            >
              <img
                src={photo.url}
                alt={photo.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-white drop-shadow truncate">
                  {isTa ? photo.nameTa : photo.name}
                </span>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleAddStockPhoto(photo.url, photo.name)}
                    title={isTa ? 'பட லேயராக சேர்' : 'Add as layer'}
                    className="flex-1 py-1 rounded bg-amber-500/80 hover:bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus size={10} />
                    <span>{isTa ? 'லேயர்' : 'Layer'}</span>
                  </button>

                  <button
                    onClick={() => onSetBackgroundWallpaper(photo.url)}
                    title={isTa ? 'முழு பின்னணியாக மாற்று' : 'Set as background'}
                    className="flex-1 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-white font-medium text-[10px] flex items-center justify-center gap-1 transition-all border border-slate-600/50"
                  >
                    <span>{isTa ? 'பின்னணி' : 'BG'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
