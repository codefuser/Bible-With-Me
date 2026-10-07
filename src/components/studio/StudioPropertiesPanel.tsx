import React from 'react';
import {
  Type, Image as ImageIcon, Square, Sparkles, Sliders,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, FlipHorizontal, FlipVertical,
  Trash2, Copy, Lock, Unlock, ArrowUp, ArrowDown, Wand2, Eye, Shield,
  Layers, Maximize2, Move, RotateCw, Contrast
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
  onMoveLayer,
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

  // ─────────────────────────────────────────────────────────────
  // 1. TEXT LAYER CONTROLS
  // ─────────────────────────────────────────────────────────────
  const renderTextControls = (layer: TextLayer) => {
    return (
      <div className="space-y-4">
        {/* Text Content */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'வசன உரை' : 'Text Content'}</span>
          <textarea
            value={layer.text}
            onChange={e => onUpdateLayer(layer.id, { text: e.target.value })}
            rows={3}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
          />
        </div>

        {/* Font Family */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'எழுத்துரு (Font)' : 'Font Family'}</span>
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

        {/* Font Size & Weight */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>{isTa ? 'அளவு' : 'Size'}</span>
              <span>{layer.fontSize}px</span>
            </div>
            <input
              type="range"
              min={14}
              max={160}
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
              <option value="300">Light (300)</option>
              <option value="400">Regular (400)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
            </select>
          </div>
        </div>

        {/* Alignment & Style Buttons */}
        <div className="flex gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => onUpdateLayer(layer.id, { textAlign: 'left' })}
            className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition-colors ${
              layer.textAlign === 'left' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlignLeft size={14} />
          </button>
          <button
            onClick={() => onUpdateLayer(layer.id, { textAlign: 'center' })}
            className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition-colors ${
              layer.textAlign === 'center' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlignCenter size={14} />
          </button>
          <button
            onClick={() => onUpdateLayer(layer.id, { textAlign: 'right' })}
            className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition-colors ${
              layer.textAlign === 'right' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlignRight size={14} />
          </button>
          <button
            onClick={() => onUpdateLayer(layer.id, { fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })}
            className={`flex-1 py-1 flex items-center justify-center rounded text-xs transition-colors ${
              layer.fontStyle === 'italic' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Italic size={14} />
          </button>
        </div>

        {/* Text Color & Palette */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'எழுத்து நிறம்' : 'Text Color'}</span>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={layer.textColor.startsWith('#') ? layer.textColor : '#ffffff'}
              onChange={e => onUpdateLayer(layer.id, { textColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
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
                className={`w-5 h-5 rounded-full border ${layer.textColor === c ? 'border-amber-400 scale-110 shadow' : 'border-slate-700'}`}
              />
            ))}
          </div>
        </div>

        {/* Line Height & Letter Spacing */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>{isTa ? 'வரி இடைவெளி' : 'Line Height'}</span>
              <span>{layer.lineHeight}</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={2.4}
              step={0.05}
              value={layer.lineHeight}
              onChange={e => onUpdateLayer(layer.id, { lineHeight: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>{isTa ? 'எழுத்து இடைவெளி' : 'Letter Spacing'}</span>
              <span>{layer.letterSpacing}px</span>
            </div>
            <input
              type="range"
              min={-2}
              max={12}
              step={0.5}
              value={layer.letterSpacing}
              onChange={e => onUpdateLayer(layer.id, { letterSpacing: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        {/* Text Shadow & Glow */}
        <div className="studio-section">
          <div className="flex justify-between items-center mb-1">
            <span className="studio-section-label mb-0">{isTa ? 'உரை நிழல் / ஒளி' : 'Text Shadow & Glow'}</span>
            <span className="text-[10px] text-slate-400">{layer.shadowBlur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={layer.shadowBlur}
            onChange={e => onUpdateLayer(layer.id, { shadowBlur: Number(e.target.value) })}
            className="w-full accent-amber-500 mb-2"
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layer.shadowColor.startsWith('#') ? layer.shadowColor : '#000000'}
              onChange={e => onUpdateLayer(layer.id, { shadowColor: e.target.value })}
              className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">{isTa ? 'நிழல் நிறம்' : 'Shadow color'}</span>
          </div>
        </div>

        {/* Background Box / Highlight */}
        <div className="studio-section">
          <div className="flex items-center justify-between mb-2">
            <span className="studio-section-label mb-0">{isTa ? 'உரை பின்னணி அட்டை' : 'Highlight Box Plate'}</span>
            <input
              type="checkbox"
              checked={layer.hasBgBox}
              onChange={e => onUpdateLayer(layer.id, { hasBgBox: e.target.checked })}
              className="w-4 h-4 accent-amber-500 cursor-pointer"
            />
          </div>
          {layer.hasBgBox && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Color</span>
                <input
                  type="color"
                  value={layer.bgBoxColor.startsWith('#') ? layer.bgBoxColor : '#000000'}
                  onChange={e => onUpdateLayer(layer.id, { bgBoxColor: e.target.value })}
                  className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Radius</span>
                <input
                  type="number"
                  value={layer.bgBoxRadius}
                  onChange={e => onUpdateLayer(layer.id, { bgBoxRadius: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Alignment Shortcuts */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'விரைவு நிலைப்படுத்தல்' : 'Position Shortcuts'}</span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onUpdateLayer(layer.id, { x: (canvasW - layer.width) / 2 })}
              className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 text-center"
            >
              Center X
            </button>
            <button
              onClick={() => onUpdateLayer(layer.id, { y: (canvasH - layer.height) / 2 })}
              className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 text-center"
            >
              Center Y
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // 2. IMAGE LAYER CONTROLS
  // ─────────────────────────────────────────────────────────────
  const renderImageControls = (layer: ImageLayer) => {
    return (
      <div className="space-y-4">
        {/* Transformations & Flip */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'நிலைமாற்றம் & புரட்டு' : 'Transform & Orientation'}</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateLayer(layer.id, { flipH: !layer.flipH })}
              className={`p-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all ${
                layer.flipH ? 'bg-amber-500 text-slate-950 font-bold border-amber-500' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <FlipHorizontal size={14} />
              <span>Flip H</span>
            </button>
            <button
              onClick={() => onUpdateLayer(layer.id, { flipV: !layer.flipV })}
              className={`p-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all ${
                layer.flipV ? 'bg-amber-500 text-slate-950 font-bold border-amber-500' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <FlipVertical size={14} />
              <span>Flip V</span>
            </button>
          </div>
        </div>

        {/* Mask Shape */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'வடிவ மறைப்பு (Mask Frame)' : 'Mask Frame Shape'}</span>
          <div className="grid grid-cols-3 gap-1.5">
            {(['rect', 'rounded', 'circle', 'arch', 'blob'] as const).map(shape => (
              <button
                key={shape}
                onClick={() => onUpdateLayer(layer.id, { maskShape: shape })}
                className={`py-1.5 text-xs rounded-lg border capitalize transition-all ${
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

        {/* Filters: Brightness, Contrast, Saturation */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'பட வடிப்பான்கள் (Filters)' : 'Image Adjustments'}</span>
          <div className="space-y-2.5">
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
                <span>{isTa ? 'வண்ணச்செறிவு' : 'Saturation'}</span>
                <span>{layer.saturation}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={layer.saturation}
                onChange={e => onUpdateLayer(layer.id, { saturation: Number(e.target.value) })}
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
          </div>
        </div>

        {/* Blend Modes */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'வண்ணக் கலப்பு முறை (Blend)' : 'Blend Mode'}</span>
          <select
            value={layer.blendMode}
            onChange={e => onUpdateLayer(layer.id, { blendMode: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
          >
            <option value="normal">Normal</option>
            <option value="multiply">Multiply (Darken)</option>
            <option value="screen">Screen (Lighten)</option>
            <option value="overlay">Overlay</option>
            <option value="soft-light">Soft Light</option>
          </select>
        </div>

        {/* Opacity */}
        <div className="studio-section">
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
    );
  };

  // ─────────────────────────────────────────────────────────────
  // 3. SHAPE LAYER CONTROLS
  // ─────────────────────────────────────────────────────────────
  const renderShapeControls = (layer: ShapeLayer) => {
    return (
      <div className="space-y-4">
        {/* Fill Color */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'நிரப்பு நிறம் (Fill)' : 'Fill Color'}</span>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={layer.fillColor.startsWith('#') ? layer.fillColor : '#0f172a'}
              onChange={e => onUpdateLayer(layer.id, { fillColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={layer.fillColor}
              onChange={e => onUpdateLayer(layer.id, { fillColor: e.target.value })}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
            />
          </div>
        </div>

        {/* Border / Outline */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'எல்லைக்கோடு (Border)' : 'Border'}</span>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Width</span>
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
              <span className="text-[10px] text-slate-400 block mb-1">Color</span>
              <input
                type="color"
                value={layer.borderColor.startsWith('#') ? layer.borderColor : '#fbbf24'}
                onChange={e => onUpdateLayer(layer.id, { borderColor: e.target.value })}
                className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Corner Radius */}
        <div className="studio-section">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{isTa ? 'மூலை வளைவு' : 'Corner Radius'}</span>
            <span>{layer.borderRadius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={80}
            value={layer.borderRadius}
            onChange={e => onUpdateLayer(layer.id, { borderRadius: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // 4. ELEMENT LAYER CONTROLS
  // ─────────────────────────────────────────────────────────────
  const renderElementControls = (layer: ElementLayer) => {
    return (
      <div className="space-y-4">
        {/* Color */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'சின்னத்தின் நிறம்' : 'Symbol Color'}</span>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={layer.color.startsWith('#') ? layer.color : '#fbbf24'}
              onChange={e => onUpdateLayer(layer.id, { color: e.target.value })}
              className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={layer.color}
              onChange={e => onUpdateLayer(layer.id, { color: e.target.value })}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEVOTIONAL_COLORS.map(c => (
              <button
                key={c}
                onClick={() => onUpdateLayer(layer.id, { color: c })}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border ${layer.color === c ? 'border-amber-400 scale-110 shadow' : 'border-slate-700'}`}
              />
            ))}
          </div>
        </div>

        {/* Shadow Glow */}
        <div className="studio-section">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{isTa ? 'ஒளி பிரகாசம்' : 'Glow Shadow'}</span>
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
  };

  // ─────────────────────────────────────────────────────────────
  // 5. CANVAS / DOCUMENT CONTROLS (WHEN NOTHING SELECTED)
  // ─────────────────────────────────────────────────────────────
  const renderCanvasControls = () => {
    return (
      <div className="space-y-4">
        {/* Auto Composition Engine */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-500/15 to-slate-800 border border-amber-500/40">
          <div className="flex items-center gap-2 mb-1.5">
            <Wand2 size={16} className="text-amber-400" />
            <span className="text-xs font-bold text-white">
              {isTa ? 'தானியங்கி வடிவமைப்பு' : 'Smart Auto Design'}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            {isTa
              ? 'வசன நீளம் மற்றும் திரையின் அளவிற்கு ஏற்ப சமச்சீரான அமைப்பை உருவாக்குகிறது.'
              : 'Automatically lays out verse, reference, and ornaments in golden ratio harmony.'}
          </p>
          <button
            onClick={onAutoDesign}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 active:scale-95 transition-all"
          >
            <Wand2 size={14} />
            <span>{isTa ? 'வடிவமைப்பை உருவாக்கு' : 'Auto Compose'}</span>
          </button>
        </div>

        {/* Canvas Ratio Presets */}
        <div className="studio-section">
          <span className="studio-section-label">
            {isTa ? 'பட விகிதம் & அளவு' : 'Canvas Dimensions'}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {CANVAS_SIZES.map((ratio: any) => {
              const isSelected = project.canvas.ratioId === ratio.id;
              return (
                <button
                  key={ratio.id}
                  onClick={() => onChangeCanvasRatio(ratio.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{ratio.id}</span>
                    <span className="text-[10px] text-slate-400">{ratio.width}×{ratio.height}</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-200 truncate">
                    {isTa ? ratio.nameTa : ratio.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{ratio.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guides & Snapping */}
        <div className="studio-section">
          <span className="studio-section-label">{isTa ? 'வழிகாட்டிகள் & அளவீடு' : 'Canvas Guides'}</span>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-200">{isTa ? 'பாதுகாப்பு எல்லை (Safe Area)' : 'Safe Area Margins'}</span>
              <input
                type="checkbox"
                checked={showSafeArea}
                onChange={onToggleSafeArea}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-200">{isTa ? 'தானியங்கி ஒட்டல் (Smart Snapping)' : 'Magnetic Snapping'}</span>
              <input
                type="checkbox"
                checked={snapGuidesEnabled}
                onChange={onToggleSnapGuides}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="studio-properties-panel">
      {/* Properties Header */}
      <div className="studio-properties-header">
        <div className="flex items-center gap-2">
          {selectedLayer ? (
            <>
              {selectedLayer.type === 'text' && <Type size={16} className="text-amber-400" />}
              {selectedLayer.type === 'image' && <ImageIcon size={16} className="text-indigo-400" />}
              {selectedLayer.type === 'shape' && <Square size={16} className="text-emerald-400" />}
              {selectedLayer.type === 'element' && <Sparkles size={16} className="text-rose-400" />}
              <div>
                <h4 className="text-xs font-bold text-white capitalize leading-tight">
                  {selectedLayer.name}
                </h4>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {selectedLayer.type} Layer
                </span>
              </div>
            </>
          ) : (
            <>
              <Sliders size={16} className="text-amber-400" />
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  {isTa ? 'கேன்வாஸ் பண்புகள்' : 'Canvas Document'}
                </h4>
                <span className="text-[10px] text-slate-400">
                  {project.canvas.width} × {project.canvas.height} px
                </span>
              </div>
            </>
          )}
        </div>

        {/* Layer Quick Actions Bar (if layer selected) */}
        {selectedLayer && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateLayer(selectedLayer.id, { locked: !selectedLayer.locked })}
              title={selectedLayer.locked ? 'Unlock' : 'Lock'}
              className={`p-1.5 rounded hover:bg-slate-800 text-xs ${selectedLayer.locked ? 'text-amber-400' : 'text-slate-400'}`}
            >
              {selectedLayer.locked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
            <button
              onClick={() => onDuplicateLayer(selectedLayer.id)}
              title="Duplicate"
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={() => onDeleteLayer(selectedLayer.id)}
              title="Delete"
              className="p-1.5 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Properties Scroll Body */}
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
