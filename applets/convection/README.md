# 3D Convection V15

V15 is a presentation and camera-control revision of V14.2. The fluid solver, heating, packing, particle dynamics and flow mechanism are unchanged.

## Changes

- Entire 3-D canvas is now **dark charcoal grey**. The separate rear backing panel has been removed.
- App shell/control panels remain light and unchanged.
- Camera rotation sensitivity reduced substantially.
- Wheel/pinch zoom sensitivity reduced and individual gesture changes are capped.
- Damping increased so camera motion stops quickly after input.
- Solved flow arrows changed from cyan/teal to **magenta/violet** so they are distinct from blue particles, fluorescent-green traces and orange heat.
- Flow-arrow direction remains sampled directly from the solved velocity field.
- Arrow display length now receives a gradual visual boost farther from the heater/plume so the slower side return flow is easier to see.
- Far-field arrow visibility threshold is slightly lower, but arrows are still hidden when the solved speed is essentially negligible.

## Normalised V15 factors

Here 1.00 = V14.2 for the new presentation factors.

| Effect | Factor |
|---|---:|
| cameraRotateSensitivity | 0.39 |
| cameraZoomSensitivity | 0.38 |
| cameraDamping | 2.67 |
| farFlowArrowLength | 1.55 |
| solved flow mechanism | 1.00 |
| particle packing | 1.00 |
| heating / buoyancy / cooling | 1.00 |

## Deployment

Replace the normal three applet files:

```text
applets/convection/
├── index.html
├── styles.css
└── script.js
```

`index.html` uses `?v=15` cache-busting.
