# 3D Convection V13

V13 keeps the V12 UI, Three.js scene, solved flow arrows, fluorescent-green traces,
movable heater, heat glow and manual walkthrough. The main change is the
representative-particle transport/packing layer.

## What changed

- Replaced V12's hydrostatic settling + custom continuity correction + wide soft wall
  repulsion with a **volume-normalised particle packing system** based on the supplied
  comparison build.
- Preferred rest separation is recalculated from:
  **liquid volume / current particle count**.
  This makes the packing scale automatically if either tank dimensions or the particle
  count are changed later.
- Initial positions now use a 3-D low-discrepancy fill, so every part of the water
  volume is represented from the first frame instead of leaving randomly omitted
  lattice cells.
- Short-range interactions are position-only and cannot inject kinetic energy.
- Warm particles have a modestly larger preferred rest spacing, but the expansion
  effect is intentionally lower than the comparison build so it does not choke the
  plume.
- Microscopic motion now uses a Langevin / Ornstein-Uhlenbeck process whose RMS speed
  rises with temperature.
- Removed the V12 hydrostatic gravity patch.
- Removed the wide side-wall stand-off layer. Only a tiny numerical wall inset remains,
  so particles can visually fill the tank right up to the glass.
- The solved 2-D temperature and velocity fields are now applied uniformly through the
  z-depth, while random z-motion preserves parallax.
- The free surface is mostly containing, but very hot plume particles can still protrude
  slightly to preserve the subtle bubbling effect.
- Particle radius remains the Dr Pop build's small **0.064 scene units**.
- Default particle count is now **1800**; maximum is **2200**.

## Normalised particle-system factors

Here **1.00 means the supplied Claude particle-system value**.

| Effect | Factor | V13 intent |
|---|---:|---|
| volumeNormalisedPacking | 1.00 | Use the full volume/count normalisation |
| restSeparation | 0.96 | Slightly looser than the reference packing |
| thermalSpacing | 0.67 | Less exaggerated warm-particle separation |
| packingRelaxation | 0.82 | Softer per-pass position correction |
| langevinMotion | 0.88 | Slightly calmer microscopic jitter |
| wallStandOff | 0.12 | Almost remove the visible wall exclusion gap |
| hydrostaticPackingBias | 0.00 | V12 gravity-like bias disabled |
| customContinuityEqualisation | 0.00 | V12 coarse continuity patch disabled |

V12 visual-overlay factors are retained:

| Visual effect | Factor |
|---|---:|
| backdropContrast | 1.18 |
| arrowThickness | 1.35 |
| arrowOpacity | 1.30 |
| arrowSaturation | 1.22 |
| arrowGlow | 1.18 |
| traceVisibility | 1.55 |

## Deployment

```text
applets/convection/
├── index.html
├── styles.css
└── script.js
```

`index.html` uses `?v=13` cache-busting.
