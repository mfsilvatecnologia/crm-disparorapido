/**
 * Device ID and Fingerprinting Utilities
 * Implements device identification and fingerprinting for session management
 */

import type { BrowserInfo, HardwareInfo } from '../types';

const DEVICE_ID_KEY = 'leadsrapido_device_id';

/**
 * Get or create device ID from localStorage
 * Returns a persistent UUID for this device/browser
 */
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Clear device ID from localStorage
 *
 * WARNING: This should RARELY be used!
 * Only use this for complete device reset in security-critical situations.
 *
 * DO NOT call this during normal logout, as device_id must persist
 * across logins to properly track device sessions in the backend.
 *
 * Valid use cases:
 * - User explicitly requests to "forget this device"
 * - Security incident requiring complete session reset
 * - Testing/development purposes
 */
export function clearDeviceId(): void {
  localStorage.removeItem(DEVICE_ID_KEY);
}

/**
 * Clear all device data from localStorage
 *
 * WARNING: This should RARELY be used!
 * Only use this for complete device reset in security-critical situations.
 *
 * DO NOT call this during normal logout, as device_id must persist
 * across logins to properly track device sessions in the backend.
 *
 * This is an alias for clearDeviceId() for backward compatibility.
 */
export function clearDeviceData(): void {
  clearDeviceId();
}

/**
 * Collect browser information for fingerprinting
 */
export function collectBrowserInfo(): BrowserInfo {
  return {
    user_agent: navigator.userAgent,
    language: navigator.language,
    languages: Array.from(navigator.languages || [navigator.language]),
    platform: navigator.platform,
    vendor: navigator.vendor || 'unknown'
  };
}

/**
 * Collect hardware information for fingerprinting
 */
export function collectHardwareInfo(): HardwareInfo {
  const screen = window.screen;

  return {
    hardware_concurrency: navigator.hardwareConcurrency || 0,
    device_memory: (navigator as any).deviceMemory,
    screen_resolution: `${screen.width}x${screen.height}`,
    screen_color_depth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezone_offset: new Date().getTimezoneOffset()
  };
}

/**
 * Generate canvas fingerprint
 * Returns a hash based on canvas rendering differences
 */
function generateCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return 'no-canvas';

    canvas.width = 200;
    canvas.height = 50;

    // Draw text with different fonts and styles
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('LeadsRapido 🚀', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('LeadsRapido 🚀', 4, 17);

    return canvas.toDataURL();
  } catch (e) {
    return 'canvas-error';
  }
}

/**
 * Get WebGL vendor information
 */
function getWebGLVendor(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) return 'no-webgl';

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      return (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    }

    return 'no-debug-info';
  } catch (e) {
    return 'webgl-error';
  }
}

/**
 * Simple hash function for fingerprint generation
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 16);
}

/**
 * Generate device fingerprint using multiple components
 * Format: fp_{clientType}_{hash}
 */
export async function generateDeviceFingerprint(
  clientType: 'web' | 'extension' = 'web'
): Promise<string> {
  const browserInfo = collectBrowserInfo();
  const hardwareInfo = collectHardwareInfo();
  const canvasFingerprint = generateCanvasFingerprint();
  const webglVendor = getWebGLVendor();

  // Combine all components
  const components = {
    userAgent: browserInfo.user_agent,
    language: browserInfo.language,
    platform: browserInfo.platform,
    hardwareConcurrency: hardwareInfo.hardware_concurrency,
    deviceMemory: hardwareInfo.device_memory,
    screenResolution: hardwareInfo.screen_resolution,
    colorDepth: hardwareInfo.screen_color_depth,
    timezone: hardwareInfo.timezone,
    canvas: canvasFingerprint,
    webgl: webglVendor
  };

  const componentString = JSON.stringify(components);
  const hash = await hashString(componentString);

  return `fp_${clientType}_${hash}`;
}
