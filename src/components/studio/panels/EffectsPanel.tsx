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
        className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 mb-2"
      >
        <Contrast size={14} />
        <span>{isTa ? 'தானியங்கி தெளிவுபடுத்து' : 'Improve Readability'}</span>
      </button>

      {/* Cinematic Frame */}
      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">
            {isTa ? 'திரைப்பட எல்லை' : 'Cinematic Frame'}
          </span>
          <input
            type="checkbox"
            checked={effects.cinematicBorder}
            onChange={e => onUpdateEffects({ cinematicBorder: e.target.checked })}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>

        {effects.cinematicBorder && (
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{isTa ? 'அகலம்' : 'Width'}</span>
              <span>{effects.borderWidth}px</span>
            </div>
            <input
              type="range"
              min={2}
              max={32}
              value={effects.borderWidth}
              onChange={e => onUpdateEffects({ borderWidth: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={effects.borderColor.startsWith('#') ? effects.borderColor : '#ffffff'}
                onChange={e => onUpdateEffects({ borderColor: e.target.value })}
                className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">{effects.borderColor}</span>
            </div>
          </div>
        )}
      </div>

      {/* Divine Light Leak */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
        <span className="text-xs font-semibold text-slate-200">
          {isTa ? 'ஒளிக்கதிர்' : 'Divine Light Leak'}
        </span>
        <input
          type="checkbox"
          checked={effects.lightLeak}
          onChange={e => onUpdateEffects({ lightLeak: e.target.checked })}
          className="w-4 h-4 accent-amber-500 cursor-pointer"
        />
      </div>

      {/* Frosted Glassmorphism Plate */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
        <span className="text-xs font-semibold text-slate-200">
          {isTa ? 'கண்ணாடி பலகை' : 'Frosted Glass Plate'}
        </span>
        <input
          type="checkbox"
          checked={effects.glassmorphism}
          onChange={e => onUpdateEffects({ glassmorphism: e.target.checked })}
          className="w-4 h-4 accent-amber-500 cursor-pointer"
        />
      </div>

      {/* Background Dimming & Blur */}
      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
        <span className="text-xs font-semibold text-slate-200 block">
          {isTa ? 'பின்னணி இருட்டடிப்பு' : 'Background Dim & Blur'}
        </span>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{isTa ? 'இருட்டடிப்பு' : 'Dim Overlay'}</span>
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
            <span>{isTa ? 'மங்கலாக்கல்' : 'Blur'}</span>
            <span>{background.imageBlur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={background.imageBlur}
            onChange={e => onUpdateBackground({ imageBlur: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{isTa ? 'விக்னெட்' : 'Vignette'}</span>
            <span>{background.vignette}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={70}
            value={background.vignette}
            onChange={e => onUpdateBackground({ vignette: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
