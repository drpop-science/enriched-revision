# 3D Convection V14

V14 deliberately keeps the V13 convection mechanism unchanged. It is a geometry,
contrast and loading-resilience revision.

## Flow mechanism: unchanged

The following V13 mechanisms and coefficients are retained:
- solved 2-D Boussinesq-style velocity/temperature field
- buoyancy
- cooling
- pressure projection
- vorticity confinement
- volume-normalised particle packing
- temperature-dependent rest spacing
- Langevin microscopic motion
- particle-to-solved-flow coupling

## V14 changes

- **Pool width reduced by 10%:** 9.20 → 8.28 scene units.
- Pool height and z-depth are unchanged.
- Heater travel range is also reduced by 10% so the heater keeps the same
  relative clearance from the side walls.
- Added a **dark grey backing panel** behind the tank. The page UI itself remains light.
- Glass edges are slightly lighter so the tank stays readable against the darker backing.
- The initial low-discrepancy particle fill now uses two packing warm-up sweeps
  instead of four. This reduces startup work but does not alter the steady-state
  packing or flow.
- Removed the separate external OrbitControls dependency. V14 includes a small local
  orbit controller for drag/touch rotation and wheel/pinch zoom.
- Three.js itself is loaded with automatic fallback across three version-pinned CDN
  sources. A visible loading/error card is shown rather than leaving a blank applet
  if all sources fail.

## Normalised V14 factors

Here **1.00 = V13** for the new V14 factors.

| Effect | Factor |
|---|---:|
| poolWidth | 0.90 |
| heaterTravel | 0.90 |
| startupPackingPasses | 0.50 |
| flow mechanism / coefficients | 1.00 |

All V13 particle-system and overlay factors are otherwise retained.

## Deployment

Upload the files together:

```text
applets/convection/
├── index.html
├── styles.css
└── script.js
```

No new library files are required. `index.html` uses `?v=14` cache-busting.
