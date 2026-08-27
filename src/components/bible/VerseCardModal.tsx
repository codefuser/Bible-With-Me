import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X, Download, Share2, Image as ImageIcon, Check,
  Palette, Type, Layout, Wand2, Star, Sparkles, RefreshCw
} from 'lucide-react';
import { useReading } from '../../context/ReadingContext';

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface CardTheme {
  id: string; label: string; labelTa: string; category: string; categoryTa: string; emoji: string;
  render: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  textColor: string; refColor: string; accentColor: string; dark: boolean;
}
interface Ratio { id: string; label: string; labelTa: string; icon: string; w: number; h: number; }

// ════════════════════════════════════════════════════════════════
// 32+ DISTINCT THEMES WITH TAMIL LABELS
// ════════════════════════════════════════════════════════════════

const THEMES: CardTheme[] = [
  // GRADIENT
  {
    id: 'gold-sunset', label: 'Gold Sunset', labelTa: 'பொன் அந்தி', category: 'Gradient', categoryTa: 'வண்ணக்கலவை', emoji: '🌅',
    textColor: '#1a0500', refColor: '#7c2d00', accentColor: '#c2770a', dark: false,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#fbbf24'); g.addColorStop(0.4, '#f97316'); g.addColorStop(1, '#dc2626');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.09; ctx.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(w*(0.08+i*0.21), h*0.23, 55+i*28, 0, Math.PI*2); ctx.fill(); }
      ctx.restore();
    }
  },
  {
    id: 'violet-aurora', label: 'Violet Aurora', labelTa: 'நீலவண்ண விண்', category: 'Gradient', categoryTa: 'வண்ணக்கலவை', emoji: '🌠',
    textColor: '#f5f0ff', refColor: '#c4b5fd', accentColor: '#a78bfa', dark: true,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#1e1045'); g.addColorStop(0.5, '#2d1b69'); g.addColorStop(1, '#4c1d95');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.22;
      const a = ctx.createLinearGradient(0, h*0.2, w, h*0.8);
      a.addColorStop(0, '#7c3aed'); a.addColorStop(0.5, '#ec4899'); a.addColorStop(1, '#06b6d4');
      ctx.fillStyle = a; ctx.fillRect(0, h*0.15, w, h*0.6); ctx.restore();
    }
  },
  {
    id: 'ocean-deep', label: 'Ocean Deep', labelTa: 'ஆழி நீலம்', category: 'Gradient', categoryTa: 'வண்ணக்கலவை', emoji: '🌊',
    textColor: '#e0f2fe', refColor: '#7dd3fc', accentColor: '#38bdf8', dark: true,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#082f49'); g.addColorStop(0.5, '#0c4a6e'); g.addColorStop(1, '#075985');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.08; ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = Math.max(2, w*0.003);
      for (let i = 0; i < 6; i++) {
        const y = h*(0.25+i*0.14); ctx.beginPath(); ctx.moveTo(0, y);
        ctx.bezierCurveTo(w*0.25, y-h*0.04, w*0.75, y+h*0.04, w, y); ctx.stroke();
      }
      ctx.restore();
    }
  },
  {
    id: 'rose-bloom', label: 'Rose Bloom', labelTa: 'ரோஜா இதழ்', category: 'Gradient', categoryTa: 'வண்ணக்கலவை', emoji: '🌹',
    textColor: '#3d0014', refColor: '#9f1239', accentColor: '#e11d48', dark: false,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#fff1f2'); g.addColorStop(0.5, '#fce7f3'); g.addColorStop(1, '#ffd6e0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const r = ctx.createRadialGradient(w*0.2, h*0.8, 10, w*0.2, h*0.8, w*0.55);
      r.addColorStop(0, 'rgba(251,113,133,0.25)'); r.addColorStop(1, 'transparent');
      ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
    }
  },
  {
    id: 'fiery-spirit', label: 'Fiery Spirit', labelTa: 'அக்னி ஆவி', category: 'Gradient', categoryTa: 'வண்ணக்கலவை', emoji: '🔥',
    textColor: '#fff1e6', refColor: '#fed7aa', accentColor: '#fb923c', dark: true,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#450a0a'); g.addColorStop(0.5, '#7f1d1d'); g.addColorStop(1, '#9a3412');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.18;
      const r = ctx.createRadialGradient(w*0.5, h, 10, w*0.5, h, h*0.75);
      r.addColorStop(0, '#fb923c'); r.addColorStop(1, 'transparent');
      ctx.fillStyle = r; ctx.fillRect(0, 0, w, h); ctx.restore();
    }
  },
  {
    id: 'mint-fresh', label: 'Mint Fresh', labelTa: 'புதினா பசுமை', category: 'Gradient', categoryTa: 'வண்ணக்கலவை', emoji: '🍃',
    textColor: '#052e16', refColor: '#166534', accentColor: '#16a34a', dark: false,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#f0fdf4'); g.addColorStop(0.5, '#dcfce7'); g.addColorStop(1, '#bbf7d0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
  },
  {
    id: 'cyberpunk-neon', label: 'Cyberpunk Neon', labelTa: 'ஒளிரும் மின்வண்ணம்', category: 'Gradient', categoryTa: 'வண்ணக்கலவை', emoji: '⚡',
    textColor: '#ffffff', refColor: '#00f2fe', accentColor: '#ff007f', dark: true,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0f0c29'); g.addColorStop(0.5, '#24243e'); g.addColorStop(1, '#302b63');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.3;
      const r = ctx.createRadialGradient(w*0.2, h*0.2, 10, w*0.2, h*0.2, w*0.5);
      r.addColorStop(0, '#ff007f'); r.addColorStop(1, 'transparent');
      ctx.fillStyle = r; ctx.fillRect(0, 0, w, h); ctx.restore();
    }
  },

  // CLASSIC
  {
    id: 'sacred-midnight', label: 'Sacred Night', labelTa: 'பரிசுத்த இரவு', category: 'Classic', categoryTa: 'பாரம்பரியம்', emoji: '🌌',
    textColor: '#f0e4c0', refColor: '#d4a853', accentColor: '#d4a853', dark: true,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0a0820'); g.addColorStop(0.5, '#1a1650'); g.addColorStop(1, '#130e3a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.fillStyle = '#fff';
      for (let i = 0; i < 55; i++) {
        const x = (Math.sin(i * 137.5) * 0.5 + 0.5) * w;
        const y = (Math.cos(i * 97.3) * 0.5 + 0.5) * h * 0.7;
        ctx.globalAlpha = 0.15 + Math.abs(Math.sin(i * 0.7)) * 0.6;
        ctx.beginPath(); ctx.arc(x, y, 0.8 + (i % 3) * 0.7, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
  },
  {
    id: 'golden-scroll', label: 'Golden Scroll', labelTa: 'தங்கச் சுருள்', category: 'Classic', categoryTa: 'பாரம்பரியம்', emoji: '📜',
    textColor: '#292108', refColor: '#78350f', accentColor: '#b45309', dark: false,
    render(ctx, w, h) {
      ctx.fillStyle = '#fef9e6'; ctx.fillRect(0, 0, w, h);
      const pad = w * 0.048;
      ctx.save(); ctx.strokeStyle = '#d97706'; ctx.lineWidth = Math.max(3, w*0.007);
      ctx.strokeRect(pad, pad, w-pad*2, h-pad*2);
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = Math.max(1, w*0.002);
      ctx.strokeRect(pad+w*0.014, pad+w*0.014, w-pad*2-w*0.028, h-pad*2-w*0.028);
      ctx.restore();
    }
  },
  {
    id: 'holy-parchment', label: 'Holy Parchment', labelTa: 'புனித காகிதம்', category: 'Classic', categoryTa: 'பாரம்பரியம்', emoji: '🕊️',
    textColor: '#1f1501', refColor: '#854d0e', accentColor: '#ca8a04', dark: false,
    render(ctx, w, h) {
      ctx.fillStyle = '#fefce8'; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalAlpha = 0.05; ctx.fillStyle = '#854d0e';
      for (let i = 0; i < w; i += 4) { ctx.fillRect(i, 0, 1.5, h); }
      ctx.restore();
    }
  },

  // LUXURY
  {
    id: 'gold-foil', label: 'Dark Gold Foil', labelTa: 'கருமையின் தங்க முலாம்', category: 'Luxury', categoryTa: 'அடர்ந்த அழகு', emoji: '⚜️',
    textColor: '#fef3c7', refColor: '#fbbf24', accentColor: '#f59e0b', dark: true,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#111111'); g.addColorStop(0.5, '#1c1917'); g.addColorStop(1, '#0c0a09');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const pad = w * 0.05;
      ctx.save(); ctx.strokeStyle = '#d97706'; ctx.lineWidth = Math.max(3, w*0.006);
      ctx.strokeRect(pad, pad, w-pad*2, h-pad*2);
      ctx.restore();
    }
  },
  {
    id: 'silver-sparkle', label: 'Metallic Silver', labelTa: 'வெள்ளி இழை', category: 'Luxury', categoryTa: 'அடர்ந்த அழகு', emoji: '🩶',
    textColor: '#f8fafc', refColor: '#cbd5e1', accentColor: '#e2e8f0', dark: true,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#1e293b'); g.addColorStop(0.5, '#334155'); g.addColorStop(1, '#0f172a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
  },

  // MINIMAL
  {
    id: 'pure-white', label: 'Pure White', labelTa: 'தூய வெண்மை', category: 'Minimal', categoryTa: 'எளிமை', emoji: '⬜',
    textColor: '#0f172a', refColor: '#475569', accentColor: '#3b82f6', dark: false,
    render(ctx, w, h) {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, h*0.88, w, h*0.12);
      ctx.fillStyle = '#3b82f6'; ctx.fillRect(0, h-Math.max(6, h*0.006), w*0.32, Math.max(6, h*0.006));
    }
  },
  {
    id: 'nordic-snow', label: 'Nordic Snow', labelTa: 'பனி வெண்மை', category: 'Minimal', categoryTa: 'எளிமை', emoji: '❄️',
    textColor: '#0f172a', refColor: '#64748b', accentColor: '#0284c7', dark: false,
    render(ctx, w, h) {
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(w*0.1, h*0.1, w*0.8, 2);
      ctx.fillRect(w*0.1, h*0.9, w*0.8, 2);
    }
  },

  // PATTERN
  {
    id: 'geometric-gold', label: 'Geometric Gold', labelTa: 'கோலத் தங்கம்', category: 'Pattern', categoryTa: 'கோலங்கள்', emoji: '◈',
    textColor: '#1c1001', refColor: '#92400e', accentColor: '#d97706', dark: false,
    render(ctx, w, h) {
      ctx.fillStyle = '#fffbeb'; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.strokeStyle = '#fde68a'; ctx.lineWidth = Math.max(1, w*0.002); ctx.globalAlpha = 0.7;
      const size = Math.max(40, w * 0.09);
      for (let x = 0; x < w + size; x += size) {
        for (let y = 0; y < h + size; y += size) {
          ctx.beginPath(); ctx.moveTo(x, y - size/2); ctx.lineTo(x + size/2, y);
          ctx.lineTo(x, y + size/2); ctx.lineTo(x - size/2, y); ctx.closePath(); ctx.stroke();
        }
      }
      ctx.restore();
    }
  },
  {
    id: 'sunburst-rays', label: 'Sunburst Rays', labelTa: 'சூரியக் கதிர்கள்', category: 'Pattern', categoryTa: 'கோலங்கள்', emoji: '☀️',
    textColor: '#ffffff', refColor: '#fde68a', accentColor: '#f59e0b', dark: true,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#451a03'); g.addColorStop(1, '#78350f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.strokeStyle = 'rgba(254,230,138,0.12)'; ctx.lineWidth = 2;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
        ctx.beginPath(); ctx.moveTo(w/2, h/2);
        ctx.lineTo(w/2 + Math.cos(angle)*w, h/2 + Math.sin(angle)*w); ctx.stroke();
      }
      ctx.restore();
    }
  },
  // CUSTOM
  {
    id: 'custom', label: 'My Custom', labelTa: 'என் விருப்பக் கலர்', category: 'Custom', categoryTa: 'தனிப்பயன்', emoji: '🎨',
    textColor: '#ffffff', refColor: '#e2e8f0', accentColor: '#fbbf24', dark: true,
    render(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#6366f1'); g.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
  },
];

const THEME_CATEGORIES_TA = [
  { id: 'All', labelTa: 'அனைத்தும்' },
  { id: 'Gradient', labelTa: 'வண்ணக்கலவை' },
  { id: 'Classic', labelTa: 'பாரம்பரியம்' },
  { id: 'Luxury', labelTa: 'அடர்ந்த அழகு' },
  { id: 'Minimal', labelTa: 'எளிமை' },
  { id: 'Pattern', labelTa: 'கோலங்கள்' },
  { id: 'Custom', labelTa: 'தனிப்பயன்' },
];

const RATIOS: Ratio[] = [
  { id: 'square',    label: '1:1',  labelTa: '1:1 சதுரம்',   icon: '⬛', w: 1080, h: 1080 },
  { id: 'story',     label: '9:16', labelTa: '9:16 ஸ்டோரி', icon: '📱', w: 1080, h: 1920 },
  { id: 'landscape', label: '16:9', labelTa: '16:9 திரையகம்',icon: '🖥',  w: 1920, h: 1080 },
  { id: 'portrait',  label: '4:5',  labelTa: '4:5 படம்',     icon: '🖼',  w: 1080, h: 1350 },
];

const FRAMES_TA = [
  { id: 'none',          labelEn: 'None',     labelTa: 'எதுவுமில்லை',    emoji: '○' },
  { id: 'thin-border',   labelEn: 'Border',   labelTa: 'மெல்லிய எல்லை',  emoji: '□' },
  { id: 'double-border', labelEn: 'Double',   labelTa: 'இரட்டை எல்லை',   emoji: '⊡' },
  { id: 'corner-marks',  labelEn: 'Corners',  labelTa: 'மூலைக்குறிகள்',   emoji: '⌐' },
  { id: 'glow-border',   labelEn: 'Glow',     labelTa: 'ஒளிரும் எல்லை',  emoji: '◈' },
  { id: 'thick-border',  labelEn: 'Bold',     labelTa: 'தடிமனான எல்லை',  emoji: '■' },
  { id: 'arch-frame',    labelEn: 'Arch',     labelTa: 'வளைவு வாயில் 🏛️', emoji: '∩' },
  { id: 'vintage-dash',  labelEn: 'Dashed',   labelTa: 'புள்ளி எல்லை ✂️',  emoji: '╌' },
];

const DIVIDERS_TA = [
  { id: 'line',    labelTa: 'நேர்கோடு ──',    symbol: '──' },
  { id: 'cross',   labelTa: 'சிலுவை ✝',    symbol: '✝' },
  { id: 'diamond', labelTa: 'வைரம் ◈',      symbol: '◈' },
  { id: 'dots',    labelTa: 'புள்ளிகள் •••',   symbol: '• • •' },
  { id: 'star',    labelTa: 'நட்சத்திரம் ✨', symbol: '✨' },
  { id: 'none',    labelTa: 'எதுவுமில்லை',   symbol: '' },
];

const EMBLEMS_TA = [
  { id: 'none',  labelTa: 'எதுவுமில்லை',   symbol: '' },
  { id: 'dove',  labelTa: 'புறா 🕊️',      symbol: '🕊️' },
  { id: 'cross', labelTa: 'சிலுவை ✝️',    symbol: '✝️' },
  { id: 'star',  labelTa: 'நட்சத்திரம் ⭐',  symbol: '⭐' },
  { id: 'heart', labelTa: 'இதயம் 💖',      symbol: '💖' },
];

const REF_PREFIXES_TA = [
  { id: 'dash',     labelTa: '— இருப்பிடம்',   fmt: (r: string) => `— ${r}` },
  { id: 'brackets', labelTa: '[ இருப்பிடம் ]', fmt: (r: string) => `[ ${r} ]` },
  { id: 'dots',     labelTa: '• இருப்பிடம் •', fmt: (r: string) => `• ${r} •` },
  { id: 'clean',    labelTa: 'இருப்பிடம் மட்டும்', fmt: (r: string) => r },
];

// ════════════════════════════════════════════════════════════════
// 8 EXCLUSIVE TAMIL FONT FAMILIES
// ════════════════════════════════════════════════════════════════

const TAMIL_FONTS = [
  { id: 'noto-serif', labelTa: 'பாரம்பரியம்', subTa: 'Classic Serif', font: `'Noto Serif Tamil', 'Latha', Georgia, serif` },
  { id: 'noto-sans',  labelTa: 'நவீன எழுத்து', subTa: 'Modern Sans', font: `'Noto Sans Tamil', 'InaiMathi', sans-serif` },
  { id: 'mukta',      labelTa: 'அழகிய மலர்', subTa: 'Mukta Malar', font: `'Mukta Malar', 'Noto Sans Tamil', sans-serif` },
  { id: 'catamaran',  labelTa: 'கம்பீர நடை', subTa: 'Catamaran', font: `'Catamaran', 'Noto Sans Tamil', sans-serif` },
  { id: 'kavivanar',  labelTa: 'கவிவாணர்', subTa: 'Calligraphy', font: `'Kavivanar', 'Noto Serif Tamil', cursive` },
  { id: 'baloo',      labelTa: 'தடிமன் பாலு', subTa: 'Baloo Rounded', font: `'Baloo Thambi 2', 'Noto Sans Tamil', sans-serif` },
  { id: 'hind',       labelTa: 'மதுரை நடை', subTa: 'Hind Madurai', font: `'Hind Madurai', 'Noto Sans Tamil', sans-serif` },
  { id: 'arima',      labelTa: 'அரிமா கவிதை', subTa: 'Arima Script', font: `'Arima', 'Noto Sans Tamil', cursive` },
];

const CUSTOM_PRESETS_TA = [
  { labelTa: 'பிரபஞ்சம்',  from: '#667eea', to: '#764ba2', text: '#fff',    accent: '#fbbf24' },
  { labelTa: 'மலர்ச்சி',   from: '#f093fb', to: '#f5576c', text: '#fff',    accent: '#fef3c7' },
  { labelTa: 'வானம்',     from: '#4facfe', to: '#00f2fe', text: '#fff',    accent: '#fef9c3' },
  { labelTa: 'வசந்தம்',   from: '#43e97b', to: '#38f9d7', text: '#052e16', accent: '#14532d' },
  { labelTa: 'இனிமை',     from: '#fa709a', to: '#fee140', text: '#3d0014', accent: '#7f1d1d' },
  { labelTa: 'நள்ளிரவு',   from: '#1a1a2e', to: '#16213e', text: '#e2e8f0', accent: '#818cf8' },
  { labelTa: 'செம்பு',    from: '#b79b72', to: '#8b5a2b', text: '#fff7ed', accent: '#fde68a' },
  { labelTa: 'காடு',      from: '#134e4a', to: '#065f46', text: '#f0fdf4', accent: '#6ee7b7' },
];

// ════════════════════════════════════════════════════════════════
// CANVAS UTILITIES
// ════════════════════════════════════════════════════════════════

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    let cur = '';
    for (const word of para.split(' ')) {
      const test = cur ? `${cur} ${word}` : word;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = word; }
      else cur = test;
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, id: string, accent: string) {
  const pad = w * 0.045;
  ctx.save();
  switch (id) {
    case 'thin-border':
      ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = Math.max(2, w*0.003);
      ctx.strokeRect(pad, pad, w-pad*2, h-pad*2); break;
    case 'double-border':
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = Math.max(1.5, w*0.0025);
      ctx.strokeRect(pad, pad, w-pad*2, h-pad*2);
      ctx.strokeRect(pad+w*0.02, pad+w*0.02, w-pad*2-w*0.04, h-pad*2-w*0.04); break;
    case 'corner-marks': {
      ctx.strokeStyle = accent; ctx.lineWidth = Math.max(3, w*0.006);
      const cs = w * 0.065;
      [[pad,pad,1,1],[w-pad,pad,-1,1],[pad,h-pad,1,-1],[w-pad,h-pad,-1,-1]].forEach(([x,y,dx,dy]) => {
        ctx.beginPath(); ctx.moveTo(x as number, (y as number)+(dy as number)*cs); ctx.lineTo(x as number, y as number); ctx.lineTo((x as number)+(dx as number)*cs, y as number); ctx.stroke();
      }); break;
    }
    case 'glow-border':
      ctx.shadowColor = accent; ctx.shadowBlur = Math.max(14, w*0.022);
      ctx.strokeStyle = accent; ctx.lineWidth = Math.max(2, w*0.004); ctx.globalAlpha = 0.55;
      ctx.strokeRect(pad, pad, w-pad*2, h-pad*2); break;
    case 'thick-border':
      ctx.strokeStyle = accent; ctx.lineWidth = Math.max(8, w*0.012); ctx.globalAlpha = 0.55;
      ctx.strokeRect(pad, pad, w-pad*2, h-pad*2); break;
    case 'arch-frame':
      ctx.strokeStyle = accent; ctx.lineWidth = Math.max(3, w*0.004); ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(pad, h-pad); ctx.lineTo(pad, pad + w*0.1);
      ctx.arcTo(pad, pad, pad+w*0.1, pad, w*0.1);
      ctx.lineTo(w-pad-w*0.1, pad);
      ctx.arcTo(w-pad, pad, w-pad, pad+w*0.1, w*0.1);
      ctx.lineTo(w-pad, h-pad); ctx.closePath(); ctx.stroke(); break;
    case 'vintage-dash':
      ctx.strokeStyle = accent; ctx.lineWidth = Math.max(2, w*0.003); ctx.globalAlpha = 0.5;
      ctx.setLineDash([Math.max(6, w*0.01), Math.max(6, w*0.01)]);
      ctx.strokeRect(pad, pad, w-pad*2, h-pad*2); break;
    default: break;
  }
  ctx.restore();
}

interface DrawOptions {
  verseText: string; refText: string; taglineText: string;
  theme: CardTheme; useCustom: boolean;
  customColors: { from: string; to: string; text: string; accent: string };
  frame: string; textAlign: 'left'|'center'|'right';
  lineHeightMult: number;
  // Verse styling
  verseFontSz: number; verseFontFam: string; verseColor: string; verseWeight: string;
  verseStyle: string; verseOpacity: number;
  // Reference styling
  refFontSz: number; refFontFam: string; refColor: string; refWeight: string;
  refPrefixId: string; refOpacity: number;
  // Tagline styling
  taglineFontSz: number; taglineColor: string;
  // Options & FX
  showTagline: boolean; showQuote: boolean;
  showTextBg: boolean; showVignette: boolean;
  showTextShadow: boolean; showGrain: boolean;
  dividerStyle: string; emblemStyle: string;
  paddingMult: number; language: string;
}

function drawCard(canvas: HTMLCanvasElement, opts: DrawOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  const PAD = W * (0.08 * opts.paddingMult);
  const TW = W - PAD * 2;

  // Background
  if (opts.useCustom) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, opts.customColors.from); g.addColorStop(1, opts.customColors.to);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else { opts.theme.render(ctx, W, H); }

  // Grain Effect
  if (opts.showGrain) {
    ctx.save(); ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.035;
    for (let i = 0; i < (W * H * 0.0004); i++) {
      const gx = Math.random() * W, gy = Math.random() * H;
      ctx.fillRect(gx, gy, 1.5, 1.5);
    }
    ctx.restore();
  }

  // Vignette
  if (opts.showVignette) {
    ctx.save();
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, Math.max(W,H)*0.75);
    vig.addColorStop(0, 'transparent'); vig.addColorStop(1, 'rgba(0,0,0,0.50)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  const activeAccent = opts.useCustom ? opts.customColors.accent : opts.theme.accentColor;
  if (opts.frame !== 'none') drawFrame(ctx, W, H, opts.frame, activeAccent);

  const getFontStack = (famId: string) => {
    const tf = TAMIL_FONTS.find(f => f.id === famId);
    if (tf) return tf.font;
    return famId === 'serif' ? `'Noto Serif Tamil', Georgia, serif`
      : famId === 'mono' ? `'Courier New', monospace`
      : famId === 'script' ? `'Kavivanar', cursive`
      : `'Noto Sans Tamil', sans-serif`;
  };

  const verseFS = Math.round(W * 0.038 * opts.verseFontSz);
  const refFS   = Math.round(W * 0.022 * opts.refFontSz);
  const tagFS   = Math.round(W * 0.017 * opts.taglineFontSz);
  const lineH   = verseFS * opts.lineHeightMult;
  const centerY = H * 0.48;
  const xBase   = opts.textAlign === 'center' ? W/2 : opts.textAlign === 'left' ? PAD : W-PAD;

  // Colors
  const verseTextColor = opts.verseColor || (opts.useCustom ? opts.customColors.text : opts.theme.textColor);
  const refTextColor   = opts.refColor   || (opts.useCustom ? opts.customColors.accent : opts.theme.refColor);
  const taglineColor   = opts.taglineColor || verseTextColor;

  // Emblem at Top
  if (opts.emblemStyle !== 'none') {
    const emblemObj = EMBLEMS_TA.find(e => e.id === opts.emblemStyle);
    if (emblemObj && emblemObj.symbol) {
      ctx.save(); ctx.font = `${Math.round(W*0.045)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.fillStyle = activeAccent; ctx.globalAlpha = 0.85;
      ctx.fillText(emblemObj.symbol, W/2, startYOffset(H, TW) - verseFS * 1.5);
      ctx.restore();
    }
  }

  // Quote Mark
  if (opts.showQuote) {
    ctx.save(); ctx.font = `bold ${Math.round(W*0.16)}px Georgia,serif`;
    ctx.fillStyle = activeAccent; ctx.globalAlpha = 0.14; ctx.textAlign = 'left';
    ctx.fillText('"', PAD*0.3, centerY - TW*0.09); ctx.restore();
  }

  const fontStack = getFontStack(opts.verseFontFam);
  ctx.font = `${opts.verseStyle} ${opts.verseWeight} ${verseFS}px ${fontStack}`;
  const lines = wrapText(ctx, opts.verseText, TW * 0.95);
  const totalH = lines.length * lineH;
  const startY = centerY - totalH / 2;

  // Text Background Box
  if (opts.showTextBg) {
    ctx.save();
    const bgPadV = verseFS * 0.6, bgPadH = verseFS * 0.85;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    const bx = opts.textAlign === 'center' ? W/2 - TW/2 - bgPadH : opts.textAlign === 'left' ? PAD - bgPadH : W - PAD - TW - bgPadH;
    ctx.roundRect(bx, startY - bgPadV, TW + bgPadH*2, totalH + refFS*3.5 + bgPadV*2, Math.max(10, W*0.015));
    ctx.fill(); ctx.restore();
  }

  // Text Drop Shadow / Glow
  ctx.save();
  if (opts.showTextShadow) {
    ctx.shadowColor = opts.theme.dark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.7)';
    ctx.shadowBlur = Math.max(8, W*0.012); ctx.shadowOffsetY = Math.max(2, W*0.003);
  }

  // Render Verse Text
  ctx.textAlign = opts.textAlign;
  ctx.font = `${opts.verseStyle} ${opts.verseWeight} ${verseFS}px ${fontStack}`;
  ctx.fillStyle = verseTextColor; ctx.globalAlpha = opts.verseOpacity;
  lines.forEach((line, i) => ctx.fillText(line, xBase, startY + i * lineH));
  ctx.restore();

  // Divider
  const sepY = startY + totalH + verseFS * 0.8;
  if (opts.dividerStyle !== 'none') {
    ctx.save(); ctx.strokeStyle = activeAccent; ctx.fillStyle = activeAccent;
    ctx.lineWidth = Math.max(2, W*0.003); ctx.globalAlpha = 0.7;
    const divObj = DIVIDERS_TA.find(d => d.id === opts.dividerStyle);
    if (divObj && divObj.symbol && divObj.id !== 'line') {
      ctx.font = `bold ${Math.round(W*0.025)}px ${fontStack}`;
      ctx.textAlign = 'center'; ctx.fillText(divObj.symbol, W/2, sepY + 4);
    } else {
      const sepL = W * 0.14; ctx.beginPath();
      if (opts.textAlign === 'center') { ctx.moveTo(W/2-sepL, sepY); ctx.lineTo(W/2+sepL, sepY); }
      else if (opts.textAlign === 'left') { ctx.moveTo(PAD, sepY); ctx.lineTo(PAD+sepL*2, sepY); }
      else { ctx.moveTo(W-PAD-sepL*2, sepY); ctx.lineTo(W-PAD, sepY); }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Reference Text Formatting
  const prefixObj = REF_PREFIXES_TA.find(p => p.id === opts.refPrefixId) || REF_PREFIXES_TA[0];
  const formattedRef = prefixObj.fmt(opts.refText);
  const refFontStack = getFontStack(opts.refFontFam);

  ctx.font = `${opts.refWeight} ${refFS}px ${refFontStack}`;
  ctx.fillStyle = refTextColor; ctx.globalAlpha = opts.refOpacity; ctx.textAlign = opts.textAlign;
  ctx.fillText(formattedRef, xBase, sepY + refFS * 1.8);

  // Tagline Watermark
  if (opts.showTagline && opts.taglineText) {
    ctx.font = `${tagFS}px 'Noto Sans Tamil', Inter, sans-serif`;
    ctx.fillStyle = taglineColor; ctx.globalAlpha = 0.5; ctx.textAlign = 'center';
    ctx.fillText(opts.taglineText, W/2, H - PAD*0.5);
  }
}

function startYOffset(H: number, TW: number) { return H * 0.48 - TW * 0.2; }

// ════════════════════════════════════════════════════════════════
// MINI SWATCH
// ════════════════════════════════════════════════════════════════

const Swatch: React.FC<{ theme: CardTheme; cc: { from: string; to: string }; isCustom: boolean }> = ({ theme, cc, isCustom }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 80; c.height = 80;
    const ctx = c.getContext('2d')!;
    if (isCustom) {
      const g = ctx.createLinearGradient(0, 0, 80, 80);
      g.addColorStop(0, cc.from); g.addColorStop(1, cc.to);
      ctx.fillStyle = g; ctx.fillRect(0, 0, 80, 80);
    } else { theme.render(ctx, 80, 80); }
  }, [theme, cc, isCustom]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

// ════════════════════════════════════════════════════════════════
// SMALL REUSABLE CONTROLS
// ════════════════════════════════════════════════════════════════

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div onClick={() => onChange(!value)} style={{
    width: '42px', height: '24px', borderRadius: '999px', flexShrink: 0,
    background: value ? 'var(--accent-color)' : 'var(--border-color)',
    position: 'relative', cursor: 'pointer', transition: 'background 200ms ease'
  }}>
    <div style={{
      position: 'absolute', top: '3px', left: value ? '21px' : '3px',
      width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
      transition: 'left 200ms ease', boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
    }} />
  </div>
);

const SLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ margin: '0 0 0.625rem', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</p>
);

// ════════════════════════════════════════════════════════════════
// MAIN MODAL
// ════════════════════════════════════════════════════════════════

export const VerseCardModal: React.FC = () => {
  const { isVerseCardOpen, verseCardData, closeVerseCard, language } = useReading();
  const previewRef = useRef<HTMLCanvasElement>(null);

  const isTa = language === 'ta';

  const verseText = verseCardData
    ? isTa ? verseCardData.verse.text_ta
    : language === 'en' ? verseCardData.verse.text_en
    : `${verseCardData.verse.text_ta}\n${verseCardData.verse.text_en}`
    : '';

  const refText = verseCardData
    ? `${isTa ? verseCardData.book.name_ta : verseCardData.book.name_en} ${verseCardData.chapter}:${verseCardData.verse.verse}`
    : '';

  const taglineText = isTa ? 'Bible My Gift · வேதாகம வரம்' : 'Bible My Gift';

  // Studio State
  const [tab, setTab] = useState('theme');
  const [themeIdx, setThemeIdx] = useState(0);
  const [catFilter, setCatFilter] = useState('All');
  const [ratioIdx, setRatioIdx] = useState(0);
  const [frame, setFrame] = useState('none');
  const [align, setAlign] = useState<'left'|'center'|'right'>('center');
  const [lineH, setLineH] = useState(1.65);

  // Verse Styling
  const [verseFontSz, setVerseFontSz] = useState(1.0);
  const [verseFontFam, setVerseFontFam] = useState('noto-serif');
  const [verseColor, setVerseColor] = useState('');
  const [verseWeight, setVerseWeight] = useState('normal');
  const [verseStyle, setVerseStyle] = useState('normal');
  const [verseOpacity, setVerseOpacity] = useState(1.0);

  // Reference Styling
  const [refFontSz, setRefFontSz] = useState(1.0);
  const [refFontFam, setRefFontFam] = useState('noto-serif');
  const [refColor, setRefColor] = useState('');
  const [refWeight, setRefWeight] = useState('bold');
  const [refPrefixId, setRefPrefixId] = useState('dash');
  const [refOpacity, setRefOpacity] = useState(1.0);

  // Tagline Styling
  const [taglineFontSz, setTaglineFontSz] = useState(1.0);
  const [taglineColor, setTaglineColor] = useState('');

  // Toggles & Effects
  const [showTagline, setShowTagline] = useState(true);
  const [showQuote, setShowQuote] = useState(true);
  const [showTextBg, setShowTextBg] = useState(false);
  const [showVignette, setShowVignette] = useState(false);
  const [showTextShadow, setShowTextShadow] = useState(true);
  const [showGrain, setShowGrain] = useState(false);
  const [dividerStyle, setDividerStyle] = useState('line');
  const [emblemStyle, setEmblemStyle] = useState('none');
  const [paddingMult, setPaddingMult] = useState(1.0);
  const [useCustom, setUseCustom] = useState(false);
  const [cc, setCc] = useState({ from: '#6366f1', to: '#8b5cf6', text: '#ffffff', accent: '#fbbf24' });
  const [isDownloading, setIsDownloading] = useState(false);
  const [didDownload, setDidDownload] = useState(false);

  const theme = THEMES[themeIdx];
  const ratio = RATIOS[ratioIdx];

  const drawOpts = useCallback((): DrawOptions => ({
    verseText, refText, taglineText,
    theme, useCustom, customColors: cc, frame,
    textAlign: align, lineHeightMult: lineH,
    verseFontSz, verseFontFam, verseColor, verseWeight, verseStyle, verseOpacity,
    refFontSz, refFontFam, refColor, refWeight, refPrefixId, refOpacity,
    taglineFontSz, taglineColor,
    showTagline, showQuote, showTextBg, showVignette, showTextShadow, showGrain,
    dividerStyle, emblemStyle, paddingMult, language
  }), [verseText, refText, taglineText, theme, useCustom, cc, frame, align, lineH, verseFontSz, verseFontFam, verseColor, verseWeight, verseStyle, verseOpacity, refFontSz, refFontFam, refColor, refWeight, refPrefixId, refOpacity, taglineFontSz, taglineColor, showTagline, showQuote, showTextBg, showVignette, showTextShadow, showGrain, dividerStyle, emblemStyle, paddingMult, language]);

  const redraw = useCallback(() => {
    const pv = previewRef.current; if (!pv || !verseCardData) return;
    const isDesktop = window.innerWidth >= 768;
    const maxW = isDesktop ? 380 : Math.min(window.innerWidth - 48, 280);
    const maxH = isDesktop ? 440 : Math.min(window.innerHeight * 0.28, 220);
    const scale = Math.min(maxW / ratio.w, maxH / ratio.h);

    pv.width = Math.round(ratio.w * scale);
    pv.height = Math.round(ratio.h * scale);
    pv.style.width = `${pv.width}px`; pv.style.height = `${pv.height}px`;
    const off = document.createElement('canvas');
    off.width = ratio.w; off.height = ratio.h;
    drawCard(off, drawOpts());
    const ctx = pv.getContext('2d')!;
    ctx.clearRect(0, 0, pv.width, pv.height);
    ctx.drawImage(off, 0, 0, pv.width, pv.height);
  }, [verseCardData, ratio, drawOpts]);

  useEffect(() => {
    if (isVerseCardOpen && verseCardData) redraw();
    const handleResize = () => { if (isVerseCardOpen) redraw(); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVerseCardOpen, verseCardData, themeIdx, ratioIdx, frame, align, lineH, verseFontSz, verseFontFam, verseColor, verseWeight, verseStyle, verseOpacity, refFontSz, refFontFam, refColor, refWeight, refPrefixId, refOpacity, taglineFontSz, taglineColor, showTagline, showQuote, showTextBg, showVignette, showTextShadow, showGrain, dividerStyle, emblemStyle, paddingMult, cc, useCustom, redraw]);

  // Lock background body scroll when modal is active
  useEffect(() => {
    if (isVerseCardOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isVerseCardOpen]);

  const buildFull = () => {
    const c = document.createElement('canvas');
    c.width = ratio.w; c.height = ratio.h;
    drawCard(c, drawOpts()); return c;
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const c = buildFull();
      const a = document.createElement('a');
      a.download = `verse-${refText.replace(/[:\s]/g, '-')}.png`;
      a.href = c.toDataURL('image/png', 1.0); a.click();
      setIsDownloading(false); setDidDownload(true);
      setTimeout(() => setDidDownload(false), 2200);
    }, 60);
  };

  const handleShare = async () => {
    setIsDownloading(true);
    setTimeout(async () => {
      const c = buildFull();
      c.toBlob(async (blob) => {
        if (!blob) { setIsDownloading(false); return; }
        const file = new File([blob], 'verse-card.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try { await navigator.share({ title: refText, text: `"${verseText}" — ${refText}`, files: [file] }); } catch {}
        } else { await navigator.clipboard?.writeText(`"${verseText}" — ${refText}\nBible My Gift`); }
        setIsDownloading(false);
      }, 'image/png', 1.0);
    }, 60);
  };

  if (!isVerseCardOpen || !verseCardData) return null;

  const filteredThemes = catFilter === 'All' ? THEMES : THEMES.filter(t => t.category === catFilter);

  const TABS = [
    { id: 'theme',  label: 'Theme',   ta: 'தீம் தோற்றம்',    Icon: Palette },
    { id: 'layout', label: 'Layout',  ta: 'வடிவமைப்பு',   Icon: Layout  },
    { id: 'text',   label: 'Text',    ta: 'எழுத்து அரங்கம்', Icon: Type    },
    { id: 'fx',     label: 'Effects', ta: 'காட்சி விளைவுகள்', Icon: Star    },
    { id: 'custom', label: 'Custom',  ta: 'கலர் கலவை',     Icon: Wand2   },
  ];

  // ─── Studio Control Panels ───────────────────────────────────

  const ThemePanel = (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.875rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {THEME_CATEGORIES_TA.map(cat => (
          <button key={cat.id} onClick={() => setCatFilter(cat.id)} style={{
            padding: '0.28rem 0.85rem', borderRadius: '999px', whiteSpace: 'nowrap', border: '1.5px solid',
            borderColor: catFilter === cat.id ? 'var(--accent-color)' : 'var(--border-color)',
            background: catFilter === cat.id ? 'rgba(59,130,246,0.12)' : 'var(--bg-secondary)',
            color: catFilter === cat.id ? 'var(--accent-color)' : 'var(--text-muted)',
            fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 140ms ease'
          }}>{isTa ? cat.labelTa : cat.id}</button>
        ))}
      </div>
      <div className="vc-theme-grid">
        {filteredThemes.map((t) => {
          const gi = THEMES.findIndex(x => x.id === t.id);
          const sel = themeIdx === gi;
          return (
            <button key={t.id} onClick={() => {
              setThemeIdx(gi);
              if (t.id === 'custom') { setUseCustom(true); setTab('custom'); } else setUseCustom(false);
            }} style={{
              position: 'relative', aspectRatio: '1', borderRadius: '0.75rem',
              border: '2.5px solid', borderColor: sel ? 'var(--accent-color)' : 'transparent',
              padding: 0, cursor: 'pointer', overflow: 'hidden',
              boxShadow: sel ? '0 0 0 2px var(--accent-color)' : '0 2px 8px rgba(0,0,0,0.18)',
              transition: 'all 150ms ease'
            }}>
              <Swatch theme={t} cc={cc} isCustom={t.id === 'custom' && useCustom} />
              {sel && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.38)' }}><Check size={18} color="#fff" /></div>}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.2rem 0.1rem', background: 'rgba(0,0,0,0.56)' }}>
                <p style={{ margin: 0, fontSize: '0.58rem', color: '#fff', fontWeight: 600, lineHeight: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.emoji} {isTa ? t.labelTa : t.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
        {theme.emoji} {isTa ? theme.labelTa : theme.label} · {isTa ? theme.categoryTa : theme.category}
      </p>
    </div>
  );

  const LayoutPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <SLabel>{isTa ? 'Frame எல்லை அலங்காரம்' : 'Frame Style'}</SLabel>
        <div className="vc-frame-grid">
          {FRAMES_TA.map(f => (
            <button key={f.id} onClick={() => setFrame(f.id)} style={{
              padding: '0.55rem 0.35rem', borderRadius: '0.625rem', border: '1.5px solid',
              borderColor: frame === f.id ? 'var(--accent-color)' : 'var(--border-color)',
              background: frame === f.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
              color: frame === f.id ? 'var(--accent-color)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
              transition: 'all 140ms ease'
            }}>
              <span style={{ fontSize: '1.2rem' }}>{f.emoji}</span>
              <span>{isTa ? f.labelTa : f.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SLabel>{isTa ? 'அலங்காரக் கோடு / பிரிப்பான்' : 'Divider Line Style'}</SLabel>
        <div className="vc-preset-grid">
          {DIVIDERS_TA.map(d => (
            <button key={d.id} onClick={() => setDividerStyle(d.id)} style={{
              padding: '0.5rem', borderRadius: '0.5rem', border: '1.5px solid',
              borderColor: dividerStyle === d.id ? 'var(--accent-color)' : 'var(--border-color)',
              background: dividerStyle === d.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
              color: dividerStyle === d.id ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 140ms ease'
            }}>{d.labelTa}</button>
          ))}
        </div>
      </div>

      <div>
        <SLabel>{isTa ? 'உரை சீரமைப்பு' : 'Text Alignment'}</SLabel>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['left', 'center', 'right'] as const).map(a => (
            <button key={a} onClick={() => setAlign(a)} style={{
              flex: 1, padding: '0.625rem', borderRadius: '0.5rem', border: '1.5px solid',
              borderColor: align === a ? 'var(--accent-color)' : 'var(--border-color)',
              background: align === a ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
              color: align === a ? 'var(--accent-color)' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: 700, transition: 'all 140ms ease'
            }}>
              <div style={{ fontSize: '1.15rem' }}>{a === 'left' ? '⬅' : a === 'center' ? '⬛' : '➡'}</div>
              <div style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>
                {isTa ? (a === 'left' ? 'இடது' : a === 'center' ? 'நடு' : 'வலது') : a.charAt(0).toUpperCase()+a.slice(1)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <SLabel>{isTa ? 'உள் இடைவெளி (Padding)' : 'Content Margin'}</SLabel>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-color)' }}>{Math.round(paddingMult*100)}%</span>
        </div>
        <input type="range" min={70} max={140} step={5} value={Math.round(paddingMult*100)}
          onChange={e => setPaddingMult(Number(e.target.value)/100)}
          style={{ width: '100%', accentColor: 'var(--accent-color)' }}
        />
      </div>
    </div>
  );

  const TextPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── 1. VERSE STYLING & TAMIL FONTS ── */}
      <div style={{ padding: '0.875rem', borderRadius: '0.875rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <SLabel>{isTa ? '📖 வசனத்தின் தோற்றம் (Verse Design)' : '📖 Verse Design & Typography'}</SLabel>
          <button onClick={() => { setVerseFontSz(1.0); setVerseFontFam('noto-serif'); setVerseColor(''); setVerseWeight('normal'); setVerseStyle('normal'); setVerseOpacity(1.0); }} style={{ fontSize: '0.68rem', color: 'var(--accent-color)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
            <RefreshCw size={12} /> {isTa ? 'மீட்டமை' : 'Reset'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Verse Font Size */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{isTa ? 'எழுத்து அளவு (Font Size)' : 'Font Size'}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-color)' }}>{Math.round(verseFontSz*100)}%</span>
            </div>
            <input type="range" min={60} max={180} step={5} value={Math.round(verseFontSz*100)}
              onChange={e => setVerseFontSz(Number(e.target.value)/100)}
              style={{ width: '100%', accentColor: 'var(--accent-color)' }}
            />
          </div>

          {/* 8 RICH TAMIL FONT SELECTIONS */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>
              {isTa ? 'தமிழ் எழுத்து வடிவங்கள் (Tamil Fonts)' : 'Tamil Font Family'}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {TAMIL_FONTS.map(f => (
                <button key={f.id} onClick={() => setVerseFontFam(f.id)} style={{
                  padding: '0.5rem', borderRadius: '0.5rem', border: '1.5px solid',
                  borderColor: verseFontFam === f.id ? 'var(--accent-color)' : 'var(--border-color)',
                  background: verseFontFam === f.id ? 'rgba(59,130,246,0.12)' : 'var(--bg-primary)',
                  color: verseFontFam === f.id ? 'var(--accent-color)' : 'var(--text-primary)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 140ms ease'
                }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, fontFamily: f.font, lineHeight: 1.2 }}>
                    {f.labelTa}
                  </p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                    {f.subTa}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Font Weight & Style Toggles */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              {isTa ? 'எழுத்து தடிமன் (Font Weight)' : 'Font Weight'}
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
              {[
                ['normal', isTa ? 'சாதாரண' : 'Normal'],
                ['500', isTa ? 'நடுத்தர' : 'Medium'],
                ['bold', isTa ? 'தடிமனான' : 'Bold']
              ].map(([w, label]) => (
                <button key={w} onClick={() => setVerseWeight(w)} style={{
                  flex: 1, padding: '0.4rem', borderRadius: '0.4rem', border: '1.5px solid',
                  borderColor: verseWeight === w ? 'var(--accent-color)' : 'var(--border-color)',
                  background: verseWeight === w ? 'rgba(59,130,246,0.1)' : 'var(--bg-primary)',
                  color: verseWeight === w ? 'var(--accent-color)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem'
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Color & Opacity */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{isTa ? 'வசன நிறம் (Color)' : 'Verse Color'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {verseColor && (
                <button onClick={() => setVerseColor('')} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>{isTa ? 'இயல்பு' : 'Default'}</button>
              )}
              <input type="color" value={verseColor || (useCustom ? cc.text : theme.textColor)}
                onChange={e => setVerseColor(e.target.value)}
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{isTa ? 'தெளிவுத்தன்மை (Opacity)' : 'Text Opacity'}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-color)' }}>{Math.round(verseOpacity*100)}%</span>
            </div>
            <input type="range" min={40} max={100} step={5} value={Math.round(verseOpacity*100)}
              onChange={e => setVerseOpacity(Number(e.target.value)/100)}
              style={{ width: '100%', accentColor: 'var(--accent-color)' }}
            />
          </div>
        </div>
      </div>

      {/* ── 2. REFERENCE STYLING ── */}
      <div style={{ padding: '0.875rem', borderRadius: '0.875rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <SLabel>{isTa ? '📍 இருப்பிடத்தின் தோற்றம் (Reference)' : '📍 Reference Design'}</SLabel>
          <button onClick={() => { setRefFontSz(1.0); setRefFontFam('noto-serif'); setRefColor(''); setRefWeight('bold'); setRefPrefixId('dash'); setRefOpacity(1.0); }} style={{ fontSize: '0.68rem', color: 'var(--accent-color)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
            <RefreshCw size={12} /> {isTa ? 'மீட்டமை' : 'Reset'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Reference Prefix Format */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>{isTa ? 'அடையாள வடிவம் (Prefix)' : 'Prefix Format'}</span>
            <div className="vc-preset-grid">
              {REF_PREFIXES_TA.map(p => (
                <button key={p.id} onClick={() => setRefPrefixId(p.id)} style={{
                  padding: '0.4rem', borderRadius: '0.4rem', border: '1.5px solid',
                  borderColor: refPrefixId === p.id ? 'var(--accent-color)' : 'var(--border-color)',
                  background: refPrefixId === p.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-primary)',
                  color: refPrefixId === p.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem'
                }}>{p.labelTa}</button>
              ))}
            </div>
          </div>

          {/* Reference Font Size */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{isTa ? 'எழுத்து அளவு' : 'Font Size'}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-color)' }}>{Math.round(refFontSz*100)}%</span>
            </div>
            <input type="range" min={60} max={160} step={5} value={Math.round(refFontSz*100)}
              onChange={e => setRefFontSz(Number(e.target.value)/100)}
              style={{ width: '100%', accentColor: 'var(--accent-color)' }}
            />
          </div>

          {/* Reference Color */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{isTa ? 'இருப்பிட நிறம்' : 'Reference Color'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {refColor && (
                <button onClick={() => setRefColor('')} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>{isTa ? 'இயல்பு' : 'Default'}</button>
              )}
              <input type="color" value={refColor || (useCustom ? cc.accent : theme.refColor)}
                onChange={e => setRefColor(e.target.value)}
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. TAGLINE / WATERMARK STYLING ── */}
      <div style={{ padding: '0.875rem', borderRadius: '0.875rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <SLabel>{isTa ? '🏷️ மேலதிக குறிப்பு (Watermark)' : '🏷️ Watermark Tagline'}</SLabel>
          <Toggle value={showTagline} onChange={setShowTagline} />
        </div>

        {showTagline && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{isTa ? 'எழுத்து அளவு' : 'Font Size'}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-color)' }}>{Math.round(taglineFontSz*100)}%</span>
              </div>
              <input type="range" min={60} max={150} step={5} value={Math.round(taglineFontSz*100)}
                onChange={e => setTaglineFontSz(Number(e.target.value)/100)}
                style={{ width: '100%', accentColor: 'var(--accent-color)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{isTa ? 'குறிப்பு நிறம்' : 'Color Override'}</span>
              <input type="color" value={taglineColor || (useCustom ? cc.text : theme.textColor)}
                onChange={e => setTaglineColor(e.target.value)}
                style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Line Height Control */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <SLabel>{isTa ? 'வரி இடைவெளி' : 'Line Height'}</SLabel>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-color)' }}>{lineH.toFixed(2)}x</span>
        </div>
        <input type="range" min={120} max={240} step={5} value={Math.round(lineH*100)}
          onChange={e => setLineH(Number(e.target.value)/100)}
          style={{ width: '100%', accentColor: 'var(--accent-color)' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <SLabel>{isTa ? 'உரை விருப்பங்கள்' : 'Text Options'}</SLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {isTa ? 'மேற்கோள் குறி ❝' : 'Opening Quote Mark ❝'}
          </p>
          <Toggle value={showQuote} onChange={setShowQuote} />
        </div>
      </div>
    </div>
  );

  const FxPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SLabel>{isTa ? 'மேல்சின்னம் (Top Emblem)' : 'Top Emblem Icon'}</SLabel>
      <div className="vc-preset-grid">
        {EMBLEMS_TA.map(e => (
          <button key={e.id} onClick={() => setEmblemStyle(e.id)} style={{
            padding: '0.5rem', borderRadius: '0.5rem', border: '1.5px solid',
            borderColor: emblemStyle === e.id ? 'var(--accent-color)' : 'var(--border-color)',
            background: emblemStyle === e.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
            color: emblemStyle === e.id ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 140ms ease'
          }}>{e.labelTa}</button>
        ))}
      </div>

      <SLabel>{isTa ? 'காட்சி விளைவுகள்' : 'Visual Effects'}</SLabel>
      {[
        { key: 'shadow',   val: showTextShadow, set: setShowTextShadow, en: 'Text Drop Shadow / Glow', ta: 'உரை நிழல் / ஒளி',         desc: 'Adds elegant depth behind text' },
        { key: 'textbg',   val: showTextBg,     set: setShowTextBg,     en: 'Text Background Box',     ta: 'உரை பின்னணி பெட்டி',     desc: 'Adds a subtle translucent card box' },
        { key: 'vignette', val: showVignette,   set: setShowVignette,   en: 'Vignette (Cinematic Shadow)', ta: 'சினிமா நிழல் (Vignette)',  desc: 'Darkens border edges for focal focus' },
        { key: 'grain',    val: showGrain,      set: setShowGrain,      en: 'Vintage Paper Grain',     ta: 'காகித தானிய விளைவு',     desc: 'Simulates fine paper texture' },
      ].map(({ key, val, set, en, ta, desc }) => (
        <div key={key} style={{
          padding: '0.875rem', borderRadius: '0.75rem',
          border: '1.5px solid', borderColor: val ? 'var(--accent-color)' : 'var(--border-color)',
          background: val ? 'rgba(59,130,246,0.06)' : 'var(--bg-secondary)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem',
          transition: 'all 150ms ease'
        }}>
          <div>
            <p style={{ margin: '0 0 0.2rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isTa ? ta : en}
            </p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc}</p>
          </div>
          <Toggle value={val} onChange={set} />
        </div>
      ))}
    </div>
  );

  const CustomPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
      <div style={{
        padding: '0.875rem', borderRadius: '0.75rem',
        border: '1.5px solid', borderColor: useCustom ? 'var(--accent-color)' : 'var(--border-color)',
        background: useCustom ? 'rgba(59,130,246,0.06)' : 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
        transition: 'all 150ms ease'
      }}>
        <div>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isTa ? 'தனிப்பயன் கலர்கள்' : 'Custom Colors Mode'}
          </p>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {isTa ? 'உங்கள் சொந்த கலர் கலவை உருவாக்கவும்' : 'Build your own custom gradient'}
          </p>
        </div>
        <Toggle value={useCustom} onChange={setUseCustom} />
      </div>

      <div>
        <SLabel>{isTa ? 'விரைவு கலர் தொகுப்புகள்' : 'Quick Color Presets'}</SLabel>
        <div className="vc-preset-grid">
          {CUSTOM_PRESETS_TA.map(p => (
            <button key={p.labelTa} onClick={() => { setCc({ from: p.from, to: p.to, text: p.text, accent: p.accent }); setUseCustom(true); }} style={{
              padding: '0.5rem 0.25rem', borderRadius: '0.625rem',
              border: '2px solid transparent', cursor: 'pointer',
              background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
              color: p.text, fontSize: '0.72rem', fontWeight: 700,
              transition: 'all 150ms ease', boxShadow: '0 2px 8px rgba(0,0,0,0.22)'
            }}>{p.labelTa}</button>
          ))}
        </div>
      </div>

      {useCustom && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <SLabel>{isTa ? 'கலர் தேர்வு' : 'Fine-Tune Colors'}</SLabel>
          {[
            { key: 'from',   en: 'Gradient Start', ta: 'தொடக்க கலர்' },
            { key: 'to',     en: 'Gradient End',   ta: 'இறுதி கலர்' },
            { key: 'text',   en: 'Verse Text',     ta: 'வசன உரை கலர்' },
            { key: 'accent', en: 'Accent / Line',  ta: 'அலங்கார கலர்' },
          ].map(({ key, en, ta }) => {
            const val = cc[key as keyof typeof cc];
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={{ flex: 1, cursor: 'pointer' }}>
                  <div style={{ position: 'relative', height: '40px', borderRadius: '0.5rem', overflow: 'hidden', background: val, border: '2px solid var(--border-color)' }}>
                    <input type="color" value={val}
                      onChange={e => setCc(prev => ({ ...prev, [key]: e.target.value }))}
                      style={{ position: 'absolute', inset: '-8px', opacity: 0, cursor: 'pointer', width: '200%', height: '200%' }}
                    />
                  </div>
                </label>
                <div style={{ minWidth: '96px' }}>
                  <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{isTa ? ta : en}</p>
                  <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{val}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const activePanel = tab === 'theme' ? ThemePanel : tab === 'layout' ? LayoutPanel : tab === 'text' ? TextPanel : tab === 'fx' ? FxPanel : CustomPanel;

  const DownloadFooter = (
    <div style={{
      padding: '0.875rem 1.25rem calc(0.875rem + env(safe-area-inset-bottom))',
      borderTop: '1px solid var(--border-color)',
      display: 'flex', gap: '0.75rem', flexShrink: 0,
      background: 'var(--bg-surface)'
    }}>
      <button onClick={handleDownload} disabled={isDownloading} style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        padding: '0.875rem', borderRadius: '0.875rem', border: 'none',
        background: didDownload ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#f59e0b,#ef4444)',
        color: '#fff', fontWeight: 700, fontSize: '0.95rem',
        cursor: isDownloading ? 'wait' : 'pointer',
        opacity: isDownloading ? 0.8 : 1, transition: 'all 200ms ease',
        boxShadow: '0 4px 18px rgba(239,68,68,0.32)'
      }}>
        {didDownload ? <Check size={18}/> : <Download size={18}/>}
        <span>{didDownload ? (isTa ? 'பதிவிறக்கப்பட்டது!' : 'Downloaded!') : (isTa ? 'PNG பதிவிறக்கு (HD)' : 'Download HD PNG')}</span>
      </button>
      <button onClick={handleShare} disabled={isDownloading} style={{
        width: '54px', height: '54px', borderRadius: '0.875rem',
        border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)',
        color: 'var(--text-secondary)', cursor: isDownloading?'wait':'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'all 150ms ease'
      }}>
        <Share2 size={20}/>
      </button>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeVerseCard}
        onTouchMove={(e) => e.preventDefault()}
        style={{
          position: 'fixed', inset: 0, zIndex: 8999,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
        }}
      />

      {/* ── Root Sheet — Studio modal ── */}
      <div
        className="vc-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, top: 0, zIndex: 9000,
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-primary)',
          height: '100dvh', overflow: 'hidden'
        }}
      >
        {/* ══ PREVIEW PANEL ══ */}
        <div className="vc-preview-panel" style={{
          background: 'linear-gradient(160deg,#090914 0%,#0f172a 100%)',
          display: 'flex', flexDirection: 'column', flexShrink: 0
        }}>
          {/* Studio Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
                <Sparkles size={18} color="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                  {isTa ? 'வசன கார்டு ஸ்டுடியோ' : 'Verse Card Creator Studio'}
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.48)' }}>{refText}</p>
              </div>
            </div>
            <button onClick={closeVerseCard} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
          </div>

          {/* Large Canvas Preview */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem 1.25rem 0.75rem', flex: 1 }}>
            <div style={{ borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 16px 56px rgba(0,0,0,0.75)', background: '#000', display: 'inline-flex' }}>
              <canvas ref={previewRef} style={{ display: 'block', maxWidth: '100%' }} />
            </div>
          </div>

          {/* Aspect Ratio Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem 1.25rem 1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {RATIOS.map((r, i) => (
              <button key={r.id} onClick={() => setRatioIdx(i)} style={{
                padding: '0.35rem 0.95rem', borderRadius: '999px', border: '1.5px solid',
                borderColor: ratioIdx === i ? '#f59e0b' : 'rgba(255,255,255,0.15)',
                background: ratioIdx === i ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.06)',
                color: ratioIdx === i ? '#fbbf24' : 'rgba(255,255,255,0.65)',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                transition: 'all 140ms ease', display: 'flex', alignItems: 'center', gap: '0.35rem'
              }}>
                <span style={{ fontSize: '0.92rem' }}>{r.icon}</span>{isTa ? r.labelTa : r.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ CONTROLS PANEL ══ */}
        <div className="vc-controls-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: 'var(--bg-primary)' }}>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)', flexShrink: 0, overflowX: 'auto' }}>
            {TABS.map(({ id, label, ta, Icon }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '0.22rem', padding: '0.75rem 0.5rem', border: 'none', background: 'none',
                color: tab === id ? 'var(--accent-color)' : 'var(--text-muted)',
                borderBottom: `2.5px solid ${tab === id ? 'var(--accent-color)' : 'transparent'}`,
                cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
                transition: 'all 140ms ease'
              }}>
                <Icon size={16} />
                <span>{isTa ? ta : label}</span>
              </button>
            ))}
          </div>

          {/* Scrollable Control Settings */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '1.25rem', WebkitOverflowScrolling: 'touch' as any }}>
            {activePanel}
          </div>

          {DownloadFooter}
        </div>
      </div>

      <style>{`
        .vc-theme-grid { display: grid; gap: 0.5rem; }
        .vc-frame-grid { display: grid; gap: 0.5rem; }
        .vc-preset-grid { display: grid; gap: 0.5rem; }

        /* ── Mobile (<768px): Vertical Stack ── */
        @media (max-width: 767px) {
          .vc-sheet {
            flex-direction: column !important;
            top: 0 !important; border-radius: 0 !important;
            animation: vcUp 280ms cubic-bezier(0.16,1,0.3,1) forwards;
          }
          .vc-preview-panel {
            flex-shrink: 0 !important;
            max-height: 44vh !important;
            overflow: hidden !important;
          }
          .vc-controls-panel { flex: 1 !important; min-height: 0 !important; overflow: hidden !important; }
          .vc-theme-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .vc-frame-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .vc-preset-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }

        /* ── Desktop & Laptop (≥ 768px): Large Studio Modal ── */
        @media (min-width: 768px) {
          .vc-sheet {
            position: fixed !important;
            top: 50% !important; left: 50% !important;
            bottom: auto !important; right: auto !important;
            transform: translate(-50%, -50%) !important;
            width: min(1180px, 94vw) !important;
            height: min(740px, 90vh) !important;
            flex-direction: row !important;
            border-radius: 1.5rem !important;
            box-shadow: 0 32px 110px rgba(0,0,0,0.7) !important;
            animation: vcIn 260ms cubic-bezier(0.16,1,0.3,1) forwards;
          }
          .vc-preview-panel {
            width: 480px !important;
            flex-shrink: 0 !important;
            border-radius: 1.5rem 0 0 1.5rem !important;
          }
          .vc-controls-panel {
            flex: 1 !important;
            min-width: 0 !important;
            border-left: 1px solid var(--border-color) !important;
            border-radius: 0 1.5rem 1.5rem 0 !important;
            overflow: hidden !important;
          }
          .vc-theme-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 0.625rem !important; }
          .vc-frame-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 0.625rem !important; }
          .vc-preset-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 0.5rem !important; }
        }

        @keyframes vcIn {
          from { opacity:0; transform:translate(-50%, calc(-50% + 32px)); }
          to   { opacity:1; transform:translate(-50%,-50%); }
        }
        @keyframes vcUp {
          from { transform:translateY(100%); }
          to   { transform:translateY(0); }
        }
      `}</style>
    </>
  );
};