import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Download,
  Share2,
  Image as ImageIcon,
  Sparkles,
  Check,
  ChevronDown,
  Palette,
  Type,
  Layout,
  Sliders,
  Wand2,
  RefreshCw
} from 'lucide-react';
import { useReading } from '../../context/ReadingContext';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface CardTheme {
  id: string;
  label: string;
  emoji: string;
  render: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  textColor: string;
  refColor: string;
  accentColor: string;
  dark: boolean;
}

interface AspectRatio {
  id: string;
  label: string;
  w: number;
  h: number;
  displayW: number;
  displayH: number;
}

// ─── 16 Premium Themes ───────────────────────────────────────────────────────────

const THEMES: CardTheme[] = [
  {
    id: 'gold-sunset', label: 'Gold Sunset', emoji: '🌅',
    textColor: '#1a0500', refColor: '#7c3200', accentColor: '#c2770a', dark: false,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#fbbf24'); g.addColorStop(0.45, '#f97316'); g.addColorStop(1, '#dc2626');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.10; ctx.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(w*(0.1+i*0.2), h*0.25, 50+i*30, 0, Math.PI*2); ctx.fill(); }
      ctx.restore();
    }
  },
  {
    id: 'sacred-midnight', label: 'Sacred Night', emoji: '🌌',
    textColor: '#f0e4c0', refColor: '#d4a853', accentColor: '#d4a853', dark: true,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0a0820'); g.addColorStop(0.5, '#1a1650'); g.addColorStop(1, '#130e3a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.fillStyle = '#fff';
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 137.5) * 0.5 + 0.5) * w;
        const y = (Math.cos(i * 97.3) * 0.5 + 0.5) * h * 0.7;
        ctx.globalAlpha = 0.15 + Math.abs(Math.sin(i * 0.7)) * 0.6;
        ctx.beginPath(); ctx.arc(x, y, 0.8 + (i % 3) * 0.7, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
  },
  {
    id: 'emerald-life', label: 'Emerald Life', emoji: '🌿',
    textColor: '#f0faf4', refColor: '#6ee7b7', accentColor: '#10b981', dark: true,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#052e16'); g.addColorStop(0.6, '#064e3b'); g.addColorStop(1, '#065f46');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.08; ctx.strokeStyle = '#6ee7b7'; ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(w*0.88, h*0.12, 40+i*35, 0, Math.PI*2); ctx.stroke(); }
      ctx.restore();
    }
  },
  {
    id: 'soft-lavender', label: 'Soft Lavender', emoji: '🪻',
    textColor: '#2d1668', refColor: '#7c3aed', accentColor: '#8b5cf6', dark: false,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#faf5ff'); g.addColorStop(0.5, '#ede9fe'); g.addColorStop(1, '#ddd6fe');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const r = ctx.createRadialGradient(w*0.75, h*0.25, 10, w*0.75, h*0.25, w*0.4);
      r.addColorStop(0, 'rgba(167,139,250,0.18)'); r.addColorStop(1, 'transparent');
      ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
    }
  },
  {
    id: 'violet-aurora', label: 'Violet Aurora', emoji: '🌠',
    textColor: '#f5f0ff', refColor: '#c4b5fd', accentColor: '#a78bfa', dark: true,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#1e1045'); g.addColorStop(0.5, '#2d1b69'); g.addColorStop(1, '#4c1d95');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.20;
      const a = ctx.createLinearGradient(0, h*0.2, w, h*0.8);
      a.addColorStop(0, '#7c3aed'); a.addColorStop(0.5, '#ec4899'); a.addColorStop(1, '#06b6d4');
      ctx.fillStyle = a; ctx.fillRect(0, h*0.15, w, h*0.6);
      ctx.restore();
    }
  },
  {
    id: 'ocean-deep', label: 'Ocean Deep', emoji: '🌊',
    textColor: '#e0f2fe', refColor: '#7dd3fc', accentColor: '#38bdf8', dark: true,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#082f49'); g.addColorStop(0.5, '#0c4a6e'); g.addColorStop(1, '#075985');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.08; ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(0, h*(0.3+i*0.15));
        ctx.bezierCurveTo(w*0.3, h*(0.25+i*0.15), w*0.7, h*(0.35+i*0.15), w, h*(0.3+i*0.15));
        ctx.stroke();
      }
      ctx.restore();
    }
  },
  {
    id: 'rose-grace', label: 'Rose Grace', emoji: '🌹',
    textColor: '#3d0014', refColor: '#9f1239', accentColor: '#e11d48', dark: false,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#fff1f2'); g.addColorStop(0.5, '#fce7f3'); g.addColorStop(1, '#ffd6e0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const r = ctx.createRadialGradient(w*0.2, h*0.8, 10, w*0.2, h*0.8, w*0.5);
      r.addColorStop(0, 'rgba(251,113,133,0.22)'); r.addColorStop(1, 'transparent');
      ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
    }
  },
  {
    id: 'golden-scroll', label: 'Golden Scroll', emoji: '📜',
    textColor: '#292108', refColor: '#78350f', accentColor: '#b45309', dark: false,
    render: (ctx, w, h) => {
      ctx.fillStyle = '#fef9e6'; ctx.fillRect(0, 0, w, h);
      ctx.save();
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(180,83,9,0.10)'); g.addColorStop(0.5, 'rgba(180,83,9,0.04)'); g.addColorStop(1, 'rgba(180,83,9,0.12)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#d97706'; ctx.lineWidth = Math.max(3, w*0.006);
      const pad = w * 0.045;
      ctx.strokeRect(pad, pad, w-pad*2, h-pad*2);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = Math.max(1, w*0.002);
      ctx.strokeRect(pad+w*0.012, pad+w*0.012, w-pad*2-w*0.024, h-pad*2-w*0.024);
      ctx.restore();
    }
  },
  {
    id: 'charcoal', label: 'Dark Charcoal', emoji: '🖤',
    textColor: '#f1f5f9', refColor: '#94a3b8', accentColor: '#38bdf8', dark: true,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0f172a'); g.addColorStop(1, '#1e293b');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.5;
      for (let i = 0; i < h; i += Math.max(25, h*0.025)) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }
      ctx.restore();
    }
  },
  {
    id: 'minimalist', label: 'Minimalist', emoji: '⬜',
    textColor: '#0f172a', refColor: '#475569', accentColor: '#3b82f6', dark: false,
    render: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, h*0.88, w, h*0.12);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(0, h*0.88, w*0.3, Math.max(6, h*0.006));
      ctx.restore();
    }
  },
  {
    id: 'deep-grace', label: 'Deep Grace', emoji: '✨',
    textColor: '#fef3c7', refColor: '#fbbf24', accentColor: '#f59e0b', dark: true,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#2e1065'); g.addColorStop(0.5, '#4c1d95'); g.addColorStop(1, '#7c2d12');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.14;
      const r = ctx.createRadialGradient(w/2, h*0.38, 10, w/2, h*0.38, w*0.4);
      r.addColorStop(0, '#fbbf24'); r.addColorStop(1, 'transparent');
      ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'sepia-classic', label: 'Sepia Classic', emoji: '📖',
    textColor: '#1c1001', refColor: '#6b4c11', accentColor: '#92622f', dark: false,
    render: (ctx, w, h) => {
      ctx.fillStyle = '#f4ead5'; ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(139,90,43,0.12)'); g.addColorStop(0.5, 'rgba(139,90,43,0.03)'); g.addColorStop(1, 'rgba(139,90,43,0.15)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.06; ctx.fillStyle = '#8b5a2b';
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*w, Math.random()*h, Math.random()*8+2, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }
  },
  {
    id: 'fiery-red', label: 'Fiery Spirit', emoji: '🔥',
    textColor: '#fff1e6', refColor: '#fed7aa', accentColor: '#fb923c', dark: true,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#450a0a'); g.addColorStop(0.5, '#7f1d1d'); g.addColorStop(1, '#9a3412');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.15;
      const r = ctx.createRadialGradient(w*0.5, h, 10, w*0.5, h, h*0.7);
      r.addColorStop(0, '#fb923c'); r.addColorStop(1, 'transparent');
      ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'mint-fresh', label: 'Mint Fresh', emoji: '🍃',
    textColor: '#052e16', refColor: '#166534', accentColor: '#16a34a', dark: false,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#f0fdf4'); g.addColorStop(0.5, '#dcfce7'); g.addColorStop(1, '#bbf7d0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.12;
      const r = ctx.createRadialGradient(w*0.85, h*0.1, 10, w*0.85, h*0.1, w*0.4);
      r.addColorStop(0, '#4ade80'); r.addColorStop(1, 'transparent');
      ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'royal-blue', label: 'Royal Blue', emoji: '👑',
    textColor: '#eff6ff', refColor: '#bfdbfe', accentColor: '#60a5fa', dark: true,
    render: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0c1445'); g.addColorStop(0.5, '#1e3a8a'); g.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.08; ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(w*0.9, h*0.1, 50+i*40, 0, Math.PI*2); ctx.stroke(); }
      ctx.restore();
    }
  },
  {
    id: 'custom', label: 'Custom', emoji: '🎨',
    textColor: '#f8fafc', refColor: '#cbd5e1', accentColor: '#818cf8', dark: true,
    render: (ctx, w, h) => {
      // Placeholder — overridden dynamically
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#6366f1'); g.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
  }
];

const ASPECT_RATIOS: AspectRatio[] = [
  { id: 'square',    label: '1:1',  w: 1080, h: 1080, displayW: 72, displayH: 72 },
  { id: 'story',     label: '9:16', w: 1080, h: 1920, displayW: 50, displayH: 88 },
  { id: 'landscape', label: '16:9', w: 1920, h: 1080, displayW: 96, displayH: 54 },
  { id: 'portrait',  label: '4:5',  w: 1080, h: 1350, displayW: 60, displayH: 75 },
];

// ─── Text Wrap Helper ─────────────────────────────────────────────────────────

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(' ');
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; }
      else { cur = test; }
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

// ─── Frame Renderers ─────────────────────────────────────────────────────────

function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, frameId: string, accentColor: string, dark: boolean) {
  const borderColor = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)';
  const pad = w * 0.04;
  ctx.save();
  switch (frameId) {
    case 'thin-border':
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = Math.max(2, w * 0.004);
      ctx.strokeRect(pad, pad, w - pad*2, h - pad*2);
      break;
    case 'double-border':
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = Math.max(1.5, w * 0.003);
      ctx.strokeRect(pad, pad, w - pad*2, h - pad*2);
      ctx.strokeRect(pad + w*0.02, pad + w*0.02, w - pad*2 - w*0.04, h - pad*2 - w*0.04);
      break;
    case 'corner-marks': {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = Math.max(3, w * 0.006);
      const cs = w * 0.06;
      // TL
      ctx.beginPath(); ctx.moveTo(pad, pad + cs); ctx.lineTo(pad, pad); ctx.lineTo(pad + cs, pad); ctx.stroke();
      // TR
      ctx.beginPath(); ctx.moveTo(w-pad-cs, pad); ctx.lineTo(w-pad, pad); ctx.lineTo(w-pad, pad+cs); ctx.stroke();
      // BL
      ctx.beginPath(); ctx.moveTo(pad, h-pad-cs); ctx.lineTo(pad, h-pad); ctx.lineTo(pad+cs, h-pad); ctx.stroke();
      // BR
      ctx.beginPath(); ctx.moveTo(w-pad-cs, h-pad); ctx.lineTo(w-pad, h-pad); ctx.lineTo(w-pad, h-pad-cs); ctx.stroke();
      break;
    }
    case 'glow-border':
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = Math.max(12, w * 0.02);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = Math.max(2, w * 0.004);
      ctx.globalAlpha = 0.5;
      ctx.strokeRect(pad, pad, w - pad*2, h - pad*2);
      ctx.shadowBlur = 0;
      break;
    default: break;
  }
  ctx.restore();
}

// ─── Main Canvas Drawer ───────────────────────────────────────────────────────

function drawCard(
  canvas: HTMLCanvasElement,
  verseText: string,
  referenceText: string,
  theme: CardTheme,
  customColors: { from: string; to: string; text: string; accent: string },
  frameId: string,
  showTagline: boolean,
  showQuoteMark: boolean,
  textAlign: 'left' | 'center' | 'right',
  fontSizeMultiplier: number,
  language: string,
  useCustomTheme: boolean
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const PAD = W * 0.1;
  const textWidth = W - PAD * 2;

  // Background
  if (useCustomTheme) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, customColors.from);
    g.addColorStop(1, customColors.to);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  } else {
    theme.render(ctx, W, H);
  }

  const activeTextColor = useCustomTheme ? customColors.text : theme.textColor;
  const activeAccent = useCustomTheme ? customColors.accent : theme.accentColor;
  const activeRefColor = useCustomTheme ? customColors.accent : theme.refColor;
  const isDark = useCustomTheme ? false : theme.dark;

  // Frame
  if (frameId !== 'none') {
    drawFrame(ctx, W, H, frameId, activeAccent, isDark);
  }

  // Center zone
  const centerY = H * 0.48;
  const isTamil = language === 'ta';
  const baseFontSize = Math.round(W * 0.038 * fontSizeMultiplier);
  const refFontSize = Math.round(W * 0.022);
  const tagFontSize = Math.round(W * 0.018);
  const tamilFont = `"Noto Sans Tamil", "Latha", sans-serif`;
  const latinFont = `Georgia, "Times New Roman", serif`;
  const fontStack = isTamil ? tamilFont : latinFont;

  // Quote mark
  if (showQuoteMark) {
    ctx.save();
    ctx.font = `bold ${Math.round(W * 0.16)}px Georgia, serif`;
    ctx.fillStyle = activeAccent;
    ctx.globalAlpha = 0.15;
    ctx.textAlign = 'left';
    ctx.fillText('"', PAD * 0.35, centerY - textWidth * 0.1);
    ctx.restore();
  }

  // Measure verse lines
  ctx.font = `${baseFontSize}px ${fontStack}`;
  const verseLines = wrapText(ctx, verseText, textWidth * 0.96);
  const lineH = baseFontSize * 1.65;
  const totalH = verseLines.length * lineH;
  let startY = centerY - totalH / 2;

  const xBase = textAlign === 'center' ? W / 2 : textAlign === 'left' ? PAD : W - PAD;
  ctx.textAlign = textAlign;

  // Verse text
  ctx.font = `${baseFontSize}px ${fontStack}`;
  ctx.fillStyle = activeTextColor;
  ctx.globalAlpha = 1;
  verseLines.forEach((line, i) => {
    ctx.fillText(line, xBase, startY + i * lineH);
  });

  // Separator
  const sepY = startY + totalH + baseFontSize * 0.85;
  ctx.save();
  ctx.strokeStyle = activeAccent;
  ctx.lineWidth = Math.max(2, W * 0.003);
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  const sepLen = W * 0.12;
  if (textAlign === 'center') { ctx.moveTo(W/2 - sepLen, sepY); ctx.lineTo(W/2 + sepLen, sepY); }
  else if (textAlign === 'left') { ctx.moveTo(PAD, sepY); ctx.lineTo(PAD + sepLen*2, sepY); }
  else { ctx.moveTo(W-PAD-sepLen*2, sepY); ctx.lineTo(W-PAD, sepY); }
  ctx.stroke();
  ctx.restore();

  // Reference
  ctx.font = `bold ${refFontSize}px ${fontStack}`;
  ctx.fillStyle = activeRefColor;
  ctx.globalAlpha = 1;
  ctx.textAlign = textAlign;
  ctx.fillText(`— ${referenceText}`, xBase, sepY + refFontSize * 1.7);

  // Tagline
  if (showTagline) {
    ctx.font = `${tagFontSize}px Inter, sans-serif`;
    ctx.fillStyle = activeTextColor;
    ctx.globalAlpha = 0.45;
    ctx.textAlign = 'center';
    ctx.fillText('Bible My Gift · வேதாகம வரம்', W / 2, H - PAD * 0.6);
  }
}

// ─── Small Swatch Canvas ─────────────────────────────────────────────────────

const ThemeSwatch: React.FC<{ theme: CardTheme; customColors: { from: string; to: string }; isCustom: boolean }> = ({ theme, customColors, isCustom }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = 80; c.height = 80;
    const ctx = c.getContext('2d')!;
    if (isCustom) {
      const g = ctx.createLinearGradient(0, 0, 80, 80);
      g.addColorStop(0, customColors.from); g.addColorStop(1, customColors.to);
      ctx.fillStyle = g; ctx.fillRect(0, 0, 80, 80);
    } else {
      theme.render(ctx, 80, 80);
    }
  }, [theme, customColors, isCustom]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

// ─── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'theme', label: 'Theme', labelTa: 'தீம்', Icon: Palette },
  { id: 'layout', label: 'Layout', labelTa: 'அமைப்பு', Icon: Layout },
  { id: 'text', label: 'Text', labelTa: 'உரை', Icon: Type },
  { id: 'custom', label: 'Custom', labelTa: 'தனிப்பயன்', Icon: Wand2 },
];

// ─── Main Modal Component ────────────────────────────────────────────────────

export const VerseCardModal: React.FC = () => {
  const { isVerseCardOpen, verseCardData, closeVerseCard, language } = useReading();

  const previewRef = useRef<HTMLCanvasElement>(null);

  // State
  const [activeTab, setActiveTab] = useState<string>('theme');
  const [themeIdx, setThemeIdx] = useState(0);
  const [ratioIdx, setRatioIdx] = useState(0);
  const [frameId, setFrameId] = useState<string>('none');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [fontSizeMult, setFontSizeMult] = useState(1.0);
  const [showTagline, setShowTagline] = useState(true);
  const [showQuote, setShowQuote] = useState(true);
  const [customColors, setCustomColors] = useState({ from: '#6366f1', to: '#8b5cf6', text: '#ffffff', accent: '#fbbf24' });
  const [useCustom, setUseCustom] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [didDownload, setDidDownload] = useState(false);

  const theme = THEMES[themeIdx];
  const ratio = ASPECT_RATIOS[ratioIdx];

  const verseText = verseCardData
    ? language === 'en' ? verseCardData.verse.text_en
    : language === 'ta' ? verseCardData.verse.text_ta
    : `${verseCardData.verse.text_ta}\n${verseCardData.verse.text_en}`
    : '';

  const referenceText = verseCardData
    ? `${language === 'en' ? verseCardData.book.name_en : verseCardData.book.name_ta} ${verseCardData.chapter}:${verseCardData.verse.verse}`
    : '';

  // Regenerate preview
  const redraw = useCallback(() => {
    const preview = previewRef.current;
    if (!preview || !verseCardData) return;

    // Scale preview to fit display
    const PREVIEW_W = 260;
    const scale = PREVIEW_W / ratio.w;
    preview.width = ratio.w * scale;
    preview.height = ratio.h * scale;
    preview.style.width = `${preview.width}px`;
    preview.style.height = `${preview.height}px`;

    const offscreen = document.createElement('canvas');
    offscreen.width = ratio.w;
    offscreen.height = ratio.h;
    drawCard(offscreen, verseText, referenceText, theme, customColors, frameId, showTagline, showQuote, textAlign, fontSizeMult, language, useCustom);

    const dCtx = preview.getContext('2d')!;
    dCtx.clearRect(0, 0, preview.width, preview.height);
    dCtx.drawImage(offscreen, 0, 0, preview.width, preview.height);
  }, [verseCardData, ratio, theme, customColors, frameId, showTagline, showQuote, textAlign, fontSizeMult, language, useCustom, verseText, referenceText]);

  useEffect(() => {
    if (isVerseCardOpen && verseCardData) redraw();
  }, [isVerseCardOpen, verseCardData, themeIdx, ratioIdx, frameId, textAlign, fontSizeMult, showTagline, showQuote, customColors, useCustom, redraw]);

  const buildCanvas = (): HTMLCanvasElement => {
    const c = document.createElement('canvas');
    c.width = ratio.w; c.height = ratio.h;
    drawCard(c, verseText, referenceText, theme, customColors, frameId, showTagline, showQuote, textAlign, fontSizeMult, language, useCustom);
    return c;
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const c = buildCanvas();
      const link = document.createElement('a');
      link.download = `verse-${referenceText.replace(/[:\s]/g, '-')}.png`;
      link.href = c.toDataURL('image/png', 1.0);
      link.click();
      setIsDownloading(false);
      setDidDownload(true);
      setTimeout(() => setDidDownload(false), 2200);
    }, 60);
  };

  const handleShare = async () => {
    setIsDownloading(true);
    setTimeout(async () => {
      const c = buildCanvas();
      c.toBlob(async (blob) => {
        if (!blob) { setIsDownloading(false); return; }
        const file = new File([blob], `verse-card.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try { await navigator.share({ title: referenceText, text: `"${verseText}" — ${referenceText}`, files: [file] }); }
          catch {}
        } else {
          await navigator.clipboard?.writeText(`"${verseText}" — ${referenceText}\nBible My Gift`);
        }
        setIsDownloading(false);
      }, 'image/png', 1.0);
    }, 60);
  };

  if (!isVerseCardOpen || !verseCardData) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeVerseCard}
        style={{
          position: 'fixed', inset: 0, zIndex: 8999,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      />

      {/* Modal — bottom sheet on mobile, centered on desktop */}
      <div
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 9000,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          borderRadius: '1.25rem 1.25rem 0 0',
          boxShadow: '0 -12px 60px rgba(0,0,0,0.45)',
          maxHeight: '96vh',
          overflow: 'hidden'
        }}
        className="verse-card-modal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.625rem 0 0' }}>
          <div style={{ width: '2.5rem', height: '4px', borderRadius: '999px', background: 'var(--border-color)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.625rem 1rem 0.75rem',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <ImageIcon size={16} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {language === 'ta' ? 'வசன கார்டு' : 'Verse Card Creator'}
              </p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{referenceText}</p>
            </div>
          </div>
          <button className="btn-icon" onClick={closeVerseCard} style={{ width: '34px', height: '34px', color: 'var(--text-muted)' }}>
            <X size={17} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' as any }}>

          {/* Preview */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '1.25rem 1rem',
            gap: '0.875rem'
          }}>
            <div style={{
              borderRadius: '0.75rem', overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              display: 'inline-flex'
            }}>
              <canvas ref={previewRef} style={{ display: 'block', maxWidth: '260px' }} />
            </div>

            {/* Aspect Ratio Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {ASPECT_RATIOS.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setRatioIdx(i)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '999px',
                    border: '1.5px solid',
                    borderColor: ratioIdx === i ? '#f59e0b' : 'rgba(255,255,255,0.15)',
                    background: ratioIdx === i ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.06)',
                    color: ratioIdx === i ? '#fbbf24' : 'rgba(255,255,255,0.65)',
                    fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border-color)',
            position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1
          }}>
            {TABS.map(({ id, label, labelTa, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '0.2rem', padding: '0.625rem 0.25rem',
                  border: 'none', background: 'none',
                  color: activeTab === id ? 'var(--accent-color)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${activeTab === id ? 'var(--accent-color)' : 'transparent'}`,
                  cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                  transition: 'all 150ms ease'
                }}
              >
                <Icon size={16} />
                <span>{language === 'ta' ? labelTa : label}</span>
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div style={{ padding: '1rem' }}>

            {/* ── THEME TAB ── */}
            {activeTab === 'theme' && (
              <div>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {language === 'ta' ? '16 அழகான தீம்கள்' : '16 Premium Themes'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {THEMES.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => { setThemeIdx(i); if (t.id !== 'custom') setUseCustom(false); else { setUseCustom(true); setActiveTab('custom'); } }}
                      style={{
                        position: 'relative', aspectRatio: '1', borderRadius: '0.625rem',
                        border: '2.5px solid',
                        borderColor: themeIdx === i ? 'var(--accent-color)' : 'transparent',
                        padding: 0, cursor: 'pointer', overflow: 'hidden',
                        boxShadow: themeIdx === i ? '0 0 0 2px var(--accent-color)' : '0 1px 4px rgba(0,0,0,0.15)',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <ThemeSwatch theme={t} customColors={customColors} isCustom={t.id === 'custom'} />
                      {themeIdx === i && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.38)' }}>
                          <Check size={15} color="#fff" />
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.15rem', background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 600, lineHeight: 1 }}>{t.emoji}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <p style={{ margin: '0.625rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                  {theme.emoji} {theme.label}
                </p>
              </div>
            )}

            {/* ── LAYOUT TAB ── */}
            {activeTab === 'layout' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Frame */}
                <div>
                  <p style={{ margin: '0 0 0.625rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {language === 'ta' ? 'கட்டமைப்பு (Frame)' : 'Frame Style'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                      { id: 'none', label: 'None', emoji: '▭' },
                      { id: 'thin-border', label: 'Border', emoji: '⬜' },
                      { id: 'double-border', label: 'Double', emoji: '🔲' },
                      { id: 'corner-marks', label: 'Corners', emoji: '✒' },
                      { id: 'glow-border', label: 'Glow', emoji: '✨' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFrameId(f.id)}
                        style={{
                          padding: '0.5rem', borderRadius: '0.5rem',
                          border: '1.5px solid',
                          borderColor: frameId === f.id ? 'var(--accent-color)' : 'var(--border-color)',
                          background: frameId === f.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
                          color: frameId === f.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                          transition: 'all 150ms ease'
                        }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{f.emoji}</span>
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <p style={{ margin: '0 0 0.625rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {language === 'ta' ? 'உரை சீரமைப்பு' : 'Text Alignment'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {([['left', '≡ Left', 'இடது'], ['center', '≡ Center', 'நடு'], ['right', '≡ Right', 'வலது']] as const).map(([a, en, ta]) => (
                      <button
                        key={a}
                        onClick={() => setTextAlign(a)}
                        style={{
                          flex: 1, padding: '0.5rem', borderRadius: '0.5rem',
                          border: '1.5px solid',
                          borderColor: textAlign === a ? 'var(--accent-color)' : 'var(--border-color)',
                          background: textAlign === a ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
                          color: textAlign === a ? 'var(--accent-color)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                          transition: 'all 150ms ease'
                        }}
                      >
                        {language === 'ta' ? ta : en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TEXT TAB ── */}
            {activeTab === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Font size */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {language === 'ta' ? 'எழுத்து அளவு' : 'Font Size'}
                    </p>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                      {Math.round(fontSizeMult * 100)}%
                    </span>
                  </div>
                  <input
                    type="range" min={60} max={160} step={5}
                    value={Math.round(fontSizeMult * 100)}
                    onChange={e => setFontSizeMult(Number(e.target.value) / 100)}
                    style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>Small</span><span>Default</span><span>Large</span>
                  </div>
                </div>

                {/* Toggle options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { key: 'quote', value: showQuote, setter: setShowQuote, label: 'Show Quote Mark (")', labelTa: 'மேற்கோள் குறி காட்டு' },
                    { key: 'tagline', value: showTagline, setter: setShowTagline, label: 'Show App Tagline', labelTa: '"Bible My Gift" குறிப்பிட' },
                  ].map(({ key, value, setter, label, labelTa }) => (
                    <label
                      key={key}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                    >
                      <div
                        onClick={() => setter(!value)}
                        style={{
                          width: '44px', height: '24px', borderRadius: '999px', flexShrink: 0,
                          background: value ? 'var(--accent-color)' : 'var(--border-color)',
                          position: 'relative', cursor: 'pointer',
                          transition: 'background 200ms ease'
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: '3px',
                          left: value ? '23px' : '3px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: '#fff',
                          transition: 'left 200ms ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
                        }} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {language === 'ta' ? labelTa : label}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── CUSTOM TAB ── */}
            {activeTab === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{
                  padding: '0.75rem', borderRadius: '0.75rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', gap: '0.625rem'
                }}>
                  <Wand2 size={16} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {language === 'ta'
                      ? 'நீங்களே கலர் தேர்வு செய்யுங்கள்!'
                      : 'Build your own custom background & text colors!'}
                  </p>
                </div>

                {/* Enable custom */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <div
                    onClick={() => setUseCustom(!useCustom)}
                    style={{
                      width: '44px', height: '24px', borderRadius: '999px', flexShrink: 0,
                      background: useCustom ? 'var(--accent-color)' : 'var(--border-color)',
                      position: 'relative', cursor: 'pointer',
                      transition: 'background 200ms ease'
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: useCustom ? '23px' : '3px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 200ms ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
                    }} />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {language === 'ta' ? 'தனிப்பயன் கலர் பயன்படுத்து' : 'Use Custom Colors'}
                  </p>
                </label>

                {useCustom && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Color pickers */}
                    {[
                      { key: 'from', label: 'Gradient Start', labelTa: 'தொடக்க கலர்', preview: customColors.from },
                      { key: 'to', label: 'Gradient End', labelTa: 'முடிவு கலர்', preview: customColors.to },
                      { key: 'text', label: 'Text Color', labelTa: 'உரை கலர்', preview: customColors.text },
                      { key: 'accent', label: 'Accent / Line Color', labelTa: 'அலங்கார கலர்', preview: customColors.accent },
                    ].map(({ key, label, labelTa, preview }) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {language === 'ta' ? labelTa : label}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{preview}</p>
                        </div>
                        <label style={{ cursor: 'pointer' }}>
                          <div style={{
                            width: '48px', height: '32px', borderRadius: '0.5rem',
                            background: preview, border: '2px solid var(--border-color)',
                            cursor: 'pointer', overflow: 'hidden', position: 'relative'
                          }}>
                            <input
                              type="color"
                              value={preview}
                              onChange={e => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                              style={{ position: 'absolute', inset: '-6px', opacity: 0, cursor: 'pointer', width: '200%', height: '200%' }}
                            />
                          </div>
                        </label>
                      </div>
                    ))}

                    {/* Preset custom palettes */}
                    <div>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        {language === 'ta' ? 'விரைவு குறிப்புகள்' : 'Quick Presets'}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {[
                          { from: '#667eea', to: '#764ba2', text: '#fff', accent: '#fbbf24', label: 'Cosmic' },
                          { from: '#f093fb', to: '#f5576c', text: '#fff', accent: '#fef3c7', label: 'Bloom' },
                          { from: '#4facfe', to: '#00f2fe', text: '#fff', accent: '#fef9c3', label: 'Sky' },
                          { from: '#43e97b', to: '#38f9d7', text: '#052e16', accent: '#14532d', label: 'Spring' },
                          { from: '#fa709a', to: '#fee140', text: '#3d0014', accent: '#7f1d1d', label: 'Candy' },
                          { from: '#1a1a2e', to: '#16213e', text: '#e2e8f0', accent: '#818cf8', label: 'Midnight' },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => setCustomColors({ from: preset.from, to: preset.to, text: preset.text, accent: preset.accent })}
                            style={{
                              padding: '0.3rem 0.625rem',
                              borderRadius: '999px',
                              border: '1.5px solid var(--border-color)',
                              background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                              color: preset.text,
                              fontSize: '0.72rem', fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Action Buttons — sticky footer */}
        <div style={{
          padding: '0.875rem 1rem calc(0.875rem + env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border-color)',
          display: 'flex', gap: '0.625rem', flexShrink: 0,
          background: 'var(--bg-surface)'
        }}>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.8125rem', borderRadius: '0.875rem', border: 'none',
              background: didDownload
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#fff', fontWeight: 700, fontSize: '0.9375rem',
              cursor: isDownloading ? 'wait' : 'pointer',
              opacity: isDownloading ? 0.8 : 1,
              transition: 'all 200ms ease',
              boxShadow: '0 4px 16px rgba(239,68,68,0.3)'
            }}
          >
            {didDownload ? <Check size={18} /> : <Download size={18} />}
            <span>{didDownload ? (language === 'ta' ? 'பதிவிறக்கப்பட்டது!' : 'Downloaded!') : (language === 'ta' ? 'PNG பதிவிறக்கு' : 'Download PNG')}</span>
          </button>

          <button
            onClick={handleShare}
            disabled={isDownloading}
            style={{
              width: '52px', height: '52px', borderRadius: '0.875rem',
              border: '1.5px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: isDownloading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 150ms ease'
            }}
            title={language === 'ta' ? 'பகிர்' : 'Share'}
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Desktop: override to centered modal */}
      <style>{`
        @media (min-width: 640px) {
          .verse-card-modal-sheet {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            bottom: auto !important;
            right: auto !important;
            transform: translate(-50%, -50%) !important;
            width: 420px !important;
            max-height: 92vh !important;
            border-radius: 1.25rem !important;
            animation: vcModalIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        }
        @media (max-width: 639px) {
          .verse-card-modal-sheet {
            animation: vcSheetIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        }
        @keyframes vcModalIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 24px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes vcSheetIn {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
