import { StudioProject } from './types';
import { renderStudioCanvas } from './studioRenderer';

export type ExportFormat = 'png' | 'jpeg' | 'webp';
export type ExportScale = 1 | 2 | 3;

export async function exportStudioCanvasBlob(
  project: StudioProject,
  format: ExportFormat = 'png',
  scale: ExportScale = 1,
  quality: number = 0.95
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const targetW = project.canvas.width * scale;
  const targetH = project.canvas.height * scale;

  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d')!;
  ctx.save();
  ctx.scale(scale, scale);

  renderStudioCanvas(ctx, project, { isExport: true });
  ctx.restore();

  const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Export failed to generate image blob.'));
      },
      mimeType,
      quality
    );
  });
}

export async function downloadStudioDesign(
  project: StudioProject,
  refText: string,
  format: ExportFormat = 'png',
  scale: ExportScale = 1
): Promise<void> {
  const blob = await exportStudioCanvasBlob(project, format, scale);
  const cleanRef = (refText || 'Bible-Verse').replace(/[:\s]/g, '-').replace(/[^a-zA-Z0-9-_\u0B80-\u0BFF]/g, '');
  const filename = `${cleanRef}-${scale}x.${format === 'jpeg' ? 'jpg' : format}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function copyStudioDesignToClipboard(project: StudioProject): Promise<boolean> {
  try {
    const blob = await exportStudioCanvasBlob(project, 'png', 1);
    const cb = navigator.clipboard as any;
    if (cb && typeof (window as any).ClipboardItem !== 'undefined') {
      const item = new (window as any).ClipboardItem({ 'image/png': blob });
      await cb.write([item]);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
