# 3D Convection Simulation — V6

V6 concentrates on liquid continuity and classroom readability.

## V6 changes
- Reduced the tank width from 8.0 to 7.0 units and depth from 5.2 to 4.8 units, while retaining the tall 7.2-unit glass vessel and lower waterline. With 400 representative particles this gives a more convincing liquid density without increasing particle count.
- Increased the artificial circulation strength by exactly 20% (0.72 → 0.864).
- Broadened the circulation radius (2.25 → 2.75 units) and softened its fall-off so moving the heater establishes a larger convection cell in real time.
- Added a weak coarse-grained liquid-pressure/continuity correction. This discourages unrealistic empty patches while preserving greater effective spacing in hot regions.
- Strengthened the cool settling component slightly so the low return region remains populated.
- Warm sampling frame now sits higher in the expanded rising plume.
- Cooler sampling frame stays near the low return flow at the far side of the tank.
- Sampling frames now maintain a clear minimum separation when the heater is near the centre; the cooler frame does not collapse towards the warm frame.
- Heater movement remains live and does not reset the simulation.
- 400 particles and 1.0× microscopic speed remain the defaults.

## Physics-model note
The particles are representative, not literal molecules. Thermal expansion, pressure equalisation and buoyancy are intentionally exaggerated so the macroscopic CAIE convection explanation is visible at classroom scale.


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
