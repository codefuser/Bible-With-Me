/**
 * App Update Service
 * Handles non-blocking version checks, semantic version comparison,
 * and reliable offline-safe update prompting.
 */

import { APP_VERSION, UPDATE_MANIFEST_URL } from '../config/version';

export interface AppUpdateManifest {
  latestVersion: string;
  minVersion: string;
  releaseDate: string;
  downloadUrl: string;
  changelog?: {
    ta?: string[];
    en?: string[];
  };
}

export interface AppUpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
  changelog: string[];
}

const UPDATE_DISMISSED_KEY = 'bible_app_update_dismissed';

/**
 * Compare two semantic version strings.
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 * Correctly evaluates 1.10.0 > 1.9.0
 */
export function compareVersions(v1: string, v2: string): number {
  const clean1 = (v1 || '').trim().replace(/^v/i, '');
  const clean2 = (v2 || '').trim().replace(/^v/i, '');

  const parts1 = clean1.split('.').map((p) => parseInt(p, 10) || 0);
  const parts2 = clean2.split('.').map((p) => parseInt(p, 10) || 0);

  const maxLen = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLen; i++) {
    const val1 = parts1[i] !== undefined ? parts1[i] : 0;
    const val2 = parts2[i] !== undefined ? parts2[i] : 0;
    if (val1 > val2) return 1;
    if (val1 < val2) return -1;
  }
  return 0;
}

/**
 * Check whether a newer version is available.
 * Fully non-blocking, offline-safe, and does not show error popups if offline.
 */
export async function checkForAppUpdate(appLang: 'ta' | 'en' = 'ta'): Promise<AppUpdateInfo | null> {
  // If user is offline, skip check silently
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return null;
  }

  // If user already dismissed the prompt in this session, don't nag
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(UPDATE_DISMISSED_KEY) === 'true') {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(UPDATE_MANIFEST_URL, {
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data: AppUpdateManifest = await res.json();
    if (!data || !data.latestVersion) return null;

    const isNewer = compareVersions(data.latestVersion, APP_VERSION) > 0;
    if (!isNewer) return null;

    const logs = data.changelog
      ? (appLang === 'ta' ? data.changelog.ta : data.changelog.en) || data.changelog.ta || []
      : [];

    return {
      hasUpdate: true,
      currentVersion: APP_VERSION,
      latestVersion: data.latestVersion,
      downloadUrl: data.downloadUrl || 'https://github.com/codefuser/Bible-With-Me/releases/latest',
      changelog: logs
    };
  } catch {
    // Fail silently without blocking startup or showing errors
    return null;
  }
}

/**
 * Dismiss the current update prompt for the session.
 */
export function dismissUpdateForSession(): void {
  try {
    sessionStorage.setItem(UPDATE_DISMISSED_KEY, 'true');
  } catch {
    // ignore
  }
}

/**
 * Open the download URL in system browser
 */
export function triggerUpdateDownload(downloadUrl: string): void {
  try {
    window.open(downloadUrl, '_system');
  } catch {
    window.location.href = downloadUrl;
  }
}
