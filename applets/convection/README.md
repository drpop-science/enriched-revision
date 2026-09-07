# 3D Convection Simulation — V2

A browser-based Three.js teaching simulation for Dr Pop's Enriched Revision.

## V2 improvements

- Stratified 3D initial placement so particles begin evenly distributed throughout the liquid.
- Continuous microscopic particle motion everywhere in the tank, even when heating is off.
- Particle-motion speed slider (0.5×–3.0×).
- Particle-wall bouncing and local particle-particle collision handling using a spatial hash.
- Bulk convection remains separate from microscopic motion so both can be seen simultaneously.
- Dense 3D convection vector field (108 arrows) instead of a small set of path arrows.
- Vector arrows develop live with the convection current and vary in direction and length.
- Live particle-count labels are projected beside both equal-volume sampling cubes.
- The density comparison panel and 3D counters update approximately six times per second.

## Files

- `index.html` — interface and controls
- `styles.css` — responsive styling
- `script.js` — Three.js scene, particle model, collisions, convection field, vectors and density samples

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

This is a qualitative teaching model rather than computational fluid dynamics. Particle size, thermal expansion and the visible density contrast are deliberately exaggerated. The particle counters in the equal-volume cubes represent the local density model so that the same-volume comparison remains visible to students.
