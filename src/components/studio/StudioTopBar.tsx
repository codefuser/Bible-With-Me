import React, { useState } from 'react';
import {
  Sparkles,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Copy,
  Download,
  Check,
  X,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { ExportFormat, ExportScale } from './studioExport';

interface StudioTopBarProps {
  refText: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitZoom: () => void;
  showSafeArea: boolean;
  onToggleSafeArea: () => void;
  isPreviewMode: boolean;
  onTogglePreviewMode: () => void;
  onCopyImage: () => void;
  onExport: (format: ExportFormat, scale: ExportScale) => void;
  onClose: () => void;
  isSaving: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  refText,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitZoom,
  showSafeArea,
  onToggleSafeArea,
  isPreviewMode,
  onTogglePreviewMode,
  onCopyImage,
  onExport,
  onClose,
  isSaving,
  canvasWidth,
  canvasHeight
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportScale, setExportScale] = useState<ExportScale>(1);
  const [copiedToast, setCopiedToast] = useState(false);

  const handleCopy = () => {
    onCopyImage();
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleExecuteExport = () => {
    setShowExportMenu(false);
    onExport(exportFormat, exportScale);
  };

  // Convert zoom to whole percentage: if zoom is 1.0 or 1.1, convert to 100, 110
  const displayZoom = Math.round(zoom <= 3 ? zoom * 100 : zoom);

  const estSizeMb = (
    (canvasWidth * exportScale * canvasHeight * exportScale * 4) /
    (1024 * 1024 * (exportFormat === 'jpeg' ? 6 : 3))
  ).toFixed(1);

  return (
    <header
      className="studio-topbar"
      style={{
        height: '54px',
        backgroundColor: '#0c101c',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0.75rem',
        color: '#f8fafc',
        zIndex: 100,
        flexShrink: 0,
        userSelect: 'none',
        gap: '0.4rem',
        overflow: 'visible'
      }}
    >
      {/* ── Left: Studio Branding & Active Verse Reference ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
              flexShrink: 0
            }}
          >
            <Sparkles size={14} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: '#ffffff',
                whiteSpace: 'nowrap'
              }}
            >
              <span className="studio-brand-full">Verse Studio</span>
              <span className="studio-brand-short">Studio</span>
            </h1>
            <span className="studio-topbar-subtitle" style={{ fontSize: '0.6rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
              {isSaving ? 'Saving...' : 'Live Canvas'}
            </span>
          </div>
        </div>

        {refText && (
          <div
            className="studio-topbar-ref"
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              fontSize: '0.7rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              maxWidth: '110px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={refText}
          >
            {refText}
          </div>
        )}
      </div>

      {/* ── Center: Undo / Redo & Zoom Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        {/* Undo / Redo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#131826',
            borderRadius: '6px',
            padding: '2px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: canUndo ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: canUndo ? '#f8fafc' : '#475569',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 120ms ease'
            }}
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: canRedo ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: canRedo ? '#f8fafc' : '#475569',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 120ms ease'
            }}
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#131826',
            borderRadius: '6px',
            padding: '2px 4px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ZoomOut size={13} />
          </button>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0 4px',
              color: '#fbbf24',
              minWidth: '40px',
              textAlign: 'center'
            }}
          >
            {displayZoom}%
          </span>
          <button
            onClick={onZoomIn}
            title="Zoom In"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={onFitZoom}
            title="Fit to Window"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '2px'
            }}
          >
            <Maximize2 size={12} />
          </button>
        </div>

        {/* Safe Area Guide Toggle (Desktop/Tablet) */}
        <button
          onClick={onToggleSafeArea}
          title="Toggle Social Media Safe Margins"
          className="studio-topbar-desktop-only"
          style={{
            height: '30px',
            padding: '0 0.5rem',
            borderRadius: '6px',
            border: `1px solid ${showSafeArea ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
            backgroundColor: showSafeArea ? 'rgba(245, 158, 11, 0.15)' : '#131826',
            color: showSafeArea ? '#fbbf24' : '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <ShieldAlert size={13} />
          <span>Guide</span>
        </button>

        {/* Preview Mode (Desktop/Tablet) */}
        <button
          onClick={onTogglePreviewMode}
          title="Toggle Clean Preview Mode"
          className="studio-topbar-desktop-only"
          style={{
            height: '30px',
            padding: '0 0.5rem',
            borderRadius: '6px',
            border: `1px solid ${isPreviewMode ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
            backgroundColor: isPreviewMode ? 'rgba(56, 189, 248, 0.15)' : '#131826',
            color: isPreviewMode ? '#38bdf8' : '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <Eye size={13} />
          <span>Preview</span>
        </button>
      </div>

      {/* ── Right: Copy Image, Prominent Export Dropdown, Close Button ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', position: 'relative', flexShrink: 0 }}>
        {/* Copy Image Button */}
        <button
          onClick={handleCopy}
          title="Copy Image Directly to Clipboard"
          className="studio-topbar-desktop-only"
          style={{
            height: '32px',
            padding: '0 0.65rem',
            borderRadius: '7px',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            backgroundColor: copiedToast ? 'rgba(34, 197, 94, 0.2)' : '#171d2d',
            color: copiedToast ? '#22c55e' : '#e2e8f0',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 150ms ease'
          }}
        >
          {copiedToast ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
          <span>{copiedToast ? 'Copied!' : 'Copy'}</span>
        </button>

        {/* Prominent Export Button */}
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          style={{
            height: '32px',
            padding: '0 0.75rem',
            borderRadius: '7px',
            border: 'none',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 3px 10px rgba(239, 68, 68, 0.35)'
          }}
        >
          <Download size={14} />
          <span>Export</span>
          <ChevronDown size={13} />
        </button>

        {/* Export Flyout Settings Popover */}
        {showExportMenu && (
          <div
            style={{
              position: 'absolute',
              top: '42px',
              right: '36px',
              width: '270px',
              backgroundColor: '#111726',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.85)',
              padding: '0.85rem',
              zIndex: 300,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                Export Format
              </span>
              <button
                onClick={() => setShowExportMenu(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Format Selection (PNG / JPEG / WEBP) */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    borderRadius: '6px',
                    border: `1px solid ${exportFormat === fmt ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                    backgroundColor: exportFormat === fmt ? 'rgba(245, 158, 11, 0.2)' : '#1a2234',
                    color: exportFormat === fmt ? '#fbbf24' : '#cbd5e1',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Resolution Multiplier */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {([1, 2, 3] as ExportScale[]).map((scale) => (
                <button
                  key={scale}
                  onClick={() => setExportScale(scale)}
                  style={{
                    flex: 1,
                    padding: '0.35rem',
                    borderRadius: '6px',
                    border: `1px solid ${exportScale === scale ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                    backgroundColor: exportScale === scale ? 'rgba(56, 189, 248, 0.2)' : '#1a2234',
                    color: exportScale === scale ? '#38bdf8' : '#cbd5e1',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {scale}x ({canvasWidth * scale}px)
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Estimated size: ~{estSizeMb} MB
            </div>

            {/* Download Button */}
            <button
              onClick={handleExecuteExport}
              className="studio-btn-primary"
              style={{ padding: '0.55rem' }}
            >
              <Download size={14} />
              <span>Download Image</span>
            </button>
          </div>
        )}

        {/* Close Studio Button */}
        <button
          onClick={onClose}
          title="Close Studio (Esc)"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '7px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 120ms ease'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </header>
  );
};
