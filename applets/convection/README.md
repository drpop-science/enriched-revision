# 3D Convection V15.5.1 — view-relative heater dragging

V15.5.1 is a small interaction-only refinement of V15.5.

## Move-the-heater hint

The redundant **What to look for** card has been replaced by:

> **Move the heater**  
> Grab the heater in the diagram and drag it left or right. Its movement follows
> your current view. You can also use the position control below.

The Tutorial and Exam answer now carry the scientific explanation, so the settings
panel no longer repeats it.

## Camera-aware direct heater dragging

Direct dragging of the heater is now **view-relative**.

The heater still moves physically along the tank's world x-axis, but the applet
projects that rail into the current camera view when a drag begins.

Therefore:

- front view: drag visually left → heater moves visually left;
- rear view: drag visually left → heater still moves visually left;
- intermediate rotated views: the mapping changes continuously with the camera;
- the physical heater remains constrained to the same rail and limits as before.

The settings-panel slider remains **tank-relative**, which is deliberate.

### Foreshortening protection

When the heater rail is viewed at a steep angle, its projected screen length becomes
small. V15.5.1 clamps the drag sensitivity so small mouse/finger movements cannot
throw the heater rapidly from one end of the tank to the other.

## Unchanged from V15.5

- solved convection flow;
- particle packing;
- heating / cooling;
- microscopic motion;
- white flow-direction arrows;
- neon equal-volume frames;
- Tutorial;
- Exam answer;
- presentation mode;
- camera controls;
- heater slider and nudge buttons.

No physics factors changed.

## Updating an already-prepared self-contained folder

Keep:

    vendor/three.module.min.js
    vendor/three.core.min.js

Replace:

    index.html
    styles.css
    bootstrap.js
    script.js

No Three.js preparation is required.
