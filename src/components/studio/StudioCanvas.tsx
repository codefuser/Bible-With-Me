import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StudioProject, StudioLayer } from './types';
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

type DragAction = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | 'resize-n' | 'resize-s' | 'resize-w' | 'resize-e' | 'rotate';

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

  // Transform Mouse event into Canvas Coordinates
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
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

  // Pointer down on canvas to select or start drag
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);

    // Check if clicked inside any visible & unlocked layer (topmost first)
    const reversedLayers = [...project.layers]
      .filter((l) => l.visible && !l.locked)
      .sort((a, b) => b.zIndex - a.zIndex);

    const hit = reversedLayers.find((l) => {
      return x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height;
    });

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
  const handleHandleMouseDown = (e: React.MouseEvent, action: DragAction) => {
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

  // Mouse Move Dragging / Resizing
  useEffect(() => {
    if (!dragAction || !dragStart || !selectedLayer) return;

    const handleMouseMove = (e: MouseEvent) => {
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
        const newW = Math.max(30, Math.round(dragStart.layerW + dx));
        const newH = Math.max(20, Math.round(dragStart.layerH + dy));
        onUpdateLayer(selectedLayer.id, { width: newW, height: newH });
      } else if (dragAction === 'resize-sw') {
        const newW = Math.max(30, Math.round(dragStart.layerW - dx));
        const newH = Math.max(20, Math.round(dragStart.layerH + dy));
        const newX = dragStart.layerX + (dragStart.layerW - newW);
        onUpdateLayer(selectedLayer.id, { x: newX, width: newW, height: newH });
      } else if (dragAction === 'resize-ne') {
        const newW = Math.max(30, Math.round(dragStart.layerW + dx));
        const newH = Math.max(20, Math.round(dragStart.layerH - dy));
        const newY = dragStart.layerY + (dragStart.layerH - newH);
        onUpdateLayer(selectedLayer.id, { y: newY, width: newW, height: newH });
      } else if (dragAction === 'resize-nw') {
        const newW = Math.max(30, Math.round(dragStart.layerW - dx));
        const newH = Math.max(20, Math.round(dragStart.layerH - dy));
        const newX = dragStart.layerX + (dragStart.layerW - newW);
        const newY = dragStart.layerY + (dragStart.layerH - newH);
        onUpdateLayer(selectedLayer.id, { x: newX, y: newY, width: newW, height: newH });
      } else if (dragAction === 'rotate') {
        const originX = dragStart.layerX + dragStart.layerW / 2;
        const originY = dragStart.layerY + dragStart.layerH / 2;
        const angle = Math.round((Math.atan2(curY - originY, curX - originX) * 180) / Math.PI + 90);
        onUpdateLayer(selectedLayer.id, { rotation: (angle + 360) % 360 });
      }
    };

    const handleMouseUp = () => {
      setDragAction(null);
      setDragStart(null);
      setSnapLines({});
      onPushHistory();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragAction, dragStart, selectedLayer, getCanvasCoords, W, H, onUpdateLayer, onPushHistory]);

  // Display size scaled by current zoom level
  const baseScale = 0.44;
  const displayW = Math.round(W * baseScale * (zoom / 100));
  const displayH = Math.round(H * baseScale * (zoom / 100));

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
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        overflow: 'auto',
        position: 'relative',
        padding: '2rem',
        userSelect: 'none'
      }}
    >
      <div
        className="studio-canvas-container"
        style={{
          width: `${displayW}px`,
          height: `${displayH}px`,
          position: 'relative',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12)',
          borderRadius: '4px',
          overflow: 'visible'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onMouseDown={handleCanvasMouseDown}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            cursor: dragAction === 'move' ? 'grabbing' : 'default',
            borderRadius: '4px'
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
              boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
              pointerEvents: 'none'
            }}
          >
            {/* Top Rotation Handle */}
            <div
              onMouseDown={(e) => handleHandleMouseDown(e, 'rotate')}
              style={{
                position: 'absolute',
                top: '-26px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '14px',
                height: '14px',
                backgroundColor: '#38bdf8',
                borderRadius: '50%',
                border: '2px solid #ffffff',
                cursor: 'grab',
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
              }}
              title="Rotate"
            />

            {/* 4 Corner Resize Handles */}
            <div
              onMouseDown={(e) => handleHandleMouseDown(e, 'resize-nw')}
              style={{
                position: 'absolute',
                top: '-6px',
                left: '-6px',
                width: '12px',
                height: '12px',
                backgroundColor: '#ffffff',
                border: '2px solid #0284c7',
                borderRadius: '2px',
                cursor: 'nwse-resize',
                pointerEvents: 'auto'
              }}
            />
            <div
              onMouseDown={(e) => handleHandleMouseDown(e, 'resize-ne')}
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                width: '12px',
                height: '12px',
                backgroundColor: '#ffffff',
                border: '2px solid #0284c7',
                borderRadius: '2px',
                cursor: 'nesw-resize',
                pointerEvents: 'auto'
              }}
            />
            <div
              onMouseDown={(e) => handleHandleMouseDown(e, 'resize-sw')}
              style={{
                position: 'absolute',
                bottom: '-6px',
                left: '-6px',
                width: '12px',
                height: '12px',
                backgroundColor: '#ffffff',
                border: '2px solid #0284c7',
                borderRadius: '2px',
                cursor: 'nesw-resize',
                pointerEvents: 'auto'
              }}
            />
            <div
              onMouseDown={(e) => handleHandleMouseDown(e, 'resize-se')}
              style={{
                position: 'absolute',
                bottom: '-6px',
                right: '-6px',
                width: '12px',
                height: '12px',
                backgroundColor: '#ffffff',
                border: '2px solid #0284c7',
                borderRadius: '2px',
                cursor: 'nwse-resize',
                pointerEvents: 'auto'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
