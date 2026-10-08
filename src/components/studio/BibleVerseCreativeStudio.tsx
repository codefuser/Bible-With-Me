import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StudioProject, StudioLayer, StudioTemplate, CanvasRatioId, StudioEffects, StudioBackground, TextLayer } from './types';
import { STUDIO_TEMPLATES, CANVAS_SIZES } from './studioTemplates';
import { StudioHistoryManager } from './studioHistory';
import { downloadStudioDesign, copyStudioDesignToClipboard, ExportFormat, ExportScale } from './studioExport';
import { StudioTopBar } from './StudioTopBar';
import { StudioLeftNav, StudioNavTabId } from './StudioLeftNav';
import { StudioCanvas } from './StudioCanvas';
import { StudioPropertiesPanel } from './StudioPropertiesPanel';
import { TemplatesPanel } from './panels/TemplatesPanel';
import { BackgroundPanel } from './panels/BackgroundPanel';
import { PhotosPanel } from './panels/PhotosPanel';
import { TextPanel } from './panels/TextPanel';
import { BiblePickerPanel } from './panels/BiblePickerPanel';
import { ElementsPanel } from './panels/ElementsPanel';
import { ShapesPanel } from './panels/ShapesPanel';
import { LayersPanel } from './panels/LayersPanel';
import { EffectsPanel } from './panels/EffectsPanel';
import { BrandPanel } from './panels/BrandPanel';
import { X, Check, ChevronDown } from 'lucide-react';
import './studio.css';

interface BibleVerseCreativeStudioProps {
  initialVerseTa: string;
  initialVerseEn: string;
  initialReference: string;
  onClose: () => void;
  isTa?: boolean;
}

export const BibleVerseCreativeStudio: React.FC<BibleVerseCreativeStudioProps> = ({
  initialVerseTa,
  initialVerseEn,
  initialReference,
  onClose,
  isTa
}) => {
  const [verseTa, setVerseTa] = useState(initialVerseTa);
  const [verseEn, setVerseEn] = useState(initialVerseEn);
  const [reference, setReference] = useState(initialReference);

  // Initialize Project State
  const [project, setProject] = useState<StudioProject>(() => {
    const defaultTemplate = STUDIO_TEMPLATES[0]; // Golden Faith
    const defaultCanvas = CANVAS_SIZES[0]; // 1080x1080 (1:1)

    const initialLayers = defaultTemplate.createLayers(
      initialVerseTa || 'கர்த்தர் என் வெளிச்சமும் என் இரட்சிப்புமானவர்; யாருக்கு அஞ்சுவேன்?',
      initialVerseEn || 'The Lord is my light and my salvation; whom shall I fear?',
      initialReference || 'Psalms 27:1',
      defaultCanvas.width,
      defaultCanvas.height
    );

    return {
      id: `proj-${Date.now()}`,
      version: '2.0.0',
      name: initialReference || 'Verse Card',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      canvas: {
        width: defaultCanvas.width,
        height: defaultCanvas.height,
        ratioId: defaultCanvas.id
      },
      background: defaultTemplate.background,
      effects: defaultTemplate.effects,
      layers: initialLayers,
      watermark: {
        enabled: true,
        text: 'Bible With Me • என்னோடு வேதாகமம்',
        color: '#ffffff',
        opacity: 0.65
      }
    };
  });

  // History Stack Manager
  const historyManagerRef = useRef<StudioHistoryManager>(new StudioHistoryManager(project));
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Sync canUndo and canRedo with history manager
  const syncHistoryState = useCallback(() => {
    setCanUndo(historyManagerRef.current.canUndo());
    setCanRedo(historyManagerRef.current.canRedo());
  }, []);

  // Prevent background Bible page scrolling on mobile
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      const isScrollable = target?.closest('.studio-drawer-body, .studio-drawer, .studio-left-nav, .studio-properties-body, .studio-canvas-viewport');
      if (!isScrollable && e.cancelable) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Editor UI State
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<StudioNavTabId | null>('templates');
  const [zoom, setZoom] = useState<number>(100);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [showSafeArea, setShowSafeArea] = useState<boolean>(false);
  const [snapGuidesEnabled, setSnapGuidesEnabled] = useState<boolean>(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2800);
  }, []);

  // Push Snapshot to History Stack
  const pushHistory = useCallback((customProject?: StudioProject) => {
    const target = customProject || project;
    historyManagerRef.current.push(target);
    syncHistoryState();
    setAutoSaveStatus('unsaved');
  }, [project, syncHistoryState]);

  // Autosave to LocalStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('bible_verse_creative_studio_draft', JSON.stringify(project));
        setAutoSaveStatus('saved');
      } catch (e) {
        console.warn('Autosave error:', e);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [project]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    const prev = historyManagerRef.current.undo();
    if (prev) {
      setProject(prev);
      syncHistoryState();
      if (selectedLayerId && !prev.layers.some(l => l.id === selectedLayerId)) {
        setSelectedLayerId(null);
      }
      showToast(isTa ? 'செயல் செயல்தவிர்க்கப்பட்டது' : 'Undo');
    }
  }, [selectedLayerId, syncHistoryState, showToast, isTa]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    const next = historyManagerRef.current.redo();
    if (next) {
      setProject(next);
      syncHistoryState();
      if (selectedLayerId && !next.layers.some(l => l.id === selectedLayerId)) {
        setSelectedLayerId(null);
      }
      showToast(isTa ? 'செயல் மீண்டும் செய்யப்பட்டது' : 'Redo');
    }
  }, [selectedLayerId, syncHistoryState, showToast, isTa]);

  // Layer Mutations
  const handleUpdateLayer = useCallback((id: string, updates: Partial<StudioLayer>) => {
    setProject(prev => {
      const nextLayers = prev.layers.map(l => (l.id === id ? ({ ...l, ...updates } as StudioLayer) : l));
      const nextProj = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(nextProj);
      return nextProj;
    });
  }, [pushHistory]);

  const handleAddLayer = useCallback((newLayer: StudioLayer) => {
    setProject(prev => {
      const nextLayers = [...prev.layers, newLayer];
      const nextProj = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(nextProj);
      return nextProj;
    });
    setSelectedLayerId(newLayer.id);
    showToast(isTa ? 'புதிய லேயர் சேர்க்கப்பட்டது' : 'Layer added to canvas');
  }, [pushHistory, showToast, isTa]);

  const handleDeleteLayer = useCallback((id: string) => {
    setProject(prev => {
      const nextLayers = prev.layers.filter(l => l.id !== id);
      const nextProj = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(nextProj);
      return nextProj;
    });
    if (selectedLayerId === id) setSelectedLayerId(null);
    showToast(isTa ? 'லேயர் நீக்கப்பட்டது' : 'Layer deleted');
  }, [selectedLayerId, pushHistory, showToast, isTa]);

  const handleDuplicateLayer = useCallback((id: string) => {
    const layer = project.layers.find(l => l.id === id);
    if (!layer) return;

    const dupLayer: StudioLayer = {
      ...layer,
      id: `${layer.type}-${Date.now()}`,
      name: `${layer.name} (Copy)`,
      x: layer.x + 24,
      y: layer.y + 24,
      zIndex: project.layers.length + 1
    };

    handleAddLayer(dupLayer);
  }, [project.layers, handleAddLayer]);

  const handleMoveLayer = useCallback((id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    setProject(prev => {
      const layers = [...prev.layers];
      const idx = layers.findIndex(l => l.id === id);
      if (idx === -1) return prev;

      if (direction === 'up' && idx < layers.length - 1) {
        const temp = layers[idx].zIndex;
        layers[idx].zIndex = layers[idx + 1].zIndex;
        layers[idx + 1].zIndex = temp;
      } else if (direction === 'down' && idx > 0) {
        const temp = layers[idx].zIndex;
        layers[idx].zIndex = layers[idx - 1].zIndex;
        layers[idx - 1].zIndex = temp;
      }

      layers.sort((a, b) => a.zIndex - b.zIndex);
      layers.forEach((l, i) => { l.zIndex = i + 1; });

      const nextProj = { ...prev, layers, updatedAt: Date.now() };
      pushHistory(nextProj);
      return nextProj;
    });
  }, [pushHistory]);

  // Template Switcher
  const handleApplyTemplate = useCallback((template: StudioTemplate) => {
    const { width: W, height: H } = project.canvas;
    const newLayers = template.createLayers(verseTa, verseEn, reference, W, H);

    setProject(prev => {
      const nextProj: StudioProject = {
        ...prev,
        background: template.background,
        effects: template.effects,
        layers: newLayers,
        updatedAt: Date.now()
      };
      pushHistory(nextProj);
      return nextProj;
    });
    showToast(isTa ? `வார்ப்புரு பயன்படுத்தப்பட்டது: ${template.nameTa}` : `Applied template: ${template.name}`);
  }, [project.canvas, verseTa, verseEn, reference, pushHistory, showToast, isTa]);

  // Canvas Dimension / Ratio Switcher
  const handleChangeCanvasRatio = useCallback((ratioId: CanvasRatioId) => {
    const targetSize = CANVAS_SIZES.find((s: any) => s.id === ratioId) || CANVAS_SIZES[0];
    const oldW = project.canvas.width;
    const oldH = project.canvas.height;
    const scaleX = targetSize.width / oldW;
    const scaleY = targetSize.height / oldH;

    // Proportionally scale layer positions & dimensions
    const scaledLayers = project.layers.map(l => ({
      ...l,
      x: Math.round(l.x * scaleX),
      y: Math.round(l.y * scaleY),
      width: Math.round(l.width * scaleX),
      height: Math.round(l.height * scaleY),
      ...(l.type === 'text' ? { fontSize: Math.round((l as TextLayer).fontSize * Math.min(scaleX, scaleY)) } : {})
    })) as StudioLayer[];

    setProject(prev => {
      const nextProj: StudioProject = {
        ...prev,
        canvas: {
          width: targetSize.width,
          height: targetSize.height,
          ratioId: targetSize.id
        },
        layers: scaledLayers,
        updatedAt: Date.now()
      };
      pushHistory(nextProj);
      return nextProj;
    });
  }, [project.canvas, project.layers, pushHistory]);

  // Scripture Update
  const handleSelectScripture = useCallback((newTa: string, newEn: string, newRef: string) => {
    setVerseTa(newTa);
    setVerseEn(newEn);
    setReference(newRef);

    setProject(prev => {
      const nextLayers = prev.layers.map(l => {
        if (l.type === 'text') {
          const tl = l as TextLayer;
          if (tl.role === 'verse-ta') return { ...tl, text: newTa };
          if (tl.role === 'verse-en') return { ...tl, text: newEn };
          if (tl.role === 'reference') return { ...tl, text: `— ${newRef} —` };
        }
        return l;
      });
      return { ...prev, layers: nextLayers, updatedAt: Date.now() };
    });
    pushHistory();
    showToast(isTa ? `வசனம் புதுப்பிக்கப்பட்டது: ${newRef}` : `Scripture updated: ${newRef}`);
  }, [pushHistory, showToast, isTa]);

  // Deterministic Smart Auto-Design Composition
  const handleAutoDesign = useCallback(() => {
    const { width: W, height: H } = project.canvas;
    const charCount = (verseTa || '').length;

    // Dynamically calculate ideal verse font size based on text length
    let fontSizeTa = Math.round(W * 0.046);
    if (charCount > 120) fontSizeTa = Math.round(W * 0.038);
    if (charCount > 200) fontSizeTa = Math.round(W * 0.032);
    if (charCount < 60) fontSizeTa = Math.round(W * 0.054);

    const fontSizeEn = Math.round(fontSizeTa * 0.68);
    const contentW = Math.round(W * 0.84);
    const centerX = Math.round((W - contentW) / 2);

    setProject(prev => {
      const nextLayers = prev.layers.map(l => {
        if (l.type === 'text') {
          const tl = l as TextLayer;
          if (tl.role === 'verse-ta') {
            return {
              ...tl,
              x: centerX,
              y: Math.round(H * 0.32),
              width: contentW,
              fontSize: fontSizeTa,
              textAlign: 'center' as const,
              lineHeight: 1.55,
              shadowBlur: 14,
              shadowColor: 'rgba(0,0,0,0.7)'
            };
          }
          if (tl.role === 'verse-en') {
            return {
              ...tl,
              x: centerX,
              y: Math.round(H * 0.52),
              width: contentW,
              fontSize: fontSizeEn,
              textAlign: 'center' as const,
              lineHeight: 1.45,
              fontStyle: 'italic' as const,
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.6)'
            };
          }
          if (tl.role === 'reference') {
            return {
              ...tl,
              x: centerX,
              y: Math.round(H * 0.74),
              width: contentW,
              fontSize: Math.round(W * 0.028),
              textAlign: 'center' as const,
              letterSpacing: 2,
              textColor: '#fbbf24'
            };
          }
        }
        return l;
      });

      const nextProj = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(nextProj);
      return nextProj;
    });
    showToast(isTa ? 'தானியங்கி வடிவமைப்பு சீரமைக்கப்பட்டது' : 'Smart Auto Composition applied');
  }, [project.canvas, verseTa, pushHistory, showToast, isTa]);

  // Smart Readability Enhancer
  const handleAutoReadability = useCallback(() => {
    setProject(prev => {
      const nextBg: StudioBackground = {
        ...prev.background,
        overlayOpacity: Math.max(0.45, prev.background.overlayOpacity),
        overlayColor: '#000000',
        imageBlur: Math.max(2, prev.background.imageBlur),
        vignette: Math.max(25, prev.background.vignette)
      };

      const nextLayers = prev.layers.map(l => {
        if (l.type === 'text') {
          return {
            ...l,
            shadowColor: 'rgba(0, 0, 0, 0.85)',
            shadowBlur: Math.max(12, (l as TextLayer).shadowBlur),
            textColor: (l as TextLayer).textColor === '#000000' ? '#ffffff' : (l as TextLayer).textColor
          };
        }
        return l;
      });

      const nextProj = { ...prev, background: nextBg, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(nextProj);
      return nextProj;
    });
    showToast(isTa ? 'வாசிப்புத் தெளிவு மேம்படுத்தப்பட்டது' : 'Readability enhanced');
  }, [pushHistory, showToast, isTa]);

  // Export & Copy Canvas Handlers
  const handleExport = useCallback(async (format: ExportFormat, scale: ExportScale) => {
    await downloadStudioDesign(project, reference, format, scale);
    showToast(isTa ? `கார்டு வெற்றிகரமாக பதிவிறக்கப்பட்டது (${format.toUpperCase()})` : `Exported image as ${format.toUpperCase()}`);
  }, [project, reference, showToast, isTa]);

  const handleCopyImage = useCallback(async () => {
    try {
      const ok = await copyStudioDesignToClipboard(project);
      if (ok) {
        showToast(isTa ? 'படம் நகலெடுக்கப்பட்டது (Clipboard)' : 'Verse card copied to clipboard!');
      } else {
        showToast(isTa ? 'நகலெடுப்பதில் சிக்கல் ஏற்பட்டது' : 'Could not copy image directly');
      }
    } catch (e) {
      showToast(isTa ? 'நகலெடுப்பதில் சிக்கல் ஏற்பட்டது' : 'Could not copy image directly');
    }
  }, [project, showToast, isTa]);

  // Keyboard Shortcuts (Undo, Redo, Delete, Nudge, Duplicate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');

      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (isInput) return;

      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (selectedLayerId) {
          e.preventDefault();
          handleDuplicateLayer(selectedLayerId);
        }
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerId) {
          e.preventDefault();
          handleDeleteLayer(selectedLayerId);
        }
        return;
      }

      // Arrow Nudging
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && selectedLayerId) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let deltaX = 0;
        let deltaY = 0;
        if (e.key === 'ArrowLeft') deltaX = -step;
        if (e.key === 'ArrowRight') deltaX = step;
        if (e.key === 'ArrowUp') deltaY = -step;
        if (e.key === 'ArrowDown') deltaY = step;

        const layer = project.layers.find(l => l.id === selectedLayerId);
        if (layer && !layer.locked) {
          handleUpdateLayer(selectedLayerId, {
            x: layer.x + deltaX,
            y: layer.y + deltaY
          });
        }
        return;
      }

      // Escape: Deselect layer
      if (e.key === 'Escape') {
        setSelectedLayerId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, project.layers, handleUndo, handleRedo, handleDeleteLayer, handleDuplicateLayer, handleUpdateLayer]);

  // Zoom Controls (Percentage based: 50% to 250%)
  const handleZoomIn = () => setZoom(prev => Math.min(250, Math.round(prev + 25)));
  const handleZoomOut = () => setZoom(prev => Math.max(50, Math.round(prev - 25)));
  const handleZoomFit = () => setZoom(100);

  const DRAWER_TITLES: Record<string, string> = {
    templates: isTa ? 'வார்ப்புருக்கள்' : 'Templates',
    background: isTa ? 'பின்னணி' : 'Background',
    photos: isTa ? 'புகைப்படம்' : 'Photos',
    text: isTa ? 'உரை & வசனம்' : 'Text & Verse',
    bible: isTa ? 'வேதாகமம்' : 'Bible Scriptures',
    elements: isTa ? 'சின்னங்கள்' : 'Sacred Elements',
    shapes: isTa ? 'வடிவங்கள்' : 'Shapes & Frames',
    layers: isTa ? 'அடுக்குகள்' : 'Layers',
    effects: isTa ? 'விளைவுகள்' : 'Devotional Effects',
    brand: isTa ? 'வாட்டர்மார்க்' : 'Brand & Watermark'
  };

  return (
    <div className="bible-creative-studio">
      {/* ── Top Bar ── */}
      <StudioTopBar
        refText={reference}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitZoom={handleZoomFit}
        showSafeArea={showSafeArea}
        onToggleSafeArea={() => setShowSafeArea((s: boolean) => !s)}
        isPreviewMode={previewMode}
        onTogglePreviewMode={() => setPreviewMode(p => !p)}
        onCopyImage={handleCopyImage}
        onExport={handleExport}
        onClose={onClose}
        isSaving={autoSaveStatus === 'saving'}
        canvasWidth={project.canvas.width}
        canvasHeight={project.canvas.height}
      />

      {/* ── Workspace ── */}
      <div className="studio-workspace">
        {/* Left Tool Strip Navigation */}
        <StudioLeftNav
          activeTab={activeNavTab}
          onSelectTab={tab => setActiveNavTab(prev => (prev === tab ? null : tab))}
          isTa={isTa}
        />

        {/* Slide-out Tool Drawer */}
        {activeNavTab && (
          <aside className="studio-drawer">
            <div className="studio-drawer-header">
              <span className="studio-drawer-title">
                {DRAWER_TITLES[activeNavTab] || activeNavTab}
              </span>
              <button
                type="button"
                className="studio-drawer-close-btn"
                onClick={() => setActiveNavTab(null)}
                title={isTa ? 'சுருக்கு' : 'Hide Drawer'}
              >
                <ChevronDown size={16} />
                <span>{isTa ? 'சுருக்கு' : 'Hide'}</span>
              </button>
            </div>

            <div className="studio-drawer-body">
              {activeNavTab === 'templates' && (
                <TemplatesPanel
                  onApplyTemplate={handleApplyTemplate}
                  activeTemplateId={project.id}
                />
              )}

              {activeNavTab === 'background' && (
                <BackgroundPanel
                  background={project.background}
                  onChangeBackground={bg => {
                    setProject(prev => {
                      const nextProj = { ...prev, background: bg, updatedAt: Date.now() };
                      pushHistory(nextProj);
                      return nextProj;
                    });
                  }}
                />
              )}

              {activeNavTab === 'photos' && (
                <PhotosPanel
                  project={project}
                  onAddLayer={handleAddLayer}
                  onSetBackgroundWallpaper={src => {
                    setProject(prev => {
                      const nextProj: StudioProject = {
                        ...prev,
                        background: { ...prev.background, type: 'image' as const, imageSrc: src, overlayOpacity: 0.45 },
                        updatedAt: Date.now()
                      };
                      pushHistory(nextProj);
                      return nextProj;
                    });
                    showToast(isTa ? 'பின்னணி வால்பேப்பர் மாற்றப்பட்டது' : 'Background wallpaper updated');
                  }}
                  isTa={isTa}
                />
              )}

              {activeNavTab === 'text' && (
                <TextPanel
                  project={project}
                  onAddLayer={handleAddLayer}
                  onUpdateLayer={handleUpdateLayer}
                  selectedLayerId={selectedLayerId}
                  verseTa={verseTa}
                  verseEn={verseEn}
                  reference={reference}
                  isTa={isTa}
                />
              )}

              {activeNavTab === 'bible' && (
                <BiblePickerPanel
                  project={project}
                  onSelectVerse={handleSelectScripture}
                  onAddLayer={handleAddLayer}
                  isTa={isTa}
                />
              )}

              {activeNavTab === 'elements' && (
                <ElementsPanel
                  project={project}
                  onAddLayer={handleAddLayer}
                  isTa={isTa}
                />
              )}

              {activeNavTab === 'shapes' && (
                <ShapesPanel
                  project={project}
                  onAddLayer={handleAddLayer}
                  isTa={isTa}
                />
              )}

              {activeNavTab === 'layers' && (
                <LayersPanel
                  project={project}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={setSelectedLayerId}
                  onUpdateLayer={handleUpdateLayer}
                  onDeleteLayer={handleDeleteLayer}
                  onDuplicateLayer={handleDuplicateLayer}
                  onMoveLayer={handleMoveLayer}
                  isTa={isTa}
                />
              )}

              {activeNavTab === 'effects' && (
                <EffectsPanel
                  project={project}
                  onUpdateEffects={eff => {
                    setProject(prev => {
                      const nextProj = { ...prev, effects: { ...prev.effects, ...eff }, updatedAt: Date.now() };
                      pushHistory(nextProj);
                      return nextProj;
                    });
                  }}
                  onUpdateBackground={bg => {
                    setProject(prev => {
                      const nextProj = { ...prev, background: { ...prev.background, ...bg }, updatedAt: Date.now() };
                      pushHistory(nextProj);
                      return nextProj;
                    });
                  }}
                  onAutoReadability={handleAutoReadability}
                  isTa={isTa}
                />
              )}

              {activeNavTab === 'brand' && (
                <BrandPanel
                  project={project}
                  onUpdateWatermark={(wm: any) => {
                    setProject(prev => {
                      const nextProj: StudioProject = { ...prev, watermark: { ...prev.watermark, ...wm }, updatedAt: Date.now() };
                      pushHistory(nextProj);
                      return nextProj;
                    });
                  }}
                  isTa={isTa}
                />
              )}
            </div>
          </aside>
        )}

        {/* Central Canvas Viewport */}
        <main
          className="studio-canvas-area"
          onClick={() => {
            setSelectedLayerId(null);
            if (window.innerWidth <= 768) {
              setActiveNavTab(null);
            }
          }}
        >
          <StudioCanvas
            project={project}
            selectedLayerId={previewMode ? null : selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayer={handleUpdateLayer}
            onPushHistory={() => pushHistory(project)}
            zoom={zoom}
            onZoomChange={setZoom}
            showGuides={!previewMode && snapGuidesEnabled}
            showSafeArea={!previewMode && showSafeArea}
          />

          {/* Status Bar */}
          <div className="studio-status-bar">
            <div className="flex items-center gap-3">
              <span>
                {project.canvas.ratioId.toUpperCase()} • {project.canvas.width} × {project.canvas.height} px
              </span>
              <span>•</span>
              <span>{project.layers.length} Layers</span>
              {selectedLayerId && (
                <>
                  <span>•</span>
                  <span className="text-amber-400">
                    Selected: {project.layers.find(l => l.id === selectedLayerId)?.name}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span>Zoom: {Math.round(zoom)}%</span>
              <span className="text-slate-500">Ctrl+Z: Undo | Ctrl+Y: Redo | Ctrl+D: Duplicate</span>
            </div>
          </div>
        </main>

        {/* Right Contextual Properties Panel */}
        {!previewMode && (
          <StudioPropertiesPanel
            project={project}
            selectedLayerId={selectedLayerId}
            onUpdateLayer={handleUpdateLayer}
            onDeleteLayer={handleDeleteLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onMoveLayer={handleMoveLayer}
            onChangeCanvasRatio={handleChangeCanvasRatio}
            onAutoDesign={handleAutoDesign}
            showSafeArea={showSafeArea}
            onToggleSafeArea={() => setShowSafeArea(s => !s)}
            snapGuidesEnabled={snapGuidesEnabled}
            onToggleSnapGuides={() => setSnapGuidesEnabled(s => !s)}
            isTa={isTa}
          />
        )}
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-amber-500/40 text-white text-xs font-semibold shadow-2xl shadow-black animate-fade-in backdrop-blur-md">
          <Check size={14} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
