import {
  StudioProject,
  StudioLayer,
  TextLayer,
  ImageLayer,
  ShapeLayer,
  ElementLayer
} from './types';

// Cache for loaded images so redraws don't reload or flicker
const imageCache: Record<string, HTMLImageElement> = {};

export function preloadStudioImage(src: string): Promise<HTMLImageElement> {
  if (imageCache[src] && imageCache[src].complete) {
    return Promise.resolve(imageCache[src]);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    let cur = '';
    for (const word of para.split(' ')) {
      const test = cur ? `${cur} ${word}` : word;
      if (ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = word;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

export function renderStudioCanvas(
  ctx: CanvasRenderingContext2D,
  project: StudioProject,
  options?: {
    isExport?: boolean;
    scale?: number;
    showGuides?: boolean;
    showSafeArea?: boolean;
    activeSnapLines?: { x?: number; y?: number };
    selectedLayerId?: string | null;
  }
) {
  const { width: W, height: H } = project.canvas;
  const isExport = !!options?.isExport;

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  // ── 1. BACKGROUND ──
  const bg = project.background;
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.solidColor || '#0f172a';
    ctx.fillRect(0, 0, W, H);
  } else if (bg.type === 'gradient') {
    let grad: CanvasGradient;
    if (bg.gradientType === 'radial') {
      grad = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, Math.max(W, H) * 0.75);
    } else {
      const angleRad = ((bg.gradientAngle || 135) * Math.PI) / 180;
      const x1 = W / 2 - Math.cos(angleRad) * (W / 2);
      const y1 = H / 2 - Math.sin(angleRad) * (H / 2);
      const x2 = W / 2 + Math.cos(angleRad) * (W / 2);
      const y2 = H / 2 + Math.sin(angleRad) * (H / 2);
      grad = ctx.createLinearGradient(x1, y1, x2, y2);
    }
    if (bg.gradientStops && bg.gradientStops.length > 0) {
      bg.gradientStops.forEach((stop) => grad.addColorStop(stop.offset, stop.color));
    } else {
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // ── 1b. WALLPAPER IMAGE BACKGROUND (IF SET) ──
  if (bg.imageSrc) {
    const bgImg = imageCache[bg.imageSrc];
    if (bgImg && bgImg.complete) {
      ctx.save();
      // Apply image filters
      const filterParts: string[] = [];
      if (bg.imageBrightness !== 100) filterParts.push(`brightness(${bg.imageBrightness}%)`);
      if (bg.imageContrast !== 100) filterParts.push(`contrast(${bg.imageContrast}%)`);
      if (bg.imageSaturation !== 100) filterParts.push(`saturate(${bg.imageSaturation}%)`);
      if (bg.imageBlur > 0) filterParts.push(`blur(${bg.imageBlur}px)`);
      if (filterParts.length > 0) ctx.filter = filterParts.join(' ');

      // Cover scaling
      const imgAspect = bgImg.width / bgImg.height;
      const canvasAspect = W / H;
      let sx = 0, sy = 0, sw = bgImg.width, sh = bgImg.height;
      if (imgAspect > canvasAspect) {
        sw = bgImg.height * canvasAspect;
        sx = (bgImg.width - sw) / 2;
      } else {
        sh = bgImg.width / canvasAspect;
        sy = (bgImg.height - sh) / 2;
      }
      ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, W, H);
      ctx.restore();
    }
  }

  // ── 1c. BACKGROUND OVERLAY & VIGNETTE ──
  if (bg.overlayOpacity > 0 && bg.overlayColor) {
    ctx.save();
    ctx.fillStyle = bg.overlayColor;
    ctx.globalAlpha = bg.overlayOpacity;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  if (bg.vignette > 0) {
    ctx.save();
    const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, `rgba(0,0,0,${bg.vignette / 100})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  if (bg.grain) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.028;
    for (let i = 0; i < W * H * 0.0003; i++) {
      ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
    }
    ctx.restore();
  }

  // ── 2. GLOBAL EFFECTS (FROSTED GLASS BACKDROP / BORDER) ──
  if (project.effects.cinematicBorder) {
    ctx.save();
    const pad = Math.max(16, W * 0.035);
    ctx.strokeStyle = project.effects.borderColor || '#fbbf24';
    ctx.lineWidth = project.effects.borderWidth || 2;
    ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);
    ctx.restore();
  }

  // ── 3. RENDER LAYERS SORTED BY Z-INDEX ──
  const sortedLayers = [...project.layers]
    .filter((l) => l.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  for (const layer of sortedLayers) {
    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;

    // Translation & Rotation Origin
    const centerX = layer.x + layer.width / 2;
    const centerY = layer.y + layer.height / 2;
    ctx.translate(centerX, centerY);
    if (layer.rotation) {
      ctx.rotate((layer.rotation * Math.PI) / 180);
    }
    ctx.translate(-centerX, -centerY);

    switch (layer.type) {
      case 'shape':
        renderShapeLayer(ctx, layer);
        break;
      case 'element':
        renderElementLayer(ctx, layer);
        break;
      case 'image':
        renderImageLayer(ctx, layer);
        break;
      case 'text':
        renderTextLayer(ctx, layer);
        break;
    }
    ctx.restore();
  }

  // ── 4. WATERMARK / BRANDING ──
  if (project.watermark && project.watermark.enabled && project.watermark.text) {
    ctx.save();
    ctx.font = `600 ${Math.round(W * 0.016)}px 'Noto Sans Tamil', Inter, sans-serif`;
    ctx.fillStyle = project.watermark.color || '#ffffff';
    ctx.globalAlpha = project.watermark.opacity || 0.55;
    ctx.textAlign = 'center';
    ctx.fillText(project.watermark.text, W / 2, H - Math.max(20, H * 0.035));
    ctx.restore();
  }

  // ── 5. EDITOR GUIDES & SAFE AREAS (PREVIEW ONLY) ──
  if (!isExport) {
    if (options?.showSafeArea) {
      ctx.save();
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      const marginX = W * 0.08;
      const marginY = H * 0.08;
      ctx.strokeRect(marginX, marginY, W - marginX * 2, H - marginY * 2);

      ctx.fillStyle = 'rgba(234, 179, 8, 0.75)';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Safe Area', marginX + 8, marginY + 18);
      ctx.restore();
    }

    if (options?.activeSnapLines) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      if (options.activeSnapLines.x !== undefined) {
        ctx.beginPath();
        ctx.moveTo(options.activeSnapLines.x, 0);
        ctx.lineTo(options.activeSnapLines.x, H);
        ctx.stroke();
      }
      if (options.activeSnapLines.y !== undefined) {
        ctx.beginPath();
        ctx.moveTo(0, options.activeSnapLines.y);
        ctx.lineTo(W, options.activeSnapLines.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  ctx.restore();
}

function renderShapeLayer(ctx: CanvasRenderingContext2D, layer: ShapeLayer) {
  ctx.save();
  if (layer.shadowBlur > 0 && layer.shadowColor) {
    ctx.shadowColor = layer.shadowColor;
    ctx.shadowBlur = layer.shadowBlur;
  }

  ctx.fillStyle = layer.fillColor || 'transparent';
  ctx.strokeStyle = layer.borderColor || 'transparent';
  ctx.lineWidth = layer.borderWidth || 0;

  const { x, y, width: w, height: h } = layer;

  switch (layer.shapeType) {
    case 'rect':
      if (layer.fillColor && layer.fillColor !== 'transparent') ctx.fillRect(x, y, w, h);
      if (layer.borderWidth > 0) ctx.strokeRect(x, y, w, h);
      break;

    case 'rounded': {
      const r = Math.min(layer.borderRadius || 16, w / 2, h / 2);
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      if (layer.fillColor && layer.fillColor !== 'transparent') ctx.fill();
      if (layer.borderWidth > 0) ctx.stroke();
      break;
    }

    case 'circle':
    case 'ellipse':
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      if (layer.fillColor && layer.fillColor !== 'transparent') ctx.fill();
      if (layer.borderWidth > 0) ctx.stroke();
      break;

    case 'line':
      ctx.beginPath();
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.strokeStyle = layer.fillColor || layer.borderColor || '#ffffff';
      ctx.lineWidth = Math.max(2, layer.borderWidth || 2);
      ctx.stroke();
      break;

    case 'arch':
      ctx.beginPath();
      const r = w / 2;
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI, 0, false);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      if (layer.fillColor && layer.fillColor !== 'transparent') ctx.fill();
      if (layer.borderWidth > 0) ctx.stroke();
      break;
  }
  ctx.restore();
}

function renderElementLayer(ctx: CanvasRenderingContext2D, layer: ElementLayer) {
  ctx.save();
  if (layer.shadowBlur > 0 && layer.shadowColor) {
    ctx.shadowColor = layer.shadowColor;
    ctx.shadowBlur = layer.shadowBlur;
  }

  // Draw Path2D
  ctx.translate(layer.x, layer.y);
  const scaleX = layer.width / 24;
  const scaleY = layer.height / 24;
  ctx.scale(scaleX, scaleY);

  const p = new Path2D(layer.svgPath);
  ctx.fillStyle = layer.color || '#fbbf24';
  ctx.strokeStyle = layer.color || '#fbbf24';
  ctx.lineWidth = 1.2;
  ctx.fill(p);
  ctx.stroke(p);
  ctx.restore();
}

function renderImageLayer(ctx: CanvasRenderingContext2D, layer: ImageLayer) {
  const img = imageCache[layer.src];
  if (!img || !img.complete) return;

  ctx.save();
  const { x, y, width: w, height: h } = layer;

  // Masking path
  ctx.beginPath();
  if (layer.maskShape === 'circle') {
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.clip();
  } else if (layer.maskShape === 'rounded') {
    ctx.roundRect(x, y, w, h, layer.borderRadius || 16);
    ctx.clip();
  } else if (layer.maskShape === 'arch') {
    const r = w / 2;
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, 0, false);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.clip();
  }

  // Filters
  const filters: string[] = [];
  if (layer.brightness !== 100) filters.push(`brightness(${layer.brightness}%)`);
  if (layer.contrast !== 100) filters.push(`contrast(${layer.contrast}%)`);
  if (layer.saturation !== 100) filters.push(`saturate(${layer.saturation}%)`);
  if (layer.blur > 0) filters.push(`blur(${layer.blur}px)`);
  if (layer.sepia > 0) filters.push(`sepia(${layer.sepia}%)`);
  if (layer.grayscale) filters.push(`grayscale(100%)`);
  if (filters.length > 0) ctx.filter = filters.join(' ');

  // Flip
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(layer.flipH ? -1 : 1, layer.flipV ? -1 : 1);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();

  // Overlay color if any
  if (layer.overlayOpacity > 0 && layer.overlayColor) {
    ctx.fillStyle = layer.overlayColor;
    ctx.globalAlpha = layer.overlayOpacity;
    ctx.fillRect(x, y, w, h);
  }

  // Border & shadow
  if (layer.borderWidth > 0 && layer.borderColor) {
    ctx.strokeStyle = layer.borderColor;
    ctx.lineWidth = layer.borderWidth;
    if (layer.maskShape === 'circle') {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(x, y, w, h);
    }
  }

  ctx.restore();
}

function renderTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer) {
  ctx.save();
  const { x, y, width: w } = layer;

  // Font setup
  const fontStyle = layer.fontStyle || 'normal';
  const fontWeight = layer.fontWeight || 'normal';
  const fontSize = Math.max(12, layer.fontSize || 32);
  const fontFamily = layer.fontFamily || `'Noto Sans Tamil', sans-serif`;
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

  let processedText = layer.text || '';
  if (layer.textTransform === 'uppercase') processedText = processedText.toUpperCase();
  if (layer.textTransform === 'lowercase') processedText = processedText.toLowerCase();

  const lines = wrapText(ctx, processedText, w);
  const lineH = fontSize * (layer.lineHeight || 1.6);
  const totalTextH = lines.length * lineH;

  // Background Box / Highlight
  if (layer.hasBgBox && layer.bgBoxColor) {
    ctx.save();
    ctx.fillStyle = layer.bgBoxColor;
    const pad = layer.bgBoxPadding || 12;
    const rad = layer.bgBoxRadius || 8;
    ctx.beginPath();
    ctx.roundRect(x - pad, y - pad, w + pad * 2, totalTextH + pad * 2, rad);
    ctx.fill();
    ctx.restore();
  }

  // Text Shadow / Glow
  if (layer.shadowBlur > 0 && layer.shadowColor) {
    ctx.shadowColor = layer.shadowColor;
    ctx.shadowBlur = layer.shadowBlur;
    ctx.shadowOffsetX = layer.shadowOffsetX || 0;
    ctx.shadowOffsetY = layer.shadowOffsetY || 2;
  }

  ctx.textAlign = layer.textAlign || 'center';
  ctx.fillStyle = layer.textColor || '#ffffff';

  const textX =
    layer.textAlign === 'center'
      ? x + w / 2
      : layer.textAlign === 'right'
      ? x + w
      : x;

  lines.forEach((line, i) => {
    const textY = y + fontSize + i * lineH;
    // Stroke / Outline if enabled
    if (layer.strokeWidth > 0 && layer.strokeColor) {
      ctx.save();
      ctx.strokeStyle = layer.strokeColor;
      ctx.lineWidth = layer.strokeWidth;
      ctx.strokeText(line, textX, textY);
      ctx.restore();
    }
    ctx.fillText(line, textX, textY);
  });

  ctx.restore();
}
