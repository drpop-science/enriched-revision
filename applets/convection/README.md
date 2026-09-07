# 3D Convection V11

V11 is a light-touch refinement of V10. The solved x-y Boussinesq-style flow, the Dr Pop UI, the movable heater, the heat glow and the manual 4-step walkthrough are all retained.

## What changed from V10

- **No drastic geometry or solver redesign.** Tank dimensions, heater, walkthrough structure and overall feel stay close to V10.
- Added a **gentle local continuity / density-equalisation pass** after the position-only packing correction. Its job is to stop obvious empty pockets or corner gaps from appearing while still allowing the warmer plume to be more spread out and the lower cooler regions to look slightly denser.
- Initial particle placement is a little more even, with slightly reduced jitter in the stratified fill.
- The solved plume is allowed a little less persistent diagonal locking by slightly reducing the vorticity confinement and slightly increasing flow drag.
- **Solved flow arrows are easier to read**: darker teal shafts, brighter cyan-teal heads, larger heads and higher opacity.
- **Trace 6 particles is easier to follow**: brighter amber trails, larger ring markers and a longer trail history.

## Modelling intent

The target is now:

- warmer regions can still look **more spread out**;
- cooler lower regions can still look **slightly more closely packed**;
- but the representative particles should continue to **fill the whole liquid volume** so the tank does not develop obviously empty wedges or gaps.

## Deployment

Place these files together in:

```text
applets/convection/
├── index.html
├── styles.css
└── script.js
```

`index.html` uses `?v=11` cache-busting on the CSS and JavaScript references.
