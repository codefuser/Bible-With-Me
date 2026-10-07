import React from 'react';
import { Type, Plus, Sparkles, Bookmark, Heading, Quote } from 'lucide-react';
import { StudioProject, TextLayer } from '../types';

interface TextPanelProps {
  project: StudioProject;
  onAddLayer: (layer: TextLayer) => void;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
  selectedLayerId: string | null;
  verseTa: string;
  verseEn: string;
  reference: string;
  isTa?: boolean;
}

export const TextPanel: React.FC<TextPanelProps> = ({
  project,
  onAddLayer,
  onUpdateLayer,
  verseTa,
  verseEn,
  reference,
  isTa
}) => {
  const { width: canvasW, height: canvasH } = project.canvas;

  const handleAddTamilVerse = () => {
    const newLayer: TextLayer = {
      id: `text-ta-${Date.now()}`,
      name: 'Tamil Verse',
      type: 'text',
      role: 'verse-ta',
      x: canvasW * 0.1,
      y: canvasH * 0.35,
      width: canvasW * 0.8,
      height: 180,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: project.layers.length + 1,
      text: verseTa || 'கர்த்தர் என் வெளிச்சமும் என் இரட்சிப்புமானவர்; யாருக்கு அஞ்சுவேன்?',
      fontFamily: `'Noto Serif Tamil', Georgia, serif`,
      fontSize: Math.round(canvasW * 0.046),
      fontWeight: '600',
      fontStyle: 'normal',
      textAlign: 'center',
      textColor: '#ffffff',
      lineHeight: 1.6,
      letterSpacing: 0.5,
      textTransform: 'none',
      shadowColor: 'rgba(0,0,0,0.8)',
      shadowBlur: 12,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      strokeColor: '',
      strokeWidth: 0,
      hasBgBox: false,
      bgBoxColor: 'rgba(0,0,0,0.4)',
      bgBoxPadding: 16,
      bgBoxRadius: 8
    };
    onAddLayer(newLayer);
  };

  const handleAddEnglishVerse = () => {
    const newLayer: TextLayer = {
      id: `text-en-${Date.now()}`,
      name: 'English Verse',
      type: 'text',
      role: 'verse-en',
      x: canvasW * 0.12,
      y: canvasH * 0.58,
      width: canvasW * 0.76,
      height: 120,
      rotation: 0,
      opacity: 0.9,
      visible: true,
      locked: false,
      zIndex: project.layers.length + 1,
      text: verseEn ? `"${verseEn}"` : '"The Lord is my light and my salvation; whom shall I fear?"',
      fontFamily: `'Lora', serif`,
      fontSize: Math.round(canvasW * 0.028),
      fontWeight: '400',
      fontStyle: 'italic',
      textAlign: 'center',
      textColor: '#e2e8f0',
      lineHeight: 1.5,
      letterSpacing: 0.4,
      textTransform: 'none',
      shadowColor: 'rgba(0,0,0,0.7)',
      shadowBlur: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 1,
      strokeColor: '',
      strokeWidth: 0,
      hasBgBox: false,
      bgBoxColor: 'rgba(0,0,0,0.3)',
      bgBoxPadding: 12,
      bgBoxRadius: 6
    };
    onAddLayer(newLayer);
  };

  const handleAddReference = () => {
    const newLayer: TextLayer = {
      id: `text-ref-${Date.now()}`,
      name: 'Scripture Reference',
      type: 'text',
      role: 'reference',
      x: canvasW * 0.25,
      y: canvasH * 0.78,
      width: canvasW * 0.5,
      height: 50,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: project.layers.length + 1,
      text: `— ${reference || 'சங்கீதம் 27:1'} —`,
      fontFamily: `'Cinzel', 'Noto Serif Tamil', serif`,
      fontSize: Math.round(canvasW * 0.03),
      fontWeight: '700',
      fontStyle: 'normal',
      textAlign: 'center',
      textColor: '#fbbf24',
      lineHeight: 1.2,
      letterSpacing: 2,
      textTransform: 'uppercase',
      shadowColor: 'rgba(217,119,6,0.6)',
      shadowBlur: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 1,
      strokeColor: '',
      strokeWidth: 0,
      hasBgBox: false,
      bgBoxColor: 'rgba(0,0,0,0.3)',
      bgBoxPadding: 8,
      bgBoxRadius: 4
    };
    onAddLayer(newLayer);
  };

  const handleAddCustomText = (text: string, font: string, sizeRatio: number, weight: string) => {
    const newLayer: TextLayer = {
      id: `text-cust-${Date.now()}`,
      name: text,
      type: 'text',
      role: 'custom',
      x: canvasW * 0.15,
      y: canvasH * 0.2,
      width: canvasW * 0.7,
      height: 60,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: project.layers.length + 1,
      text,
      fontFamily: font,
      fontSize: Math.round(canvasW * sizeRatio),
      fontWeight: weight,
      fontStyle: 'normal',
      textAlign: 'center',
      textColor: '#ffffff',
      lineHeight: 1.3,
      letterSpacing: 1,
      textTransform: 'none',
      shadowColor: 'rgba(0,0,0,0.6)',
      shadowBlur: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 1,
      strokeColor: '',
      strokeWidth: 0,
      hasBgBox: false,
      bgBoxColor: '',
      bgBoxPadding: 0,
      bgBoxRadius: 0
    };
    onAddLayer(newLayer);
  };

  // Quick Font Pairing Applicator
  const handleApplyFontPairing = (fontTa: string, fontEn: string) => {
    project.layers.forEach((l) => {
      if (l.type === 'text') {
        const tl = l as TextLayer;
        if (tl.role === 'verse-ta') {
          onUpdateLayer(tl.id, { fontFamily: fontTa });
        } else if (tl.role === 'verse-en') {
          onUpdateLayer(tl.id, { fontFamily: fontEn });
        }
      }
    });
  };

  const FONT_PAIRS = [
    { name: 'Classic Devotional', fontTa: `'Noto Serif Tamil', serif`, fontEn: `'Lora', serif` },
    { name: 'Modern Clean', fontTa: `'Noto Sans Tamil', sans-serif`, fontEn: `'Inter', sans-serif` },
    { name: 'Royal Majesty', fontTa: `'Mukta Malar', sans-serif`, fontEn: `'Cinzel', serif` },
    { name: 'Scripture Calligraphy', fontTa: `'Kavivanar', cursive`, fontEn: `'Playfair Display', serif` }
  ];

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <Type size={16} className="text-amber-400" />
          <span>{isTa ? 'உரை & எழுத்துரு' : 'Text Elements'}</span>
        </h3>
      </div>

      {/* Add Scripture Layers */}
      <div className="studio-section">
        <span className="studio-section-label">
          {isTa ? 'புதிய உரை சேர்க்க' : 'Add Elements'}
        </span>
        <div className="space-y-1.5">
          <button
            onClick={handleAddTamilVerse}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-amber-500/50 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                த
              </span>
              <span className="text-xs font-semibold text-slate-100">
                {isTa ? 'தமிழ் வசனம்' : 'Tamil Scripture'}
              </span>
            </div>
            <Plus size={14} className="text-slate-400 group-hover:text-amber-400" />
          </button>

          <button
            onClick={handleAddEnglishVerse}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-amber-500/50 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 font-serif italic text-xs flex items-center justify-center">
                En
              </span>
              <span className="text-xs font-semibold text-slate-100">
                {isTa ? 'ஆங்கில மொழிபெயர்ப்பு' : 'English Translation'}
              </span>
            </div>
            <Plus size={14} className="text-slate-400 group-hover:text-indigo-400" />
          </button>

          <button
            onClick={handleAddReference}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-amber-500/50 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center">
                <Bookmark size={12} />
              </span>
              <span className="text-xs font-semibold text-slate-100">
                {isTa ? 'வேத குறிப்பு' : 'Scripture Reference'}
              </span>
            </div>
            <Plus size={14} className="text-slate-400 group-hover:text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Headings & Badges */}
      <div className="studio-section">
        <span className="studio-section-label">
          {isTa ? 'தலைப்புகள்' : 'Headings'}
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleAddCustomText(isTa ? 'இன்றைய தேவ செய்தி' : 'Word for Today', `'Cinzel', serif`, 0.036, '700')}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-xs font-semibold text-slate-200 text-center transition-all"
          >
            {isTa ? 'தேவ செய்தி' : 'Daily Word'}
          </button>
          <button
            onClick={() => handleAddCustomText(isTa ? 'காலை தியானம்' : 'Morning Devotion', `'Playfair Display', serif`, 0.032, '600')}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-xs font-semibold text-slate-200 text-center transition-all"
          >
            {isTa ? 'காலை தியானம்' : 'Morning'}
          </button>
          <button
            onClick={() => handleAddCustomText(isTa ? 'வாக்குத்தத்தம்' : 'Promise of God', `'Inter', sans-serif`, 0.03, '600')}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-xs font-semibold text-slate-200 text-center transition-all"
          >
            {isTa ? 'வாக்குத்தத்தம்' : 'Promise'}
          </button>
          <button
            onClick={() => handleAddCustomText(isTa ? 'ஆமென்' : 'Amen', `'Cinzel', serif`, 0.03, '700')}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-xs font-semibold text-slate-200 text-center transition-all"
          >
            {isTa ? 'ஆமென்' : 'Amen'}
          </button>
        </div>
      </div>

      {/* Font Pairing Presets */}
      <div className="studio-section">
        <span className="studio-section-label">
          {isTa ? 'எழுத்துரு சேர்க்கை' : 'Font Combinations'}
        </span>
        <div className="space-y-1.5">
          {FONT_PAIRS.map((pair, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyFontPairing(pair.fontTa, pair.fontEn)}
              className="w-full p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/40 text-left transition-all flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-slate-200">{pair.name}</div>
                <div className="text-[10px] text-slate-400">Serif + Sans Harmony</div>
              </div>
              <Sparkles size={12} className="text-amber-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
