# 3D Convection Simulation — V3

A browser-based Three.js teaching simulation for Dr Pop's Enriched Revision.

## V3 improvements

- Replaced the wide rectangular heater with one small circular induction-style heating pad.
- Concentrated heating directly above the pad and substantially increased the thermal response.
- Rebuilt the bulk-flow model as a smooth closed convection cell: inward along the bottom, upward through the hot plume, outward near the free surface, and downward farther from the heater.
- Rebuilt the dense 3-D vector field from the same circulation model used to move the particles, so the arrows and particle drift agree.
- Particle motion now defaults to 1.0×, following classroom feedback.
- Removed the hard top-wall bounce. The liquid now has a soft free surface: particles can overshoot the surface locally and return smoothly, giving a bubbling/plume effect above the heater.
- Equal-volume samples are now empty wireframe cubes only.
- Sample counters now count the actual simulation particles currently inside each cube every animation frame. No synthetic dots or temperature-derived fake count is used.
- The warmer plume includes a small exaggerated thermal-expansion effect so its live particle number density tends to be lower than the relatively cooler comparison volume.
- Density readouts now report the live count, mean warmth of particles in the sample, and relative particle number density.

## Files

- `index.html` — interface and controls
- `styles.css` — responsive styling
- `script.js` — Three.js scene, particle model, collisions, heating, free-surface model, convection field, vectors and live sampling

## Deploy on GitHub Pages

Place the three web files in:

```text
applets/convection/
├── index.html
├── styles.css
└── script.js
```

Then the applet should be available at:

```text
https://drpop-science.github.io/enriched-revision/applets/convection/
```

The simulation loads Three.js from jsDelivr, so an internet connection is required when the page first loads.

## Teaching-model note

This is a qualitative teaching model rather than computational fluid dynamics. Particle size, thermal expansion, buoyancy and the visible density contrast are deliberately exaggerated so the causal physics is visible to students. The equal-volume counters themselves, however, are real counts of the simulation particles currently inside each wireframe sampling volume.
