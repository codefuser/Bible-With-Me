import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StudioProject, StudioLayer, TextLayer, ShapeLayer } from './types';
import { renderStudioCanvas } from './studioRenderer';

interface StudioCanvasProps {
  project: StudioProject;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<StudioLayer>) => void;
  onPushHistory: () => void;
  zoom: number;
  showGuides: boolean;
  showSafeArea: boolean;
}

type DragAction =
  | 'move'
  | 'resize-nw'
  | 'resize-ne'
  | 'resize-sw'
  | 'resize-se'
  | 'rotate';

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  project,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onPushHistory,
  zoom,
  showGuides,
  showSafeArea
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [snapLines, setSnapLines] = useState<{ x?: number; y?: number }>({});
  const [dragAction, setDragAction] = useState<DragAction | null>(null);
  const [dragStart, setDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    layerX: number;
    layerY: number;
    layerW: number;
    layerH: number;
    layerRot: number;
  } | null>(null);

  const { width: W, height: H } = project.canvas;
  const selectedLayer = project.layers.find((l) => l.id === selectedLayerId && l.visible && !l.locked);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderStudioCanvas(ctx, project, {
      isExport: false,
      showGuides,
      showSafeArea,
      activeSnapLines: snapLines,
      selectedLayerId
    });
  }, [project, selectedLayerId, showGuides, showSafeArea, snapLines]);

  // Transform Mouse/Pointer/Touch event into Canvas Coordinates
  const getCanvasCoords = useCallback(
    (e: React.PointerEvent | PointerEvent | React.MouseEvent | MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    },
    [W, H]
  );

  // Precision Layer Hit-Testing
  const findLayerAtCoords = useCallback(
    (x: number, y: number, currentId: string | null): StudioLayer | null => {
      const activeLayers = project.layers.filter((l) => l.visible && !l.locked);
      if (activeLayers.length === 0) return null;

      // Classify layers into priority groups:
      // Group 1: Interactive Content (Text & Symbols)
      // Group 2: Media & Filled Shapes (Images, solid cards)
      // Group 3: Hollow Border Frames (decorative frames)
      const group1: StudioLayer[] = [];
      const group2: StudioLayer[] = [];
      const group3: StudioLayer[] = [];

      for (const l of activeLayers) {
        if (l.type === 'text') {
          const tl = l as TextLayer;
          const fontSize = Math.max(12, tl.fontSize || 32);
          const lineH = fontSize * (tl.lineHeight || 1.6);
          const text = tl.text || '';
          const lines = text.split('\n');
          const avgCharW = fontSize * 0.52;
          const maxChars = Math.max(1, Math.floor(tl.width / avgCharW));
          let lineCount = 0;
          for (const line of lines) {
            lineCount += Math.max(1, Math.ceil(line.length / maxChars));
          }
          const actualH = Math.max(lineCount * lineH, fontSize * 1.4);
          const pad = tl.hasBgBox ? (tl.bgBoxPadding || 12) + 10 : 10;

          if (
            x >= tl.x - pad &&
            x <= tl.x + tl.width + pad &&
            y >= tl.y - pad &&
            y <= tl.y + actualH + pad
          ) {
            group1.push(tl);
          }
        } else if (l.type === 'element') {
          const pad = 10;
          if (
            x >= l.x - pad &&
            x <= l.x + l.width + pad &&
            y >= l.y - pad &&
            y <= l.y + l.height + pad
          ) {
            group1.push(l);
          }
        } else if (l.type === 'image') {
          if (
            x >= l.x &&
            x <= l.x + l.width &&
            y >= l.y &&
            y <= l.y + l.height
          ) {
            group2.push(l);
          }
        } else if (l.type === 'shape') {
          const sl = l as ShapeLayer;
          const isHollow = !sl.fillColor || sl.fillColor === 'transparent';
          const inOuter =
            x >= sl.x &&
            x <= sl.x + sl.width &&
            y >= sl.y &&
            y <= sl.y + sl.height;

          if (inOuter) {
            if (isHollow) {
              // Only hit if within the frame border stroke (24px thickness)
              const strokeW = Math.max(24, sl.borderWidth || 2);
              const inInner =
                x > sl.x + strokeW &&
                x < sl.x + sl.width - strokeW &&
                y > sl.y + strokeW &&
                y < sl.y + sl.height - strokeW;
              if (!inInner) {
                group3.push(sl);
              }
            } else {
              group2.push(sl);
            }
          }
        }
      }

      // Sort each group descending by zIndex
      group1.sort((a, b) => b.zIndex - a.zIndex);
      group2.sort((a, b) => b.zIndex - a.zIndex);
      group3.sort((a, b) => b.zIndex - a.zIndex);

      const allMatches = [...group1, ...group2, ...group3];
      if (allMatches.length === 0) return null;

      // If user clicks on an already selected layer and there are others underneath, cycle to next layer
      if (currentId && allMatches.length > 1) {
        const curIdx = allMatches.findIndex((m) => m.id === currentId);
        if (curIdx >= 0) {
          const nextIdx = (curIdx + 1) % allMatches.length;
          return allMatches[nextIdx];
        }
      }

      // Return highest priority match (Group 1 > Group 2 > Group 3)
      return allMatches[0];
    },
    [project.layers]
  );

  // Pointer down on canvas to select or start drag
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    const { x, y } = getCanvasCoords(e);
    const hit = findLayerAtCoords(x, y, selectedLayerId);

    if (hit) {
      onSelectLayer(hit.id);
      setDragAction('move');
      setDragStart({
        mouseX: x,
        mouseY: y,
        layerX: hit.x,
        layerY: hit.y,
        layerW: hit.width,
        layerH: hit.height,
        layerRot: hit.rotation || 0
      });
    } else {
      // Clicked on empty canvas -> select document
      onSelectLayer(null);
    }
  };

  // Start resize / rotate handles
  const handleHandlePointerDown = (e: React.PointerEvent, action: DragAction) => {
    e.stopPropagation();
    if (!selectedLayer) return;
    const { x, y } = getCanvasCoords(e);
    setDragAction(action);
    setDragStart({
      mouseX: x,
      mouseY: y,
      layerX: selectedLayer.x,
      layerY: selectedLayer.y,
      layerW: selectedLayer.width,
      layerH: selectedLayer.height,
      layerRot: selectedLayer.rotation || 0
    });
  };

  // Pointer Move Dragging / Resizing
  useEffect(() => {
    if (!dragAction || !dragStart || !selectedLayer) return;

    const handlePointerMove = (e: PointerEvent) => {
      const { x: curX, y: curY } = getCanvasCoords(e);
      const dx = curX - dragStart.mouseX;
      const dy = curY - dragStart.mouseY;

      if (dragAction === 'move') {
        let newX = Math.round(dragStart.layerX + dx);
        let newY = Math.round(dragStart.layerY + dy);

        // Smart Snapping to Canvas Center & Margins
        const activeSnaps: { x?: number; y?: number } = {};
        const centerX = newX + dragStart.layerW / 2;
        const centerY = newY + dragStart.layerH / 2;

        const SNAP_THRESHOLD = 14;
        if (Math.abs(centerX - W / 2) < SNAP_THRESHOLD) {
          newX = Math.round(W / 2 - dragStart.layerW / 2);
          activeSnaps.x = W / 2;
        }
        if (Math.abs(centerY - H / 2) < SNAP_THRESHOLD) {
          newY = Math.round(H / 2 - dragStart.layerH / 2);
          activeSnaps.y = H / 2;
        }

        setSnapLines(activeSnaps);
        onUpdateLayer(selectedLayer.id, { x: newX, y: newY });
      } else if (dragAction === 'resize-se') {
        const newW = Math.max(60, Math.round(dragStart.layerW + dx));
        const newH = Math.max(30, Math.round(dragStart.layerH + dy));
        onUpdateLayer(selectedLayer.id, { width: newW, height: newH });
      } else if (dragAction === 'resize-sw') {
        const newW = Math.max(60, Math.round(dragStart.layerW - dx));
        const newH = Math.max(30, Math.round(dragStart.layerH + dy));
        const newX = Math.round(dragStart.layerX + dx);
        onUpdateLayer(selectedLayer.id, { x: newX, width: newW, height: newH });
      } else if (dragAction === 'resize-ne') {
        const newW = Math.max(60, Math.round(dragStart.layerW + dx));
        const newH = Math.max(30, Math.round(dragStart.layerH - dy));
        const newY = Math.round(dragStart.layerY + dy);
        onUpdateLayer(selectedLayer.id, { y: newY, width: newW, height: newH });
      } else if (dragAction === 'resize-nw') {
        const newW = Math.max(60, Math.round(dragStart.layerW - dx));
        const newH = Math.max(30, Math.round(dragStart.layerH - dy));
        const newX = Math.round(dragStart.layerX + dx);
        const newY = Math.round(dragStart.layerY + dy);
        onUpdateLayer(selectedLayer.id, { x: newX, y: newY, width: newW, height: newH });
      } else if (dragAction === 'rotate') {
        const centerX = dragStart.layerX + dragStart.layerW / 2;
        const centerY = dragStart.layerY + dragStart.layerH / 2;
        const rad = Math.atan2(curY - centerY, curX - centerX);
        let deg = Math.round((rad * 180) / Math.PI) + 90;
        if (deg < 0) deg += 360;
        if (Math.abs(deg - 0) < 5 || Math.abs(deg - 360) < 5) deg = 0;
        if (Math.abs(deg - 90) < 5) deg = 90;
        if (Math.abs(deg - 180) < 5) deg = 180;
        if (Math.abs(deg - 270) < 5) deg = 270;
        onUpdateLayer(selectedLayer.id, { rotation: deg });
      }
    };

    const handlePointerUp = () => {
      setDragAction(null);
      setDragStart(null);
      setSnapLines({});
      onPushHistory();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragAction, dragStart, selectedLayer, getCanvasCoords, W, H, onUpdateLayer, onPushHistory]);

  // Display Scaling
  const baseScale = 0.50;
  const zoomFactor = typeof zoom === 'number' && zoom > 0 ? (zoom > 5 ? zoom / 100 : zoom) : 1;
  const displayW = Math.max(260, Math.round(W * baseScale * zoomFactor));
  const displayH = Math.max(260, Math.round(H * baseScale * zoomFactor));

  return (
    <div
      ref={containerRef}
      className="studio-canvas-viewport"
      onClick={() => onSelectLayer(null)}
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#070a12',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        overflow: 'auto',
        position: 'relative',
        padding: '2.5rem',
        userSelect: 'none'
      }}
    >
      <div
        className="studio-canvas-container"
        style={{
          width: `${displayW}px`,
          height: `${displayH}px`,
          position: 'relative',
          boxShadow: '0 30px 80px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.15)',
          borderRadius: '6px',
          overflow: 'visible',
          backgroundColor: '#0f172a'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={handleCanvasPointerDown}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            cursor: dragAction === 'move' ? 'grabbing' : 'default',
            borderRadius: '6px',
            touchAction: 'none'
          }}
        />

        {/* ── Bounding Box & Direct Manipulation Handles on Selected Layer ── */}
        {selectedLayer && (
          <div
            className="studio-selection-box"
            style={{
              position: 'absolute',
              left: `${(selectedLayer.x / W) * 100}%`,
              top: `${(selectedLayer.y / H) * 100}%`,
              width: `${(selectedLayer.width / W) * 100}%`,
              height: `${(selectedLayer.height / H) * 100}%`,
              transform: `rotate(${selectedLayer.rotation || 0}deg)`,
              transformOrigin: 'center center',
              border: '2px solid #38bdf8',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.6)',
              pointerEvents: 'none'
            }}
          >
            {/* Top Rotation Handle */}
            <div
              onPointerDown={(e) => handleHandlePointerDown(e, 'rotate')}
              style={{
                position: 'absolute',
                top: '-26px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '16px',
                height: '16px',
                backgroundColor: '#38bdf8',
                borderRadius: '50%',
                border: '2px solid #ffffff',
                cursor: 'grab',
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                touchAction: 'none'
              }}
              title="Rotate"
            />

            {/* 4 Corner Resize Handles */}
            <div
              onPointerDown={(e) => handleHandlePointerDown(e, 'resize-nw')}
              style={{
                position: 'absolute',
                top: '-7px',
                left: '-7px',
                width: '14px',
                height: '14px',
                backgroundColor: '#ffffff',
                border: '2.5px solid #0284c7',
                borderRadius: '3px',
                cursor: 'nwse-resize',
                pointerEvents: 'auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                touchAction: 'none'
              }}
            />
            <div
              onPointerDown={(e) => handleHandlePointerDown(e, 'resize-ne')}
              style={{
                position: 'absolute',
                top: '-7px',
                right: '-7px',
                width: '14px',
                height: '14px',
                backgroundColor: '#ffffff',
                border: '2.5px solid #0284c7',
                borderRadius: '3px',
                cursor: 'nesw-resize',
                pointerEvents: 'auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                touchAction: 'none'
              }}
            />
            <div
              onPointerDown={(e) => handleHandlePointerDown(e, 'resize-sw')}
              style={{
                position: 'absolute',
                bottom: '-7px',
                left: '-7px',
                width: '14px',
                height: '14px',
                backgroundColor: '#ffffff',
                border: '2.5px solid #0284c7',
                borderRadius: '3px',
                cursor: 'nesw-resize',
                pointerEvents: 'auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                touchAction: 'none'
              }}
            />
            <div
              onPointerDown={(e) => handleHandlePointerDown(e, 'resize-se')}
              style={{
                position: 'absolute',
                bottom: '-7px',
                right: '-7px',
                width: '14px',
                height: '14px',
                backgroundColor: '#ffffff',
                border: '2.5px solid #0284c7',
                borderRadius: '3px',
                cursor: 'nwse-resize',
                pointerEvents: 'auto',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                touchAction: 'none'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
