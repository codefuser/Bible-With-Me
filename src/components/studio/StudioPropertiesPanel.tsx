import React from 'react';
import {
  Type, Image as ImageIcon, Square, Sparkles, Sliders,
  AlignLeft, AlignCenter, AlignRight, Italic, FlipHorizontal, FlipVertical,
  Trash2, Copy, Lock, Unlock, Wand2
} from 'lucide-react';
import { StudioProject, StudioLayer, TextLayer, ImageLayer, ShapeLayer, ElementLayer, CanvasRatioId } from './types';
import { CANVAS_SIZES, TAMIL_FONTS, ENGLISH_FONTS } from './studioTemplates';

interface StudioPropertiesPanelProps {
  project: StudioProject;
  selectedLayerId: string | null;
  onUpdateLayer: (id: string, updates: Partial<StudioLayer>) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onChangeCanvasRatio: (ratioId: CanvasRatioId) => void;
  onAutoDesign: () => void;
  showSafeArea: boolean;
  onToggleSafeArea: () => void;
  snapGuidesEnabled: boolean;
  onToggleSnapGuides: () => void;
  isTa?: boolean;
}

const DEVOTIONAL_COLORS = [
  '#ffffff', '#f8fafc', '#fef08a', '#fbbf24', '#f59e0b',
  '#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#38bdf8',
  '#10b981', '#94a3b8', '#0f172a', '#000000'
];

export const StudioPropertiesPanel: React.FC<StudioPropertiesPanelProps> = ({
  project,
  selectedLayerId,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onChangeCanvasRatio,
  onAutoDesign,
  showSafeArea,
  onToggleSafeArea,
  snapGuidesEnabled,
  onToggleSnapGuides,
  isTa
}) => {
  const selectedLayer = project.layers.find(l => l.id === selectedLayerId);
  const { width: canvasW, height: canvasH } = project.canvas;

  // 1. TEXT CONTROLS
  const renderTextControls = (layer: TextLayer) => (
    <div className="space-y-3">
      {/* Live Text Editing */}
      <div>
        <span className="studio-section-label">{isTa ? 'உரை' : 'Text'}</span>
        <textarea
          value={layer.text}
          onChange={e => onUpdateLayer(layer.id, { text: e.target.value })}
          rows={3}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 font-sans focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
        />
      </div>

      {/* Font Family & Size */}
      <div>
        <span className="studio-section-label">{isTa ? 'எழுத்துரு' : 'Font Family'}</span>
        <select
          value={layer.fontFamily}
          onChange={e => onUpdateLayer(layer.id, { fontFamily: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <optgroup label="Tamil Fonts (தமிழ்)">
            {TAMIL_FONTS.map((f: any) => (
              <option key={f.family} value={f.family}>{f.nameTa} ({f.name})</option>
            ))}
          </optgroup>
          <optgroup label="English Fonts">
            {ENGLISH_FONTS.map((f: any) => (
              <option key={f.family} value={f.family}>{f.name} ({f.category})</option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{isTa ? 'அளவு' : 'Size'}</span>
            <span>{layer.fontSize}px</span>
          </div>
          <input
            type="range"
            min={14}
            max={140}
            value={layer.fontSize}
            onChange={e => onUpdateLayer(layer.id, { fontSize: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block mb-1">{isTa ? 'தடிமன்' : 'Weight'}</span>
          <select
            value={layer.fontWeight}
            onChange={e => onUpdateLayer(layer.id, { fontWeight: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 text-xs text-slate-200"
          >
            <option value="400">Regular</option>
            <option value="600">Medium</option>
            <option value="700">Bold</option>
            <option value="800">Heavy</option>
          </select>
        </div>
      </div>

      {/* Alignment & Italic */}
      <div className="flex gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
        <button
          onClick={() => onUpdateLayer(layer.id, { textAlign: 'left' })}
          className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition-colors ${
            layer.textAlign === 'left' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlignLeft size={13} />
        </button>
        <button
          onClick={() => onUpdateLayer(layer.id, { textAlign: 'center' })}
          className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition-colors ${
            layer.textAlign === 'center' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlignCenter size={13} />
        </button>
        <button
          onClick={() => onUpdateLayer(layer.id, { textAlign: 'right' })}
          className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition-colors ${
            layer.textAlign === 'right' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlignRight size={13} />
        </button>
        <button
          onClick={() => onUpdateLayer(layer.id, { fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })}
          className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition-colors ${
            layer.fontStyle === 'italic' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Italic size={13} />
        </button>
      </div>

      {/* Text Color */}
      <div>
        <span className="studio-section-label">{isTa ? 'நிறம்' : 'Color'}</span>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="color"
            value={layer.textColor.startsWith('#') ? layer.textColor : '#ffffff'}
            onChange={e => onUpdateLayer(layer.id, { textColor: e.target.value })}
            className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={layer.textColor}
            onChange={e => onUpdateLayer(layer.id, { textColor: e.target.value })}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEVOTIONAL_COLORS.map(c => (
            <button
              key={c}
              onClick={() => onUpdateLayer(layer.id, { textColor: c })}
              style={{ backgroundColor: c }}
              className={`w-4 h-4 rounded-full border ${layer.textColor === c ? 'border-amber-400 scale-125' : 'border-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {/* Spacing & Line Height */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{isTa ? 'வரி' : 'Line H'}</span>
            <span>{layer.lineHeight}</span>
          </div>
          <input
            type="range"
            min={1.1}
            max={2.2}
            step={0.05}
            value={layer.lineHeight}
            onChange={e => onUpdateLayer(layer.id, { lineHeight: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{isTa ? 'எழுத்து' : 'Letter Sp'}</span>
            <span>{layer.letterSpacing}px</span>
          </div>
          <input
            type="range"
            min={-1}
            max={8}
            step={0.5}
            value={layer.letterSpacing}
            onChange={e => onUpdateLayer(layer.id, { letterSpacing: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>
      </div>

      {/* Text Shadow */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="studio-section-label mb-0">{isTa ? 'நிழல்' : 'Shadow / Glow'}</span>
          <span className="text-[10px] text-slate-400">{layer.shadowBlur}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={30}
          value={layer.shadowBlur}
          onChange={e => onUpdateLayer(layer.id, { shadowBlur: Number(e.target.value) })}
          className="w-full accent-amber-500"
        />
      </div>

      {/* Alignment Shortcuts */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        <button
          onClick={() => onUpdateLayer(layer.id, { x: (canvasW - layer.width) / 2 })}
          className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 text-center"
        >
          Center X
        </button>
        <button
          onClick={() => onUpdateLayer(layer.id, { y: (canvasH - layer.height) / 2 })}
          className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 text-center"
        >
          Center Y
        </button>
      </div>
    </div>
  );

  // 2. IMAGE CONTROLS
  const renderImageControls = (layer: ImageLayer) => (
    <div className="space-y-3">
      {/* Flip */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onUpdateLayer(layer.id, { flipH: !layer.flipH })}
          className={`p-1.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 ${
            layer.flipH ? 'bg-amber-500 text-slate-950 font-bold border-amber-500' : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}
        >
          <FlipHorizontal size={13} />
          <span>Flip H</span>
        </button>
        <button
          onClick={() => onUpdateLayer(layer.id, { flipV: !layer.flipV })}
          className={`p-1.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 ${
            layer.flipV ? 'bg-amber-500 text-slate-950 font-bold border-amber-500' : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}
        >
          <FlipVertical size={13} />
          <span>Flip V</span>
        </button>
      </div>

      {/* Mask Shape */}
      <div>
        <span className="studio-section-label">{isTa ? 'வடிவ மறைப்பு' : 'Mask Frame'}</span>
        <div className="grid grid-cols-3 gap-1">
          {(['rect', 'rounded', 'circle', 'arch', 'blob'] as const).map(shape => (
            <button
              key={shape}
              onClick={() => onUpdateLayer(layer.id, { maskShape: shape })}
              className={`py-1 text-xs rounded border capitalize ${
                layer.maskShape === shape
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      {/* Adjustments */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{isTa ? 'பிரகாசம்' : 'Brightness'}</span>
            <span>{layer.brightness}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={180}
            value={layer.brightness}
            onChange={e => onUpdateLayer(layer.id, { brightness: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{isTa ? 'மாறுபாடு' : 'Contrast'}</span>
            <span>{layer.contrast}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={180}
            value={layer.contrast}
            onChange={e => onUpdateLayer(layer.id, { contrast: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{isTa ? 'மங்கலாக்கல்' : 'Blur'}</span>
            <span>{layer.blur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={layer.blur}
            onChange={e => onUpdateLayer(layer.id, { blur: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{isTa ? 'தெளிவுத்திறன்' : 'Opacity'}</span>
            <span>{Math.round(layer.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={layer.opacity}
            onChange={e => onUpdateLayer(layer.id, { opacity: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>
      </div>
    </div>
  );

  // 3. SHAPE & ELEMENT CONTROLS
  const renderShapeControls = (layer: ShapeLayer) => (
    <div className="space-y-3">
      <div>
        <span className="studio-section-label">{isTa ? 'நிரப்பு நிறம்' : 'Fill Color'}</span>
        <div className="flex items-center gap-2 mb-1.5">
          <input
            type="color"
            value={layer.fillColor.startsWith('#') ? layer.fillColor : '#0f172a'}
            onChange={e => onUpdateLayer(layer.id, { fillColor: e.target.value })}
            className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={layer.fillColor}
            onChange={e => onUpdateLayer(layer.id, { fillColor: e.target.value })}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[10px] text-slate-400 block mb-1">Border W</span>
          <input
            type="number"
            min={0}
            max={20}
            value={layer.borderWidth}
            onChange={e => onUpdateLayer(layer.id, { borderWidth: Number(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
          />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block mb-1">Border Color</span>
          <input
            type="color"
            value={layer.borderColor.startsWith('#') ? layer.borderColor : '#fbbf24'}
            onChange={e => onUpdateLayer(layer.id, { borderColor: e.target.value })}
            className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>{isTa ? 'மூலை வளைவு' : 'Radius'}</span>
          <span>{layer.borderRadius}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          value={layer.borderRadius}
          onChange={e => onUpdateLayer(layer.id, { borderRadius: Number(e.target.value) })}
          className="w-full accent-amber-500"
        />
      </div>
    </div>
  );

  const renderElementControls = (layer: ElementLayer) => (
    <div className="space-y-3">
      <div>
        <span className="studio-section-label">{isTa ? 'சின்ன நிறம்' : 'Symbol Color'}</span>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="color"
            value={layer.color.startsWith('#') ? layer.color : '#fbbf24'}
            onChange={e => onUpdateLayer(layer.id, { color: e.target.value })}
            className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={layer.color}
            onChange={e => onUpdateLayer(layer.id, { color: e.target.value })}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>{isTa ? 'ஒளி' : 'Glow Blur'}</span>
          <span>{layer.shadowBlur}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={30}
          value={layer.shadowBlur}
          onChange={e => onUpdateLayer(layer.id, { shadowBlur: Number(e.target.value) })}
          className="w-full accent-amber-500"
        />
      </div>
    </div>
  );

  // 4. DOCUMENT CONTROLS (WHEN NOTHING SELECTED)
  const renderCanvasControls = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Auto Compose Button */}
      <button
        onClick={onAutoDesign}
        className="studio-btn-primary"
      >
        <Wand2 size={15} />
        <span>{isTa ? 'தானியங்கி வடிவமைப்பு' : 'Smart Auto Compose'}</span>
      </button>

      {/* Canvas Dimensions */}
      <div className="studio-section">
        <label className="studio-section-label">{isTa ? 'பட அளவு (Ratio)' : 'Canvas Size'}</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
          {CANVAS_SIZES.map((ratio: any) => {
            const isSelected = project.canvas.ratioId === ratio.id;
            return (
              <button
                key={ratio.id}
                onClick={() => onChangeCanvasRatio(ratio.id)}
                className={`studio-btn-card ${isSelected ? 'active' : ''}`}
                style={{ padding: '0.55rem 0.65rem' }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? '#fbbf24' : '#f8fafc' }}>
                  {ratio.id}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                  {ratio.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas Guides */}
      <div className="studio-section">
        <label className="studio-section-label">{isTa ? 'வழிகாட்டிகள் (Guides)' : 'Guides & Snapping'}</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.76rem',
              color: '#f8fafc'
            }}
          >
            <span>{isTa ? 'பாதுகாப்பு எல்லை (Safe Area)' : 'Safe Area Guide'}</span>
            <input
              type="checkbox"
              checked={showSafeArea}
              onChange={onToggleSafeArea}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.76rem',
              color: '#f8fafc'
            }}
          >
            <span>{isTa ? 'தானியங்கி ஒட்டல் (Snapping)' : 'Magnetic Snapping'}</span>
            <input
              type="checkbox"
              checked={snapGuidesEnabled}
              onChange={onToggleSnapGuides}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <aside className="studio-properties-panel">
      {/* Header */}
      <div className="studio-properties-header">
        <div className="flex items-center gap-2">
          {selectedLayer ? (
            <div>
              <h4 className="text-xs font-bold text-white capitalize leading-tight">
                {selectedLayer.name}
              </h4>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                {selectedLayer.type} Layer
              </span>
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">
                {isTa ? 'கேன்வாஸ்' : 'Canvas Document'}
              </h4>
              <span className="text-[10px] text-slate-400">
                {project.canvas.width} × {project.canvas.height} px
              </span>
            </div>
          )}
        </div>

        {selectedLayer && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDuplicateLayer(selectedLayer.id)}
              title="Duplicate"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={() => onDeleteLayer(selectedLayer.id)}
              title="Delete"
              className="p-1 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="studio-properties-body">
        {selectedLayer ? (
          <>
            {selectedLayer.type === 'text' && renderTextControls(selectedLayer as TextLayer)}
            {selectedLayer.type === 'image' && renderImageControls(selectedLayer as ImageLayer)}
            {selectedLayer.type === 'shape' && renderShapeControls(selectedLayer as ShapeLayer)}
            {selectedLayer.type === 'element' && renderElementControls(selectedLayer as ElementLayer)}
          </>
        ) : (
          renderCanvasControls()
        )}
      </div>
    </aside>
  );
};
