// ════════════════════════════════════════════════════════════════
// BIBLE VERSE CREATIVE STUDIO — TYPES & DATA MODELS
// ════════════════════════════════════════════════════════════════

export type CanvasRatioId = '1:1' | '4:5' | '9:16' | '16:9' | 'custom';

export interface CanvasSize {
  id: CanvasRatioId;
  name: string;
  nameTa: string;
  sub: string;
  width: number;
  height: number;
  icon: string;
}

export type LayerType = 'text' | 'image' | 'shape' | 'element';

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  x: number;          // Position relative to canvas coordinate space
  y: number;
  width: number;
  height: number;
  rotation: number;   // degrees 0-360
  opacity: number;    // 0 to 1
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  textColor: string;
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  // Effects
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  strokeColor: string;
  strokeWidth: number;
  // Background Box / Highlight
  hasBgBox: boolean;
  bgBoxColor: string;
  bgBoxPadding: number;
  bgBoxRadius: number;
  // Role tag for auto-composition
  role?: 'verse-ta' | 'verse-en' | 'reference' | 'tagline' | 'custom';
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  aspectRatio: number;
  // Transformations & Crop
  flipH: boolean;
  flipV: boolean;
  // Mask & Frame
  maskShape: 'rect' | 'rounded' | 'circle' | 'arch' | 'blob';
  borderRadius: number;
  // Image Filters
  brightness: number;  // 0 to 200 (100 normal)
  contrast: number;    // 0 to 200 (100 normal)
  saturation: number;  // 0 to 200 (100 normal)
  blur: number;        // 0 to 30px
  vignette: number;    // 0 to 100
  sepia: number;       // 0 to 100
  grayscale: boolean;
  // Overlay & Blend
  overlayColor: string;
  overlayOpacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'darken' | 'lighten';
  // Border & Shadow
  borderColor: string;
  borderWidth: number;
  shadowBlur: number;
  shadowColor: string;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: 'rect' | 'rounded' | 'circle' | 'ellipse' | 'line' | 'star' | 'heart' | 'arch' | 'cross';
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  shadowColor: string;
  shadowBlur: number;
}

export interface ElementLayer extends BaseLayer {
  type: 'element';
  elementId: string;
  svgPath: string;
  color: string;
  shadowColor: string;
  shadowBlur: number;
}

export type StudioLayer = TextLayer | ImageLayer | ShapeLayer | ElementLayer;

export type BackgroundType = 'solid' | 'gradient' | 'image';

export interface StudioBackground {
  type: BackgroundType;
  solidColor: string;
  gradientType: 'linear' | 'radial';
  gradientAngle: number;
  gradientStops: Array<{ offset: number; color: string }>;
  // Wallpaper image
  imageSrc?: string;
  imageFit?: 'cover' | 'contain';
  imageBrightness: number; // 0-200
  imageContrast: number;
  imageSaturation: number;
  imageBlur: number;
  // Overlays
  overlayColor: string;
  overlayOpacity: number;
  vignette: number;
  grain: boolean;
}

export interface StudioEffects {
  glassmorphism: boolean;
  frostedGlass: boolean;
  lightLeak: boolean;
  duotone: boolean;
  duotoneDark?: string;
  duotoneLight?: string;
  cinematicBorder: boolean;
  borderColor: string;
  borderWidth: number;
}

export interface StudioProject {
  id: string;
  version: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  canvas: {
    width: number;
    height: number;
    ratioId: CanvasRatioId;
  };
  background: StudioBackground;
  effects: StudioEffects;
  layers: StudioLayer[];
  watermark: {
    enabled: boolean;
    text: string;
    color: string;
    opacity: number;
  };
}

export interface StudioTemplate {
  id: string;
  name: string;
  nameTa: string;
  category: string;
  thumbnailGradient: string;
  canvasRatio: CanvasRatioId;
  background: StudioBackground;
  effects: StudioEffects;
  // Generator function that yields layers based on verse & reference
  createLayers: (
    verseTa: string,
    verseEn: string,
    reference: string,
    canvasW: number,
    canvasH: number
  ) => StudioLayer[];
}
