import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Download,
  Share2,
  Image as ImageIcon,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useReading } from '../../context/ReadingContext';

// ─── Theme Definitions ─────────────────────────────────────────────────────────

interface CardTheme {
  id: string;
  label: string;
  labelTa: string;
  render: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  textColor: string;
  refColor: string;
  accentColor: string;
}

const THEMES: CardTheme[] = [
  {
    id: 'gold-sunset',
    label: 'Gold Sunset',
    labelTa: 'தங்க அஸ்தமனம்',
    textColor: '#1a0a00',
    refColor: '#7c3d00',
    accentColor: '#c2770a',
    render: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.4, '#ef8d18');
      grad.addColorStop(1, '#dc2626');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Subtle texture circles
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(w * (0.1 + i * 0.2), h * 0.3, 60 + i * 30, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },
  {
    id: 'sacred-midnight',
    label: 'Sacred Midnight',
    labelTa: 'புனித இரவு',
    textColor: '#e8d5a3',
    refColor: '#c9a84c',
    accentColor: '#c9a84c',
    render: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f0c29');
      grad.addColorStop(0.5, '#302b63');
      grad.addColorStop(1, '#24243e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Stars
      ctx.save();
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h * 0.6;
        const r = Math.random() * 1.8 + 0.5;
        ctx.globalAlpha = Math.random() * 0.6 + 0.2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },
  {
    id: 'emerald-life',
    label: 'Emerald Life',
    labelTa: 'மரகத வாழ்வு',
    textColor: '#f0faf4',
    refColor: '#6ee7b7',
    accentColor: '#34d399',
    render: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.6, '#065f46');
      grad.addColorStop(1, '#047857');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(w * 0.85, h * 0.15, 60 + i * 40, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
  {
    id: 'soft-pastel',
    label: 'Soft Pastel',
    labelTa: 'மென்மையான நிறம்',
    textColor: '#2d1b69',
    refColor: '#6d28d9',
    accentColor: '#7c3aed',
    render: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#fce7f3');
      grad.addColorStop(0.5, '#e0e7ff');
      grad.addColorStop(1, '#ddd6fe');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.globalAlpha = 0.15;
      const blobGrad = ctx.createRadialGradient(w * 0.7, h * 0.3, 10, w * 0.7, h * 0.3, 200);
      blobGrad.addColorStop(0, '#f9a8d4');
      blobGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = blobGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  },
  {
    id: 'violet-aurora',
    label: 'Violet Aurora',
    labelTa: 'ஊதா வான்வில்',
    textColor: '#f5f3ff',
    refColor: '#c4b5fd',
    accentColor: '#a78bfa',
    render: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#312e81');
      grad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.globalAlpha = 0.18;
      const auroraGrad = ctx.createLinearGradient(0, h * 0.3, w, h * 0.7);
      auroraGrad.addColorStop(0, '#7c3aed');
      auroraGrad.addColorStop(0.5, '#ec4899');
      auroraGrad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, h * 0.25, w, h * 0.5);
      ctx.restore();
    }
  },
  {
    id: 'charcoal-elegant',
    label: 'Charcoal Elegant',
    labelTa: 'நட்சத்திர நீலம்',
    textColor: '#f1f5f9',
    refColor: '#94a3b8',
    accentColor: '#38bdf8',
    render: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < h; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
  {
    id: 'minimalist-light',
    label: 'Minimalist Light',
    labelTa: 'தூய வெளிச்சம்',
    textColor: '#1e293b',
    refColor: '#64748b',
    accentColor: '#3b82f6',
    render: (ctx, w, h) => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, h - 8, w, 8);
      ctx.fillStyle = '#bfdbfe';
      ctx.fillRect(0, h - 8, w * 0.35, 8);
      ctx.restore();
    }
  },
  {
    id: 'deep-grace',
    label: 'Deep Grace',
    labelTa: 'ஆழமான கிருபை',
    textColor: '#fef3c7',
    refColor: '#fbbf24',
    accentColor: '#f59e0b',
    render: (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#3b0764');
      grad.addColorStop(0.5, '#581c87');
      grad.addColorStop(1, '#7c2d12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.globalAlpha = 0.12;
      const glowGrad = ctx.createRadialGradient(w / 2, h * 0.4, 10, w / 2, h * 0.4, 260);
      glowGrad.addColorStop(0, '#fbbf24');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }
];

// ─── Aspect Ratio Definitions ──────────────────────────────────────────────────

interface AspectRatio {
  id: string;
  label: string;
  labelTa: string;
  width: number;
  height: number;
  icon: string;
}

const ASPECT_RATIOS: AspectRatio[] = [
  { id: 'square', label: '1:1 Square', labelTa: '1:1 சதுரம்', width: 1080, height: 1080, icon: '⬛' },
  { id: 'story', label: '9:16 Story', labelTa: '9:16 ஸ்டோரி', width: 1080, height: 1920, icon: '📱' },
  { id: 'landscape', label: '16:9 Wide', labelTa: '16:9 அகலம்', width: 1920, height: 1080, icon: '🖥' }
];

// ─── Canvas Drawing Utility ────────────────────────────────────────────────────

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawCard(
  canvas: HTMLCanvasElement,
  verseText: string,
  referenceText: string,
  theme: CardTheme,
  showTagline: boolean,
  textAlign: 'left' | 'center' | 'right',
  language: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const PAD = W * 0.1;
  const textWidth = W - PAD * 2;
  const isLandscape = W > H;

  // Draw background
  theme.render(ctx, W, H);

  // Compute vertical center zone
  const centerY = H * (isLandscape ? 0.5 : 0.45);

  // Verse font size scaling relative to canvas width
  const isTamil = language === 'ta';
  const verseFontSize = Math.round(W * (isLandscape ? 0.026 : 0.038));
  const refFontSize = Math.round(W * 0.022);
  const taglineFontSize = Math.round(W * 0.016);

  ctx.textAlign = textAlign;
  const xBase = textAlign === 'center' ? W / 2 : textAlign === 'left' ? PAD : W - PAD;

  // Draw quote mark
  ctx.save();
  ctx.font = `bold ${Math.round(W * 0.14)}px Georgia, serif`;
  ctx.fillStyle = theme.accentColor;
  ctx.globalAlpha = 0.18;
  ctx.textAlign = 'left';
  ctx.fillText('"', PAD * 0.4, centerY - textWidth * 0.12);
  ctx.restore();

  // Measure verse lines
  const tamilFontStack = isTamil
    ? `"Noto Sans Tamil", "Latha", sans-serif`
    : `Georgia, "Times New Roman", serif`;
  ctx.font = `${verseFontSize}px ${tamilFontStack}`;
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = textAlign;

  const verseLines = wrapText(ctx, verseText, textWidth * 0.95);
  const lineHeight = verseFontSize * 1.6;
  const totalVerseHeight = verseLines.length * lineHeight;

  // Center verse block
  let startY = centerY - totalVerseHeight / 2;

  // Draw verse text
  ctx.font = `${verseFontSize}px ${tamilFontStack}`;
  ctx.fillStyle = theme.textColor;
  ctx.globalAlpha = 1;
  verseLines.forEach((line, i) => {
    ctx.fillText(line, xBase, startY + i * lineHeight);
  });

  // Decorative separator line
  const sepY = startY + totalVerseHeight + verseFontSize * 0.8;
  ctx.save();
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = Math.max(2, W * 0.003);
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  if (textAlign === 'center') {
    ctx.moveTo(W / 2 - 60, sepY);
    ctx.lineTo(W / 2 + 60, sepY);
  } else if (textAlign === 'left') {
    ctx.moveTo(PAD, sepY);
    ctx.lineTo(PAD + 120, sepY);
  } else {
    ctx.moveTo(W - PAD - 120, sepY);
    ctx.lineTo(W - PAD, sepY);
  }
  ctx.stroke();
  ctx.restore();

  // Reference text
  ctx.font = `bold ${refFontSize}px ${tamilFontStack}`;
  ctx.fillStyle = theme.refColor;
  ctx.globalAlpha = 1;
  ctx.textAlign = textAlign;
  ctx.fillText(`— ${referenceText}`, xBase, sepY + refFontSize * 1.6);

  // Tagline
  if (showTagline) {
    const tagY = H - PAD * 0.65;
    ctx.font = `${taglineFontSize}px Inter, sans-serif`;
    ctx.fillStyle = theme.refColor;
    ctx.globalAlpha = 0.55;
    ctx.textAlign = 'center';
    ctx.fillText('Bible My Gift · வேதாகம வரம்', W / 2, tagY);
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const VerseCardModal: React.FC = () => {
  const { isVerseCardOpen, verseCardData, closeVerseCard, language } = useReading();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const [selectedThemeIdx, setSelectedThemeIdx] = useState(0);
  const [selectedRatioIdx, setSelectedRatioIdx] = useState(0);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [showTagline, setShowTagline] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [didDownload, setDidDownload] = useState(false);

  const theme = THEMES[selectedThemeIdx];
  const ratio = ASPECT_RATIOS[selectedRatioIdx];

  const verseText = verseCardData
    ? language === 'en'
      ? verseCardData.verse.text_en
      : language === 'ta'
      ? verseCardData.verse.text_ta
      : `${verseCardData.verse.text_ta}\n${verseCardData.verse.text_en}`
    : '';

  const referenceText = verseCardData
    ? `${language === 'en' ? verseCardData.book.name_en : verseCardData.book.name_ta} ${verseCardData.chapter}:${verseCardData.verse.verse}`
    : '';

  // Draw on preview canvas (small)
  const redrawPreview = useCallback(() => {
    const preview = previewRef.current;
    if (!preview || !verseCardData) return;

    // Preview at 1/4 scale
    const scale = 0.25;
    preview.width = ratio.width * scale;
    preview.height = ratio.height * scale;

    const ctx = preview.getContext('2d');
    if (!ctx) return;

    // Scale transform
    ctx.save();
    ctx.scale(scale, scale);

    // Draw at full resolution on scaled canvas
    const fakeCanvas = document.createElement('canvas');
    fakeCanvas.width = ratio.width;
    fakeCanvas.height = ratio.height;
    drawCard(
      fakeCanvas,
      verseText,
      referenceText,
      theme,
      showTagline,
      textAlign,
      language
    );

    // Draw the fakeCanvas result into the preview
    ctx.restore();
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.drawImage(img, 0, 0, preview.width, preview.height);
      ctx.restore();
    };
    img.src = fakeCanvas.toDataURL('image/png');
  }, [verseCardData, ratio, theme, verseText, referenceText, showTagline, textAlign, language]);

  useEffect(() => {
    if (isVerseCardOpen && verseCardData) {
      redrawPreview();
    }
  }, [isVerseCardOpen, verseCardData, selectedThemeIdx, selectedRatioIdx, showTagline, textAlign, redrawPreview]);

  const generateFullCanvas = (): HTMLCanvasElement | null => {
    if (!verseCardData) return null;
    const canvas = document.createElement('canvas');
    canvas.width = ratio.width;
    canvas.height = ratio.height;
    drawCard(canvas, verseText, referenceText, theme, showTagline, textAlign, language);
    return canvas;
  };

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const canvas = generateFullCanvas();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `bible-verse-${referenceText.replace(/[:\s]/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      setIsGenerating(false);
      setDidDownload(true);
      setTimeout(() => setDidDownload(false), 2000);
    }, 80);
  };

  const handleShare = async () => {
    setIsGenerating(true);
    setTimeout(async () => {
      const canvas = generateFullCanvas();
      if (!canvas) { setIsGenerating(false); return; }
      canvas.toBlob(async (blob) => {
        if (!blob) { setIsGenerating(false); return; }
        const file = new File([blob], `bible-verse-${referenceText}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: referenceText,
              text: `"${verseText}" — ${referenceText}`,
              files: [file]
            });
          } catch {}
        } else {
          // fallback: copy URL link to clipboard
          const text = `"${verseText}" — ${referenceText}\n\nBible My Gift · வேதாகம வரம்`;
          navigator.clipboard?.writeText(text);
        }
        setIsGenerating(false);
      }, 'image/png', 1.0);
    }, 80);
  };

  if (!isVerseCardOpen || !verseCardData) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={closeVerseCard}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)'
        }}
      />

      {/* Modal Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '1.25rem',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
          width: '100%',
          maxWidth: '880px',
          maxHeight: '92vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem 1rem',
            borderBottom: '1px solid var(--border-color)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ImageIcon size={17} color="#fff" />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.25
                }}
              >
                {language === 'ta' ? 'வசன கார்டு உருவாக்கி' : 'Verse Card Creator'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {referenceText}
              </p>
            </div>
          </div>
          <button
            className="btn-icon"
            onClick={closeVerseCard}
            style={{ width: '36px', height: '36px', color: 'var(--text-muted)' }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 320px)',
            gap: '1.5rem',
            padding: '1.25rem 1.5rem',
            flex: 1
          }}
          className="verse-card-body"
        >
          {/* LEFT — Canvas Preview */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                position: 'relative',
                borderRadius: '0.875rem',
                overflow: 'hidden',
                boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#111'
              }}
            >
              <canvas
                ref={previewRef}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '420px',
                  objectFit: 'contain',
                  borderRadius: '0.875rem'
                }}
              />
            </div>

            {/* Ratio Selector */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {ASPECT_RATIOS.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRatioIdx(i)}
                  style={{
                    padding: '0.4rem 0.875rem',
                    borderRadius: '999px',
                    border: '1.5px solid',
                    borderColor: selectedRatioIdx === i ? 'var(--accent-color)' : 'var(--border-color)',
                    background: selectedRatioIdx === i ? 'rgba(59,130,246,0.12)' : 'var(--bg-secondary)',
                    color: selectedRatioIdx === i ? 'var(--accent-color)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    transition: 'all 180ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span style={{ fontSize: '0.95rem' }}>{r.icon}</span>
                  <span>{language === 'ta' ? r.labelTa : r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Theme Selector */}
            <div>
              <p
                style={{
                  margin: '0 0 0.625rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                {language === 'ta' ? 'நிறவு தீம்' : 'Theme'}
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem'
                }}
              >
                {THEMES.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThemeIdx(i)}
                    title={language === 'ta' ? t.labelTa : t.label}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: '0.625rem',
                      border: '2.5px solid',
                      borderColor: selectedThemeIdx === i ? 'var(--accent-color)' : 'transparent',
                      padding: 0,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      boxShadow: selectedThemeIdx === i ? '0 0 0 2px var(--accent-color)' : '0 1px 4px rgba(0,0,0,0.15)',
                      transition: 'all 160ms ease'
                    }}
                  >
                    <ThemePreviewSwatch theme={t} />
                    {selectedThemeIdx === i && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.35)'
                        }}
                      >
                        <Check size={16} color="#fff" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p
                style={{
                  margin: '0.5rem 0 0',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic'
                }}
              >
                {language === 'ta' ? theme.labelTa : theme.label}
              </p>
            </div>

            {/* Text Alignment */}
            <div>
              <p
                style={{
                  margin: '0 0 0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                {language === 'ta' ? 'உரை சீரமைப்பு' : 'Text Alignment'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setTextAlign(a)}
                    style={{
                      flex: 1,
                      padding: '0.4375rem',
                      borderRadius: '0.5rem',
                      border: '1.5px solid',
                      borderColor: textAlign === a ? 'var(--accent-color)' : 'var(--border-color)',
                      background: textAlign === a ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
                      color: textAlign === a ? 'var(--accent-color)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'all 160ms ease'
                    }}
                    title={a}
                  >
                    {a === 'left' ? '⬅' : a === 'center' ? '⬜' : '➡'}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <p
                style={{
                  margin: '0 0 0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                {language === 'ta' ? 'விருப்பங்கள்' : 'Options'}
              </p>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)'
                }}
              >
                <input
                  type="checkbox"
                  checked={showTagline}
                  onChange={(e) => setShowTagline(e.target.checked)}
                  style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Sparkles size={13} style={{ color: 'var(--accent-color)' }} />
                  {language === 'ta' ? '"Bible My Gift" குறிப்பிட' : 'Show App Tagline'}
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: didDownload
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  cursor: isGenerating ? 'wait' : 'pointer',
                  opacity: isGenerating ? 0.8 : 1,
                  transition: 'all 200ms ease',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.35)'
                }}
              >
                {didDownload ? (
                  <>
                    <Check size={17} />
                    <span>{language === 'ta' ? 'பதிவிறக்கப்பட்டது!' : 'Downloaded!'}</span>
                  </>
                ) : (
                  <>
                    <Download size={17} />
                    <span>{language === 'ta' ? 'PNG பதிவிறக்கு' : 'Download PNG'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                disabled={isGenerating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: isGenerating ? 'wait' : 'pointer',
                  opacity: isGenerating ? 0.7 : 1,
                  transition: 'all 200ms ease'
                }}
              >
                <Share2 size={17} />
                <span>
                  {language === 'ta' ? 'பகிர் / நகலெடு' : 'Share / Copy'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-res canvas for generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

// ─── Theme Swatch Preview ──────────────────────────────────────────────────────

const ThemePreviewSwatch: React.FC<{ theme: CardTheme }> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = 64;
    c.height = 64;
    theme.render(c.getContext('2d')!, 64, 64);
  }, [theme]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
};
