import React from 'react';
import { Type, Plus, Sparkles, Quote, Bookmark, Heading, AlignCenter } from 'lucide-react';
import { StudioProject, TextLayer } from '../types';
import { TAMIL_FONTS, ENGLISH_FONTS } from '../studioTemplates';

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
      fontFamily: 'Noto Serif Tamil',
      fontSize: Math.round(canvasW * 0.045),
      fontWeight: '700',
      fontStyle: 'normal',
      textAlign: 'center',
      textColor: '#ffffff',
      lineHeight: 1.5,
      letterSpacing: 0,
      textTransform: 'none',
      shadowColor: 'rgba(0,0,0,0.6)',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      strokeColor: 'transparent',
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
      x: canvasW * 0.1,
      y: canvasH * 0.52,
      width: canvasW * 0.8,
      height: 120,
      rotation: 0,
      opacity: 0.9,
      visible: true,
      locked: false,
      zIndex: project.layers.length + 1,
      text: verseEn || 'The Lord is my light and my salvation; whom shall I fear?',
      fontFamily: 'Lora',
      fontSize: Math.round(canvasW * 0.032),
      fontWeight: '400',
      fontStyle: 'italic',
      textAlign: 'center',
      textColor: '#f1f5f9',
      lineHeight: 1.45,
      letterSpacing: 0.5,
      textTransform: 'none',
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 1,
      strokeColor: 'transparent',
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
      x: canvasW * 0.2,
      y: canvasH * 0.72,
      width: canvasW * 0.6,
      height: 60,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: project.layers.length + 1,
      text: `— ${reference || 'Psalms 27:1'} —`,
      fontFamily: 'Cinzel',
      fontSize: Math.round(canvasW * 0.03),
      fontWeight: '700',
      fontStyle: 'normal',
      textAlign: 'center',
      textColor: '#fbbf24',
      lineHeight: 1.2,
      letterSpacing: 2,
      textTransform: 'uppercase',
      shadowColor: 'rgba(0,0,0,0.6)',
      shadowBlur: 6,
      shadowOffsetX: 0,
      shadowOffsetY: 1,
      strokeColor: 'transparent',
      strokeWidth: 0,
      hasBgBox: false,
      bgBoxColor: 'rgba(0,0,0,0.3)',
      bgBoxPadding: 8,
      bgBoxRadius: 4
    };
    onAddLayer(newLayer);
  };

  const handleAddHeading = (title: string, font: string, sizeRatio: number) => {
    const newLayer: TextLayer = {
      id: `text-head-${Date.now()}`,
      name: title,
      type: 'text',
      role: 'custom',
      x: canvasW * 0.15,
      y: canvasH * 0.2,
      width: canvasW * 0.7,
      height: 70,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: project.layers.length + 1,
      text: title,
      fontFamily: font,
      fontSize: Math.round(canvasW * sizeRatio),
      fontWeight: '800',
      fontStyle: 'normal',
      textAlign: 'center',
      textColor: '#ffffff',
      lineHeight: 1.3,
      letterSpacing: 1,
      textTransform: 'none',
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 1,
      strokeColor: 'transparent',
      strokeWidth: 0,
      hasBgBox: false,
      bgBoxColor: 'rgba(0,0,0,0.3)',
      bgBoxPadding: 8,
      bgBoxRadius: 4
    };
    onAddLayer(newLayer);
  };

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <Type size={18} className="text-amber-400" />
          <span>{isTa ? 'உரை & எழுத்துரு' : 'Typography & Text'}</span>
        </h3>
        <p className="studio-panel-desc">
          {isTa
            ? 'வசனம், மொழிபெயர்ப்பு மற்றும் தலைப்புகளைச் சேர்க்கவும்'
            : 'Add scripture, translations, headers, and scripture references.'}
        </p>
      </div>

      {/* Quick Add Scripture Blocks */}
      <div className="studio-section">
        <span className="studio-section-label">
          {isTa ? 'வேதாகம உரை தொகுதிகள்' : 'Add Scripture Elements'}
        </span>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={handleAddTamilVerse}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-amber-500/40 text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
              த
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>{isTa ? 'தமிழ் வசனம்' : 'Tamil Verse'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">Primary</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {verseTa || 'தமிழ் வேதாகம உரை'}
              </div>
            </div>
            <Plus size={16} className="text-slate-400 group-hover:text-amber-400 shrink-0" />
          </button>

          <button
            onClick={handleAddEnglishVerse}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-amber-500/40 text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-serif text-sm font-bold shrink-0">
              En
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>{isTa ? 'ஆங்கில வசனம்' : 'English Translation'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-normal">Parallel</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {verseEn || 'English scripture text'}
              </div>
            </div>
            <Plus size={16} className="text-slate-400 group-hover:text-indigo-400 shrink-0" />
          </button>

          <button
            onClick={handleAddReference}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-amber-500/40 text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Bookmark size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white">
                {isTa ? 'வேத குறிப்பு' : 'Scripture Reference'}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {reference || 'Psalms 27:1'}
              </div>
            </div>
            <Plus size={16} className="text-slate-400 group-hover:text-emerald-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* General Text Elements */}
      <div className="studio-section">
        <span className="studio-section-label">
          {isTa ? 'பிற தலைப்புகள்' : 'Headings & Badges'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAddHeading(isTa ? 'இன்றைய தேவ செய்தி' : 'Word for Today', 'Cinzel', 0.038)}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-left transition-all"
          >
            <div className="text-xs font-bold text-slate-200">
              {isTa ? 'தேவ செய்தி' : 'Daily Word'}
            </div>
            <div className="text-[10px] text-slate-400">Header title</div>
          </button>

          <button
            onClick={() => handleAddHeading(isTa ? 'காலை தியானம்' : 'Morning Devotion', 'Playfair Display', 0.035)}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-left transition-all"
          >
            <div className="text-xs font-bold text-slate-200">
              {isTa ? 'காலை தியானம்' : 'Morning'}
            </div>
            <div className="text-[10px] text-slate-400">Subtitle</div>
          </button>

          <button
            onClick={() => handleAddHeading(isTa ? 'நம்பிக்கையின் வார்த்தை' : 'Promise of God', 'Inter', 0.032)}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-left transition-all"
          >
            <div className="text-xs font-bold text-slate-200">
              {isTa ? 'வாக்குத்தத்தம்' : 'Promise'}
            </div>
            <div className="text-[10px] text-slate-400">Theme tag</div>
          </button>

          <button
            onClick={() => handleAddHeading(isTa ? 'ஆமென்' : 'Amen', 'Cinzel', 0.032)}
            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 text-left transition-all"
          >
            <div className="text-xs font-bold text-slate-200">
              {isTa ? 'ஆமென்' : 'Amen'}
            </div>
            <div className="text-[10px] text-slate-400">Closing</div>
          </button>
        </div>
      </div>

      {/* Tamil Font Showcase */}
      <div className="studio-section">
        <span className="studio-section-label">
          {isTa ? 'தமிழ் எழுத்துரு பாணிகள்' : 'Tamil Font Styles'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          {TAMIL_FONTS.map((font: any) => (
            <div
              key={font.family}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center"
            >
              <div
                style={{ fontFamily: font.family }}
                className="text-sm font-semibold text-slate-200 truncate"
              >
                {font.nameTa}
              </div>
              <div className="text-[10px] text-slate-400">{font.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
