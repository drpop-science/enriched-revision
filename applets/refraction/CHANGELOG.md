# Changelog

## V1.0.0 — Initial build

- Added responsive Dr Pop's Enriched Revision UI.
- Added genuine Three.js 3D scene with orbit/touch controls and a front teaching view.
- Added fixed-frequency wavefront source.
- Added normal incidence, lower-n → higher-n, higher-n → lower-n, critical-angle and TIR presets.
- Added live frequency, wave-speed, wavelength and direction readouts.
- Added medium swapping and Air/Water/Glass/Diamond presets.
- Added wavefront, teaching-marker, ray, normal, angle and wavelength-guide overlays.
- Added Explore, Guided and Test Me modes.
- Added visible CDN-loading failure state.
- Added CAIE-oriented equation presentation without displaying `n1 sin(theta1) = n2 sin(theta2)`.

### Physics/effect factors

This is the initial baseline, so all normalised factors are `1.00`.

- Refractive-index speed factor: **1.00 baseline** (`v ∝ 1/n`).
- Source-frequency factor: **1.00 baseline** (fixed; not student-adjustable).
- Wavefront visual spacing factor: **1.00 baseline** (derived from `v/f`).
- Ray-direction factor: **1.00 baseline** (derived from the refraction model; no visual exaggeration).

No physics effect is deliberately exaggerated in V1.0.0.

## V1.0.1 — Local/self-contained preview
- Changed Three.js loading from CDN/import-map to local `vendor/three.module.min.js`.
- Removed the external `OrbitControls` addon dependency.
- Added lightweight built-in mouse, touch, wheel and pinch camera controls.
- Added `prepare-self-contained.bat` to validate/copy the two-file Three.js vendor bundle from a sibling convection applet when available.
- Added `run-preview.bat` for Windows local HTTP preview.
- Updated cache-busting query strings to `v=1.0.1`.
- Underlying refraction/wavefront physics mechanism is unchanged from V1.0.0.
- Normalised physics/effect factors remain unchanged at 1.00.
