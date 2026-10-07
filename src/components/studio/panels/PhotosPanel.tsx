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
  { name: 'Heavenly Rays', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Misty Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Sunset Worship', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Starry Sky', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Quiet Waters', url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Golden Wheat', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80' }
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

      {/* Upload Photo Card */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 px-3 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
        >
          <Upload size={18} />
          <span>{isTa ? '+ படத்தை பதிவேற்றவும்' : '+ Upload Photo'}</span>
          <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
        </button>
      </div>

      {/* Uploaded Photos Library */}
      {uploadedPhotos.length > 0 && (
        <div className="studio-section">
          <span className="studio-section-label">
            {isTa ? 'பதிவேற்றிய படங்கள்' : 'Your Uploads'}
          </span>
          <div className="space-y-2">
            {uploadedPhotos.map((src, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-700/60"
              >
                <img
                  src={src}
                  alt="Upload"
                  className="w-12 h-12 rounded object-cover border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex gap-1">
                    <button
                      onClick={() => addImageToCanvas(src, `Photo ${i + 1}`)}
                      className="flex-1 py-1 px-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold text-center"
                    >
                      + Layer
                    </button>
                    <button
                      onClick={() => onSetBackgroundWallpaper(src)}
                      className="flex-1 py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold text-center border border-slate-700"
                    >
                      Set BG
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                  title="Delete upload"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curated Background Textures */}
      <div className="studio-section">
        <span className="studio-section-label">
          {isTa ? 'தியானப் பின்னணிகள்' : 'Devotional Inspiration'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          {CURATED_TEXTURES.map((photo, i) => (
            <div
              key={i}
              onClick={() => onSetBackgroundWallpaper(photo.url)}
              className="group relative rounded-lg overflow-hidden aspect-[4/3] border border-slate-700/60 cursor-pointer bg-slate-900"
            >
              <img
                src={photo.url}
                alt={photo.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-70 group-hover:opacity-100" />
              <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-semibold text-white truncate drop-shadow">
                {photo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
