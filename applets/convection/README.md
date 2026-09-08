# 3D Convection V14.2

V14.2 fixes the startup crash visible in the browser console. **No simulation physics or geometry changes have been made from V14/V14.1.**

## Root cause

V14 introduced the normalised `poolWidth` factor, but `TANK` used `EFFECT_FACTORS.poolWidth` before the `const EFFECT_FACTORS` declaration had executed. JavaScript therefore stopped immediately with:

```text
ReferenceError: Cannot access 'EFFECT_FACTORS' before initialization
```

The loading card remained visible because the particle/scene initialisation never began.

## Fixes

- Moved the entire `EFFECT_FACTORS` block **before** `TANK` and every other use of those factors.
- Changed the V14.1 parallel CDN race back to a **sequential fallback with an 8-second timeout per source**. A stalled CDN can no longer block forever, and only one Three.js instance should be imported, removing the duplicate-instance warnings.
- Kept the visible loading/error card.
- Kept the local lightweight orbit/touch controller.

## Unchanged

| Effect | V14.2 vs V14 |
|---|---:|
| pool width | 1.00 |
| heater travel | 1.00 |
| solved flow mechanism | 1.00 |
| volume-normalised packing | 1.00 |
| Langevin particle motion | 1.00 |
| flow arrows / traces | 1.00 |

The pool therefore remains **8.28 units wide** and all V13/V14 flow behaviour is preserved.

## Runtime dependency

V14.2 still loads **Three.js 0.185.1** from a version-pinned CDN, with timed fallbacks. For maximum school/iPad reliability, the next deployment hardening step should be to vendor `three.module.min.js` inside the GitHub repository and import it locally. That is a deployment-only change and does not require touching the physics.

## Deployment

Replace:

```text
applets/convection/
├── index.html
├── styles.css
└── script.js
```

`index.html` uses `?v=14.2` cache-busting.
