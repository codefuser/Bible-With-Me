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

  const estSizeMb = (
    (canvasWidth * exportScale * canvasHeight * exportScale * 4) /
    (1024 * 1024 * (exportFormat === 'jpeg' ? 6 : 3))
  ).toFixed(1);

  return (
    <header
      className="studio-topbar"
      style={{
        height: '56px',
        backgroundColor: '#0c101c',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        color: '#f8fafc',
        zIndex: 100,
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {/* ── Left: Studio Branding & Active Verse Reference ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)'
            }}
          >
            <Sparkles size={16} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff' }}>
              Bible Verse Creative Studio
            </h1>
            <p style={{ margin: 0, fontSize: '0.6875rem', color: '#94a3b8' }}>
              {isSaving ? 'Saving changes...' : 'Saved · Live Canvas'}
            </p>
          </div>
        </div>

        {refText && (
          <div
            style={{
              padding: '0.25rem 0.625rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              fontSize: '0.75rem',
              fontWeight: 700
            }}
          >
            {refText}
          </div>
        )}
      </div>

      {/* ── Center: Undo / Redo & Zoom Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Undo / Redo */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#131826', borderRadius: '6px', padding: '2px' }}>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: canUndo ? '#e2e8f0' : '#475569',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: canRedo ? '#e2e8f0' : '#475569',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Redo2 size={15} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#131826', borderRadius: '6px', padding: '2px 4px' }}>
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0 6px', color: '#cbd5e1', minWidth: '42px', textAlign: 'center' }}>
            {zoom}%
          </span>
          <button
            onClick={onZoomIn}
            title="Zoom In"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={onFitZoom}
            title="Fit to Window"
            style={{
              width: '28px',
              height: '28px',
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
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Safe Area Guide Toggle */}
        <button
          onClick={onToggleSafeArea}
          title="Toggle Social Media Safe Margin Guides"
          style={{
            height: '32px',
            padding: '0 0.625rem',
            borderRadius: '6px',
            border: `1px solid ${showSafeArea ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
            backgroundColor: showSafeArea ? 'rgba(245, 158, 11, 0.15)' : '#131826',
            color: showSafeArea ? '#fbbf24' : '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <ShieldAlert size={14} />
          <span>Safe Area</span>
        </button>

        {/* Preview Mode */}
        <button
          onClick={onTogglePreviewMode}
          title="Toggle Clean Preview Mode"
          style={{
            height: '32px',
            padding: '0 0.625rem',
            borderRadius: '6px',
            border: `1px solid ${isPreviewMode ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
            backgroundColor: isPreviewMode ? 'rgba(56, 189, 248, 0.15)' : '#131826',
            color: isPreviewMode ? '#38bdf8' : '#94a3b8',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Eye size={14} />
          <span>Preview</span>
        </button>
      </div>

      {/* ── Right: Copy Image, Prominent Export Dropdown, Close Button ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', position: 'relative' }}>
        {/* Copy Image Button */}
        <button
          onClick={handleCopy}
          title="Copy Image Directly to Clipboard"
          style={{
            height: '36px',
            padding: '0 0.875rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            backgroundColor: copiedToast ? 'rgba(34, 197, 94, 0.2)' : '#171d2d',
            color: copiedToast ? '#22c55e' : '#e2e8f0',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 150ms ease'
          }}
        >
          {copiedToast ? <Check size={15} color="#22c55e" /> : <Copy size={15} />}
          <span>{copiedToast ? 'Copied!' : 'Copy Image'}</span>
        </button>

        {/* Prominent Export Button */}
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          style={{
            height: '36px',
            padding: '0 1rem',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.84375rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
          }}
        >
          <Download size={16} />
          <span>Export Graphic</span>
          <ChevronDown size={14} />
        </button>

        {/* Export Flyout Settings Popover */}
        {showExportMenu && (
          <div
            style={{
              position: 'absolute',
              top: '46px',
              right: '48px',
              width: '280px',
              backgroundColor: '#111726',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              padding: '1rem',
              zIndex: 300,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem'
            }}
          >
            <div>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                File Format
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    style={{
                      padding: '0.4rem',
                      borderRadius: '6px',
                      border: `1.5px solid ${exportFormat === fmt ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                      backgroundColor: exportFormat === fmt ? 'rgba(245,158,11,0.18)' : '#1a2236',
                      color: exportFormat === fmt ? '#fbbf24' : '#cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Resolution Scale
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                {([1, 2, 3] as const).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setExportScale(sc)}
                    style={{
                      padding: '0.4rem',
                      borderRadius: '6px',
                      border: `1.5px solid ${exportScale === sc ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                      backgroundColor: exportScale === sc ? 'rgba(245,158,11,0.18)' : '#1a2236',
                      color: exportScale === sc ? '#fbbf24' : '#cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {sc === 1 ? '1x Normal' : sc === 2 ? '2x HD 2K' : '3x 4K Ultra'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.625rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>Output: {canvasWidth * exportScale} × {canvasHeight * exportScale}px</span>
              <span>~{estSizeMb} MB</span>
            </div>

            <button
              onClick={handleExecuteExport}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Download size={16} />
              <span>Download Image</span>
            </button>
          </div>
        )}

        {/* Close Studio Button */}
        <button
          onClick={onClose}
          title="Close Studio (Esc)"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>
      </div>
    </header>
  );
};
