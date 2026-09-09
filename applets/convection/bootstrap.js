// V15.5.6 bootstrap — local-only runtime.
const notice = document.querySelector('#loadNotice');
const debugPanel = document.querySelector('#debugPanel');
const debugEnabled = new URLSearchParams(location.search).get('debug') === '1';
const startedAt = performance.now();

function memoryText() {
  const parts = [];
  if (navigator.deviceMemory) parts.push(`${navigator.deviceMemory} GB device memory`);
  if (navigator.hardwareConcurrency) parts.push(`${navigator.hardwareConcurrency} logical cores`);
  if (performance.memory?.usedJSHeapSize) {
    parts.push(`${Math.round(performance.memory.usedJSHeapSize / 1048576)} MB JS heap`);
  }
  return parts.join(' · ') || 'Memory information unavailable';
}

function updateDebug(stageName, detail = '') {
  if (!debugEnabled || !debugPanel) return;
  debugPanel.hidden = false;
  const elapsed = ((performance.now() - startedAt) / 1000).toFixed(2);
  debugPanel.innerHTML = `
    <strong>V15.5.6 diagnostics</strong>
    <span><b>Stage:</b> ${stageName}</span>
    <span><b>Elapsed:</b> ${elapsed} s</span>
    <span><b>Device:</b> ${memoryText()}</span>
    <span><b>Browser:</b> ${navigator.userAgent}</span>
    ${detail ? `<span><b>Detail:</b> ${detail}</span>` : ''}
  `;
}

function stage(title, detail = '') {
  if (notice) {
    notice.hidden = false;
    notice.classList.remove('load-error');
    notice.innerHTML = `<strong>${title}</strong><span>${detail}</span>`;
  }
  updateDebug(title, detail);
}

function setRenderer(renderer) {
  if (!debugEnabled || !renderer) return;
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    updateDebug('WebGL renderer created', `GPU: ${gpu}`);
  } catch {
    updateDebug('WebGL renderer created', 'GPU details unavailable');
  }
}

function fail(title, error) {
  const message = error?.message || String(error || 'Unknown error');
  if (notice) {
    notice.hidden = false;
    notice.classList.add('load-error');
    notice.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  }
  updateDebug(title, message);
}

function ready() {
  updateDebug('Ready', 'All runtime assets loaded from the local applet folder.');
  if (notice) {
    notice.hidden = true;
    notice.textContent = '';
  }
}

window.__APP_STARTUP__ = { stage, setRenderer, fail, ready };

async function localAssetExists(path) {
  try {
    const response = await fetch(path, {
      method: 'HEAD',
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
}

const THREE_MODULE = './vendor/three.module.min.js';
const THREE_CORE = './vendor/three.core.min.js';

stage('Checking local 3D engine…', 'Verifying the complete Three.js bundle.');

const [moduleExists, coreExists] = await Promise.all([
  localAssetExists(THREE_MODULE),
  localAssetExists(THREE_CORE),
]);

if (!moduleExists || !coreExists) {
  const missing = [];
  if (!moduleExists) missing.push('three.module.min.js');
  if (!coreExists) missing.push('three.core.min.js');

  fail(
    'Local Three.js bundle is incomplete.',
    new Error(`Missing: ${missing.join(', ')}. Run prepare-self-contained.bat once.`)
  );
} else {
  try {
    stage('Loading local 3D engine…', 'Both Three.js files are present.');
    window.__THREE__ = await import(THREE_MODULE);
    stage('3D engine loaded locally.', 'Starting the convection simulation.');
    await import('./script.js?v=15.5.6');
  } catch (error) {
    console.error('V15.5.6 bootstrap failed:', error);
    fail('3D simulation could not load.', error);
  }
}
