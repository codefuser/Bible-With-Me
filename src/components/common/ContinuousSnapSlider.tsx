import React, { useState, useRef, useEffect } from 'react';

export interface MagnetPoint {
  value: number;
  label: string;
  sublabel: string;
}

interface ContinuousSnapSliderProps {
  title: string;
  min: number;
  max: number;
  step: number;
  value: number;
  magnetPoints: MagnetPoint[];
  unit?: string;
  formatValue?: (val: number) => string;
  cssProperty: '--custom-font-size' | '--custom-line-height' | '--custom-max-width';
  onChange: (value: number) => void;
  onDragStateChange?: (isDragging: boolean, activeValue: number) => void;
}

export const ContinuousSnapSlider: React.FC<ContinuousSnapSliderProps> = ({
  title,
  min,
  max,
  step,
  value,
  magnetPoints,
  unit = '',
  formatValue,
  cssProperty,
  onChange,
  onDragStateChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentVal, setCurrentVal] = useState<number>(value);

  useEffect(() => {
    setCurrentVal(value);
  }, [value]);

  const getPercent = (v: number) => {
    if (max <= min) return 0;
    return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  };

  const handlePointerAction = (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = rect.width > 0 ? relativeX / rect.width : 0;

    let rawVal = min + ratio * (max - min);
    const stepsCount = Math.round((rawVal - min) / step);
    let steppedVal = min + stepsCount * step;

    // Magnetic Haptic Snap check
    const magnetRange = (max - min) * 0.045;
    for (const point of magnetPoints) {
      if (Math.abs(steppedVal - point.value) <= magnetRange) {
        steppedVal = point.value; // Snap like a magnet!
        break;
      }
    }

    const finalVal = Math.max(min, Math.min(max, Number(steppedVal.toFixed(2))));
    setCurrentVal(finalVal);

    // Apply Live Preview instantly to background Bible text!
    document.documentElement.style.setProperty(
      cssProperty,
      cssProperty === '--custom-line-height' ? `${finalVal}` : `${finalVal}px`
    );

    if (onDragStateChange) {
      onDragStateChange(true, finalVal);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointerAction(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      handlePointerAction(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}

      onChange(currentVal);
      if (onDragStateChange) {
        onDragStateChange(false, currentVal);
      }
    }
  };

  const activePercent = getPercent(currentVal);
  const matchedMagnet = magnetPoints.find((p) => Math.abs(p.value - currentVal) < 0.01);
  const displayLabel = formatValue ? formatValue(currentVal) : `${currentVal}${unit}`;

  return (
    <div style={{ marginBottom: '1.375rem' }}>
      {/* Title Header with Active Value Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
        <span
          style={{
            fontWeight: 700,
            color: 'var(--accent-color)',
            backgroundColor: 'var(--accent-soft)',
            padding: '0.1875rem 0.625rem',
            borderRadius: '9999px',
            fontSize: '0.78125rem',
            boxShadow: matchedMagnet ? '0 0 0 2px var(--accent-color)' : 'none',
            transition: 'box-shadow 150ms ease'
          }}
        >
          {matchedMagnet ? `${matchedMagnet.label} (${matchedMagnet.sublabel})` : displayLabel}
        </span>
      </div>

      {/* Interactive Slider Outer Track Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
          padding: '0 11px'
        }}
      >
        {/* Inner Track Wrapper */}
        <div style={{ position: 'relative', width: '100%', height: '6px', display: 'flex', alignItems: 'center' }}>
          {/* Background Track Line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '6px',
              backgroundColor: 'var(--border-color)',
              borderRadius: '9999px'
            }}
          />

          {/* Active Filled Track Line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: `${activePercent}%`,
              height: '6px',
              backgroundColor: 'var(--accent-color)',
              borderRadius: '9999px',
              transition: isDragging ? 'none' : 'width 180ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />

          {/* Magnet Benchmark Snap Points */}
          {magnetPoints.map((mp, idx) => {
            const pct = getPercent(mp.value);
            const isPassed = mp.value <= currentVal;
            const isExactMatch = Math.abs(mp.value - currentVal) < 0.01;
            return (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentVal(mp.value);
                  document.documentElement.style.setProperty(
                    cssProperty,
                    cssProperty === '--custom-line-height' ? `${mp.value}` : `${mp.value}px`
                  );
                  onChange(mp.value);
                }}
                style={{
                  position: 'absolute',
                  left: `${pct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isExactMatch ? '14px' : '10px',
                  height: isExactMatch ? '14px' : '10px',
                  borderRadius: '50%',
                  backgroundColor: isPassed ? 'var(--accent-color)' : 'var(--bg-surface)',
                  border: isPassed ? '2px solid var(--accent-color)' : '2px solid var(--border-color)',
                  zIndex: 10,
                  transition: 'all 150ms ease',
                  boxShadow: isExactMatch ? '0 0 8px var(--accent-color)' : 'none'
                }}
              />
            );
          })}

          {/* Floating Draggable Thumb Knob */}
          <div
            style={{
              position: 'absolute',
              left: `${activePercent}%`,
              top: '50%',
              transform: isDragging ? 'translate(-50%, -50%) scale(1.18)' : 'translate(-50%, -50%) scale(1)',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-color)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              border: '2px solid #ffffff',
              zIndex: 20,
              transition: isDragging ? 'none' : 'left 180ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms ease',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          />
        </div>
      </div>

      {/* Clean Non-Overlapping Benchmark Sublabel Ticks */}
      <div style={{ position: 'relative', height: '18px', marginTop: '0.375rem', padding: '0 11px' }}>
        {magnetPoints.map((mp, idx) => {
          const pct = getPercent(mp.value);
          const isSelected = Math.abs(mp.value - currentVal) < 0.01;
          const total = magnetPoints.length;
          return (
            <div
              key={idx}
              onClick={() => {
                setCurrentVal(mp.value);
                document.documentElement.style.setProperty(
                  cssProperty,
                  cssProperty === '--custom-line-height' ? `${mp.value}` : `${mp.value}px`
                );
                onChange(mp.value);
              }}
              style={{
                position: 'absolute',
                left: `${pct}%`,
                transform: idx === 0 ? 'translateX(0%)' : idx === total - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                textAlign: idx === 0 ? 'left' : idx === total - 1 ? 'right' : 'center',
                fontSize: '0.75rem',
                color: isSelected ? 'var(--accent-color)' : 'var(--text-muted)',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 150ms ease'
              }}
            >
              <span>{mp.sublabel || mp.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
