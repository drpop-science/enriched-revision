# 3D Convection V10

V10 keeps the V9 Three.js scene and light Dr Pop UI, but replaces the prescribed bulk circulation loop with a solved incompressible x-y fluid field. The solved velocity field drives both the particles' bulk drift and the live arrow overlay.

## V10 changes

- **Bulk flow is no longer a hard-coded convection loop.** A lightweight 2-D Boussinesq-style solver now evolves velocity, pressure and temperature using semi-Lagrangian advection, pressure projection, buoyancy, cooling and vorticity confinement.
- The same solved x-y velocity used to move representative particles is sampled for the new **Solved flow arrows** overlay.
- The solver is intentionally a 2-D cross-section, not full 3-D CFD. The Three.js scene remains 3-D; microscopic z motion and a small curl-derived depth drift provide parallax through the tank.
- Tank z-depth increased from **1.55 to 2.10** simulation units, following the V9 depth experiment.
- Default particle count increased to **1,500**; maximum remains **2,000**.
- Particle radius remains deliberately small (**0.064 scene units**) rather than adopting the larger particle appearance of the comparison build.
- Short-range particle interaction is now **position-only packing/repulsion**. It does not add collision energy to the microscopic motion.
- The preferred rest separation rises slightly with temperature, so warm regions become visibly more spread out without a separate expansion-drift force.
- The V9 heat cone/glow, 100% default heater power, movable heater, free surface, wall handling and equal-volume wireframes are retained.
- Added **Trace 6 particles**. Manual use chooses six random representative particles. During walkthrough step 3, six particles are selected near the heater so their path through the rising plume is easier to follow.
- Each traced particle receives an amber path trail and a ring marker at its current position.
- Live particle counters remain removed. The wireframes are passive visual guides only.

## Manual 4-step walkthrough

The walkthrough no longer advances on a timer. Its text and **Back / Next / Finish / Close** controls stay inside the 3-D viewing area.

1. **Particles gain kinetic energy** — camera zooms to the heater; temperature colours are on.
2. **The heated liquid expands** — equal-volume wireframes appear so students can compare spacing.
3. **Warmer, less-dense liquid rises** — six real representative particles are traced through the simulation.
4. **Cooling and sinking complete the convection current** — the trace remains and live arrows reveal the current solved bulk velocity field.

## Model caveat

The bulk solver is a 2-D educational cross-section extruded through a 3-D particle scene. It is not a quantitative full 3-D CFD model. The temperature-dependent change in representative-particle spacing is also deliberately exaggerated so the density idea is visible at classroom scale.

## Deployment

Place these files together in:

```text
applets/convection/
├── index.html
├── styles.css
└── script.js
```

`index.html` uses `?v=10` cache-busting on the CSS and JavaScript references.

Three.js is loaded from jsDelivr, so the simulation requires an internet connection when first loading the external module.
