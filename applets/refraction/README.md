# Refraction 3D — V1.0.0

A static, browser-based teaching applet for Dr Pop's Enriched Revision.

## Deployment

Upload this folder unchanged to a GitHub Pages repository, for example:

```
applets/
  refraction-3d/
    index.html
    styles.css
    script.js
```

The applet uses a version-pinned Three.js 0.160.0 module from jsDelivr. If that module cannot load, the applet shows a visible loading error rather than a blank stage.

## Physics model

- Source frequency is fixed.
- Model wave speed is proportional to `1 / n`.
- Wavelength follows from `v = f λ`, so frequency remains unchanged across the interface while wavelength changes with speed.
- Refraction direction is calculated internally from the refractive indices so that the rendered wavefront direction is physically correct.
- The UI deliberately does **not** display the two-medium `n1 sin(theta1) = n2 sin(theta2)` form.
- The displayed CAIE-oriented relationships are `n = c / v`, the air-to-material `n = sin i / sin r`, and (for material-to-air) `n = 1 / sin c`.
- At normal incidence, the ray direction remains unchanged while wave speed and wavelength change.
- For higher-n to lower-n incidence, the critical angle is calculated and TIR is shown when the incidence angle exceeds it.

## Teaching overlays

Wavefront markers are visual teaching markers on a phase front. They are not photons or particles.

## Notes on the 3D visualisation

The steady wavefront sheets are generated from phase geometry and clipped at the interface. Their spacing changes because wave speed changes while the emission frequency stays fixed. A faint reflected wave is shown for higher-n to lower-n subcritical incidence as an optional realism cue; TIR uses the reflected branch only.

## Local preview / self-contained build (V1.0.1)

This version expects the same two-file Three.js vendor bundle used by the convection applet:

```text
vendor/
├── three.module.min.js
└── three.core.min.js
```

If the refraction and convection applets are sibling folders, `prepare-self-contained.bat` will attempt to copy those two files automatically. Otherwise, copy the existing `vendor/` folder manually into the refraction applet folder.

Then run:

1. `prepare-self-contained.bat`
2. Check that both vendor files are present.
3. `run-preview.bat`

Do not open `index.html` directly from `file:///`; the ES module should be served over local HTTP. `run-preview.bat` starts a Python HTTP server at `http://127.0.0.1:8000/`.
