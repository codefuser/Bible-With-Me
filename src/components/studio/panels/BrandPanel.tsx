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
          <span>{isTa ? 'முத்திரை' : 'Watermark'}</span>
        </h3>
      </div>

      {/* Enable Toggle */}
      <div className="studio-section">
        <div className="flex items-center justify-between mb-2">
          <span className="studio-section-label mb-0">
            {isTa ? 'முத்திரையைக் காட்டு' : 'Show Watermark'}
          </span>
          <input
            type="checkbox"
            checked={watermark.enabled}
            onChange={e => onUpdateWatermark({ enabled: e.target.checked })}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>

        {watermark.enabled && (
          <div className="space-y-3 pt-2">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">
                {isTa ? 'முத்திரை உரை' : 'Watermark Text'}
              </span>
              <input
                type="text"
                value={watermark.text}
                onChange={e => onUpdateWatermark({ text: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {BRAND_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => onUpdateWatermark({ text: preset })}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700"
                >
                  {preset}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>{isTa ? 'தெளிவுத்திறன் (Opacity)' : 'Opacity'}</span>
                <span>{Math.round(watermark.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={watermark.opacity}
                onChange={e => onUpdateWatermark({ opacity: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">
                {isTa ? 'நிறம்' : 'Color'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={watermark.color.startsWith('#') ? watermark.color : '#ffffff'}
                  onChange={e => onUpdateWatermark({ color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={watermark.color}
                  onChange={e => onUpdateWatermark({ color: e.target.value })}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
