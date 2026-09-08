# 3D Convection V12

V12 is a readability-and-packing refinement of V11. The solved x-y Boussinesq-style flow, the movable heater, the 4-step manual walkthrough and the overall UI are retained.

## What changed from V11

- Added a **soft light backdrop panel behind the tank** to improve contrast without changing the overall bright UI.
- Rebuilt the **solved flow arrows** as mesh arrows rather than thin line helpers, so the shafts can be thicker and more visible.
- Flow arrows now use a **more saturated cyan/teal palette**, higher opacity and a subtle additive glow.
- **Trace 6 particles** now uses fluorescent green ring markers and fluorescent green trails, with a longer trail history.
- Reduced the soft wall stand-off distance slightly so representative particles can sit closer to the glass.
- Added a **very gentle hydrostatic packing bias**: cooler particles are encouraged slightly lower down than warmer ones.
- Strengthened the **continuity / density equalisation** a little so the liquid continues to fill the full visible volume and is less likely to show obvious edge or corner gaps.
- Initial stratified fill is slightly more even.

## Normalised tweak factors

All factors are reported relative to a baseline of **1.00**. Values above 1 increase the effect; values below 1 decrease it.

| Effect | Factor | Meaning |
|---|---:|---|
| backdropContrast | 1.18 | Slightly stronger light panel behind the tank |
| wallStandOff | 0.84 | Particles may approach the walls more closely than in V11 |
| continuityEqualisation | 1.18 | Slightly stronger local gap-filling / continuity correction |
| hydrostaticPackingBias | 1.20 | Slightly stronger lower-down packing / settling bias |
| arrowThickness | 1.35 | Thicker solved-flow arrow shafts and heads |
| arrowOpacity | 1.30 | Higher arrow visibility |
| arrowSaturation | 1.22 | More saturated arrow colouring |
| arrowGlow | 1.18 | Slight additive glow around solved-flow arrows |
| traceVisibility | 1.55 | Brighter and more visible traced particles/trails |

## Deployment

Place these files together in:

```text
applets/convection/
├── index.html
├── styles.css
└── script.js
```

`index.html` uses `?v=12` cache-busting on the CSS and JavaScript references.
