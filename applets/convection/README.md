# 3D Convection Simulation — V8

V8 changes the tank into a **thin 3-D slice of liquid** so the representative-particle spacing better supports the convection explanation.

## Geometry
- Tank width: **9.2**
- Tank height: **4.10**
- Water height: **3.04** (surface at y = 3.12)
- Tank front-to-back depth (z): **1.18**
- Heater diameter: **0.92**

The z dimension is therefore only slightly greater than the heater diameter. This keeps genuine 3-D motion while making the particle-to-volume ratio much more convincing.

## Particles
- Default: **800 representative particles**
- Slider: **400–1000**
- 1.0× microscopic motion retained
- z-direction microscopic motion is reduced to suit the thin-slice model
- new soft wall-repulsion layer turns particles before the glass, with lower-energy hard-limit fallback to reduce wall sticking

## Heating
The visible heater remains the same size. Its effective heating radius is broadened slightly from the previous build, and the vertical heating envelope is also slightly taller, so a few more particles are heated without turning the plume into a broad column.

## Equal-volume comparison
Because the tank is now thin, the two equal sample regions are identical rectangular wireframes rather than cubes:
- 1.65 × 1.40 × 0.82 simulation units
- counters still test actual particle coordinates
- live counters remain independently switchable

## Other
- heater remains draggable left/right
- 4-step guided convection walkthrough retained
- vector field remains omitted
- cache-busting updated to v=8
