# 3D Convection Simulation — V5

V5 rebalance focuses on making the animation support the CAIE explanation of convection more clearly.

## What changed

- Default particle count is now **400**, following classroom visual preference.
- Bulk circulation has been slowed substantially. The background return-flow field now only closes the convection loop gently instead of carrying particles rapidly around a preset path.
- Temperature plays a larger role in motion:
  - warmer particles have more vigorous microscopic motion;
  - warm parcels rise strongly in the heater plume;
  - away from the heater, particles lose energy gradually;
  - cooler particles move less vigorously;
  - relatively cooler return flow has a weak downward settling component.
- Thermal expansion in the warm plume is strengthened schematically so equal-volume particle counts separate more clearly.
- The cool sample is placed low and away from the heater, where the denser return flow should accumulate.
- Equal-volume sample frames are larger (`1.90` scene units per side) to reduce random count reversals while still counting the real particles currently inside each frame.
- The warm sample follows the heater position automatically.
- **Heater can now move left/right in real time**:
  - drag the circular heater directly in the 3D scene; or
  - use the Heater position slider as an accessible alternative.
- Moving the heater does **not** reset the simulation. The old warm region cools naturally while a new plume develops above the heater's new position.
- The convection vector-field control remains removed/disabled for now.
- Cache-busting URLs are updated to `?v=5`.

## Files changed from V4

- `index.html` — V5 controls, 400-particle default, heater-position slider, field control removed, cache version updated.
- `script.js` — thermal/circulation rebalance, density sampling changes, draggable heater and live re-establishment logic.
- `README.md` — V5 notes.
- `styles.css` — unchanged from V4.

## Teaching-model note

This remains a schematic particle model. Thermal expansion and the resulting change in representative-particle number density are intentionally exaggerated so that the relationship between temperature, particle spacing, density and convection is visible at classroom scale.

The equal-volume counters still report the actual moving simulation particles inside the passive wireframe volumes; the counts are not fabricated from temperature.
