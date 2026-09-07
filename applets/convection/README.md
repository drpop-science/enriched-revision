# 3D Convection Simulation — V7

V7 tests whether a **shallower body of water** produces a clearer, more CAIE-friendly convection animation while retaining the wider tank requested during development.

## Geometry change

The preview used a water depth/height of 3.8 simulation units. V7 reduces that by exactly 20%:

- Tank width: **9.2**
- Tank front-to-back depth: **4.6**
- Water depth/height: **3.04** (3.8 × 0.80)
- Glass height: **4.35**
- Water surface: **3.12** above the model base

The tank is therefore wide and relatively shallow, but the glass no longer extends far above the liquid.

## Particle model

- Default: **400 representative particles**
- Default microscopic motion: **1.0×**
- Heater remains movable left/right without resetting the simulation
- Temperature changes particle random speed, buoyancy and schematic thermal spacing
- Weak coarse-grained pressure/continuity correction remains in place to discourage unrealistic voids in the liquid
- The free surface is still soft rather than a reflective wall

## Equal-volume comparison

`Compare equal volumes` now controls only the two passive wireframe sampling volumes.

A new nested toggle, `Live particle counters`, controls the numerical readout independently. This lets the wireframes be used visually without showing numbers.

When counters are enabled:

- every actual simulation particle is tested against the exact axis-aligned bounds of each wireframe;
- the two 3D labels update from the real count;
- the numerical density cards below the simulation become visible.

No decorative or trapped particles are created inside either frame.

## New 4-step guided walkthrough

The vector field remains omitted. V7 replaces it with a camera-led teaching sequence.

Press **Start walkthrough** and the simulation continues running while the camera pans and zooms through four stages:

1. **Particles gain kinetic energy** — particles nearest the heater move more vigorously.
2. **The heated liquid expands** — average spacing increases slightly, so the same volume contains less mass and the liquid is less dense.
3. **Warmer, less-dense liquid rises** — the camera follows the rising plume as it moves away from the heater.
4. **Cooler, denser liquid sinks** — the camera zooms back out to show the cooler return flow and complete convection current.

The walkthrough temporarily controls the camera and teaching wireframes, then returns manual control to the user. The **Stop** button exits early and returns towards the previous camera view.

## Files

- `index.html`
- `styles.css`
- `script.js`

Deploy the folder to:

`applets/convection/`

The HTML references `styles.css?v=7` and `script.js?v=7` to avoid stale browser/GitHub Pages caches during testing.
