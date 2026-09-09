# 3D Convection V15.4 — compact teaching interface

V15.4 is a UX / teaching-text release. The convection physics, particle packing,
flow solver and V15.3.2 front-view tutorial camera are unchanged.

## Laptop / classroom UX

- The title and subtitle stay on the left.
- `Dr Pop's Enriched Revision · Cambridge IGCSE Physics` moves to the right.
- The workspace height is tied to the viewport on laptops so the diagram and
  settings panel normally fit on one screen with minimal vertical scrolling.
- Teaching overlays move onto the 3D canvas as pressed/depressed toolbar buttons:
  - Temperature
  - Flow arrows
  - Trace 6
  - Equal volumes
  - Tutorial
  - Full screen
- Active teaching buttons use a subtle luminous pressed state.
- Equal-volume guidance now appears inside the diagram instead of below it.

## Full screen

`Full screen` makes the 3D scene panel the presentation surface while preserving
the overlay toolbar and tutorial controls.

- Uses the browser Fullscreen API where available.
- Includes a CSS fixed-screen fallback for browsers with incomplete support.
- In normal page view, ordinary mouse-wheel scrolling scrolls the page and does
  **not** zoom the tank.
- Wheel zoom is enabled while the scene is full screen, or with Ctrl+wheel.
- Touch pinch zoom remains available.

## Heater position

The heater position is now the bottom-most setting and uses:

    ←  [ rectangular position slider ]  →

The centre of the tank is marked on the slider, and the arrow buttons nudge the
heater by 0.25 simulation units.

## Five-step walkthrough

The camera remains fixed in the approved front elevation.

1. Particles gain kinetic energy.
2. Heated liquid expands / particles move further apart / liquid becomes less dense.
3. Less-dense warm liquid rises; cooler, denser liquid replaces it.
4. Cooling increases density and the cooler liquid sinks, completing the circulation.
5. Exam-ready four-mark summary using CAIE mark-scheme language.

The text explicitly states that **particles do not expand**; the red and blue
wireframes compare particle spacing in equal volumes.

## CAIE wording used

The walkthrough follows recurring 0625 mark-scheme points:

- particles gain thermal / kinetic energy;
- particles move apart;
- heated liquid expands / becomes less dense;
- less-dense liquid rises / denser liquid falls;
- a convection current forms.

## Unchanged factors vs V15.3.2

| Effect | V15.4 |
|---|---:|
| solved flow | 1.00 |
| volume-normalised packing | 1.00 |
| heating / buoyancy / cooling | 1.00 |
| Langevin particle motion | 1.00 |
| white arrow presentation | 1.00 |
| peripheral arrow scaling | 1.00 |
| tutorial camera orientation | 1.00 |

## Updating an already-prepared self-contained folder

Keep your existing:

    vendor/three.module.min.js
    vendor/three.core.min.js

Replace:

    index.html
    styles.css
    bootstrap.js
    script.js

No Three.js preparation is required again.
