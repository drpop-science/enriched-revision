# 3D Convection V9

V9 keeps the wide, shallow teaching view while restoring more convincing 3D depth and increasing particle density.

## V9 changes

- Maximum representative particles increased to **2,000**.
- Default representative particles increased to **1,200**.
- Tank z-depth increased from **1.18 to 1.55** simulation units so the liquid has visible front-to-back motion without returning to the very deep early builds.
- Particle z-motion increased accordingly to make the flow feel less flat.
- Heating power now defaults to **100%**.
- The heater's effective heating radius was tightened from the V8 broadened region to **0.94 × the visible heater radius**, with a modest vertical heating zone. This restores a more localised plume.
- Added a subtle **soft heat cone and radial glow** above the heater. This is a qualitative teaching cue only, not a vector field or quantitative field map; its intensity follows heater power and it follows the movable heater in real time.
- Reworked the side-wall boundary layer. Outward circulation close to a side wall is redirected downwards/inwards, and particles are turned before reaching the glass. This is intended to reduce the wall bunching seen when the heater is placed near an edge.
- Live particle counters have been **removed completely**.
- The two equal-volume wireframes remain as passive visual comparison guides. Particles move straight through them.
- The 4-step walkthrough remains, with the explanation card now positioned **inside the 3D viewing area** throughout the animated pans and zooms.

## Walkthrough sequence

1. Particles near the heater gain energy and their random motion becomes more vigorous.
2. The warmed liquid expands slightly; particles become more spread out, so an equal volume contains less mass and is less dense.
3. The warmer, less-dense liquid rises and transfers energy to its surroundings.
4. Away from the heater, particles move less vigorously and become more closely packed; the cooler, denser liquid sinks and returns underneath.

## Deployment

Place these files together in:

```text
applets/convection/
├── index.html
├── styles.css
└── script.js
```

`index.html` uses `?v=9` cache-busting on the CSS and JavaScript references.

Three.js is loaded from jsDelivr, so the simulation requires an internet connection when first loading the external module.
