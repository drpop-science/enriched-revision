# 3D Convection Simulation — V4

V4 is a behaviour-focused rebuild following classroom testing.

## What changed

- Taller glass vessel (`7.2` scene units) with the waterline deliberately lower (`4.55` units).
- The water surface is no longer a collision wall. Particles can rise above it and are returned by a soft spring/damping force that represents surface tension schematically.
- Smaller, unmistakably circular induction-style heating pad.
- Separate **Heater On / Off** controls. Run/Pause controls simulation time independently.
- Heating-power slider retained; it controls power only while the heater is on.
- Much stronger local heating, buoyant plume, thermal expansion and bulk circulation.
- Particle-motion default remains `1.0×`.
- Convection-vector-field control is temporarily disabled while that visualisation is redesigned.
- Equal-volume frames are passive wireframes only. They contain no decorative/sample particles and exert no force on simulation particles.
- Sampling cubes reduced in size and repositioned so live counts respond more clearly to the warm-plume density difference.
- Live counts are calculated from the actual moving particles inside each cube on every rendered simulation frame.
- Hot-particle collision spacing is exaggerated schematically to make thermal expansion / lower number density visible at classroom scale.
- CSS and JS URLs now include `?v=4` cache-busting parameters so GitHub Pages/browser caching does not leave an older simulation running after files are replaced.

## Files

Upload/replace all three working files in the applet directory:

- `index.html`
- `styles.css`
- `script.js`

`README.md` is only documentation.

Suggested GitHub Pages path:

`applets/convection/`

## Teaching-model note

The particle spacing and density change are intentionally exaggerated. Real liquid thermal expansion is much smaller than the visual difference needed for an IGCSE classroom particle model. The equal-volume counters are nevertheless genuine counts of the simulation particles currently inside each passive sampling frame.
