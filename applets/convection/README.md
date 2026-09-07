# 3D Convection Simulation — V1

A browser-based Three.js/WebGL teaching simulation for convection in a liquid.

## Included in V1
- Rotatable, zoomable 3D tank
- One heat source beneath the liquid
- 300–1000 continuously moving representative particles
- Random particle motion + slower bulk convection drift
- Gradual development of a warm plume and return circulation
- Heating-power control
- Pause/run/reset controls
- Optional temperature colouring
- Optional bulk-flow arrows
- Optional equal-volume density comparison using two transparent sample cubes
- Responsive layout for desktop/tablet/mobile

## Deployment
Place the folder at:

`applets/convection/`

Your GitHub Pages route will then be:

`https://drpop-science.github.io/enriched-revision/applets/convection/`

The simulation imports Three.js 0.185.1 from jsDelivr, so it needs an internet connection when first loaded.

## Local testing
Because ES modules are used, serve the folder with a local web server rather than double-clicking index.html.

For example:

`python -m http.server 8000`

Then open:

`http://localhost:8000/`

## Physics-model note
This is a teaching model, not a computational-fluid-dynamics solver. The particle-density difference in the equal-volume cubes is deliberately exaggerated so students can see the idea that a warmer region of the same liquid can have a smaller mass in the same volume. The particles are representative and greatly enlarged.
