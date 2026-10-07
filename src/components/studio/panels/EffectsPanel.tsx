import React from 'react';
import { Sparkles, Sun, Shield, Wand2, Sliders, Contrast } from 'lucide-react';
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
          <Sparkles size={18} className="text-amber-400" />
          <span>{isTa ? 'வண்ண விளைவுகள் & ஒளி' : 'Atmosphere & Effects'}</span>
        </h3>
        <p className="studio-panel-desc">
          {isTa
            ? 'திரைப்பட பாணி எல்லைகள், பரலோக ஒளிக்கதிர்கள் மற்றும் வாசிப்புத் தெளிவை அமைக்கவும்'
            : 'Cinematic borders, divine light leaks, frosted glass, and readability enhancement.'}
        </p>
      </div>

      {/* Auto Readability Enhancer */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-500/15 to-slate-800 border border-amber-500/30 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Wand2 size={16} className="text-amber-400" />
          <span className="text-xs font-bold text-white">
            {isTa ? 'வாசிப்புத் தெளிவை மேம்படுத்து' : 'Smart Readability Boost'}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
          {isTa
            ? 'பின்னணி வெளிச்சமாக இருந்தால் உரை தெளிவாகத் தெரிய தானாகவே இருட்டடிப்பு மற்றும் நிழலைச் சேர்க்கும்.'
            : 'Balances overlay dimming, text shadows, and contrast so scripture stays perfectly legible.'}
        </p>
        <button
          onClick={onAutoReadability}
          className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-amber-950/40"
        >
          <Contrast size={14} />
          <span>{isTa ? 'தானியங்கி தெளிவுபடுத்து' : 'Improve Readability'}</span>
        </button>
      </div>

      {/* Cinematic Border */}
      <div className="studio-section">
        <div className="flex items-center justify-between mb-2">
          <span className="studio-section-label mb-0">
            {isTa ? 'திரைப்பட பாணி எல்லை (Cinematic Border)' : 'Cinematic Frame Border'}
          </span>
          <input
            type="checkbox"
            checked={effects.cinematicBorder}
            onChange={e => onUpdateEffects({ cinematicBorder: e.target.checked })}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>

        {effects.cinematicBorder && (
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>{isTa ? 'எல்லை அகலம்' : 'Border Width'}</span>
                <span>{effects.borderWidth}px</span>
              </div>
              <input
                type="range"
                min={2}
                max={48}
                value={effects.borderWidth}
                onChange={e => onUpdateEffects({ borderWidth: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">
                {isTa ? 'எல்லை நிறம்' : 'Border Color'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={effects.borderColor.startsWith('#') ? effects.borderColor : '#ffffff'}
                  onChange={e => onUpdateEffects({ borderColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={effects.borderColor}
                  onChange={e => onUpdateEffects({ borderColor: e.target.value })}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Divine Light Leak */}
      <div className="studio-section">
        <div className="flex items-center justify-between mb-1">
          <span className="studio-section-label mb-0">
            {isTa ? 'பரலோக ஒளிக்கதிர் (Light Leak)' : 'Divine Light Leak'}
          </span>
          <input
            type="checkbox"
            checked={effects.lightLeak}
            onChange={e => onUpdateEffects({ lightLeak: e.target.checked })}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>
        <p className="text-[10px] text-slate-500">
          {isTa ? 'மூலையில் மென்மையான பொன் ஒளி பிரகாசத்தை சேர்க்கும்' : 'Adds a soft golden luminous burst in corner.'}
        </p>
      </div>

      {/* Frosted Glassmorphism Plate */}
      <div className="studio-section">
        <div className="flex items-center justify-between mb-1">
          <span className="studio-section-label mb-0">
            {isTa ? 'கண்ணாடி ஒளிப்பலகை (Frosted Glass)' : 'Frosted Glass Center'}
          </span>
          <input
            type="checkbox"
            checked={effects.glassmorphism}
            onChange={e => onUpdateEffects({ glassmorphism: e.target.checked })}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>
        <p className="text-[10px] text-slate-500">
          {isTa ? 'மையத்தில் உரைக்கு பின்னால் மென்மையான உறைந்த கண்ணாடி தகடு' : 'Subtle translucent frosted plate beneath verse.'}
        </p>
      </div>

      {/* Duotone Tint */}
      <div className="studio-section">
        <div className="flex items-center justify-between mb-2">
          <span className="studio-section-label mb-0">
            {isTa ? 'இருவண்ண பாணி (Duotone Mood)' : 'Duotone Gradient Mood'}
          </span>
          <input
            type="checkbox"
            checked={effects.duotone}
            onChange={e => onUpdateEffects({ duotone: e.target.checked })}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>

        {effects.duotone && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Dark Tone</span>
              <input
                type="color"
                value={effects.duotoneDark || '#0f172a'}
                onChange={e => onUpdateEffects({ duotoneDark: e.target.value })}
                className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Light Tone</span>
              <input
                type="color"
                value={effects.duotoneLight || '#f59e0b'}
                onChange={e => onUpdateEffects({ duotoneLight: e.target.value })}
                className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Background Dimming & Blur */}
      <div className="studio-section">
        <span className="studio-section-label">
          {isTa ? 'பின்னணி நிழல் & மங்கலாக்கல்' : 'Background Dim & Blur'}
        </span>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>{isTa ? 'இருட்டடிப்பு (Dim Overlay)' : 'Dark Dimming'}</span>
              <span>{Math.round(background.overlayOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.9}
              step={0.05}
              value={background.overlayOpacity}
              onChange={e => onUpdateBackground({ overlayOpacity: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>{isTa ? 'மங்கலாக்கல் (Blur)' : 'Background Blur'}</span>
              <span>{background.imageBlur}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={24}
              value={background.imageBlur}
              onChange={e => onUpdateBackground({ imageBlur: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>{isTa ? 'விக்னெட் (Vignette Edges)' : 'Vignette Edges'}</span>
              <span>{background.vignette}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              value={background.vignette}
              onChange={e => onUpdateBackground({ vignette: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
