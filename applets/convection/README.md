# 3D Convection V15.5.5 — tutorial docking + iPad presentation fix

V15.5.5 is a layout/reliability refinement. Physics is unchanged.

## Tutorial card

The narrower reading measure is restored.

In a normal wide two-column page the Tutorial card temporarily docks
**over the settings panel**, leaving the tank unobstructed.

In presentation mode, or on a narrow single-column layout, the same card
moves back into the 3D scene and keeps a narrow ~540 px reading width.

## iPad presentation mode

V15.5.4 relied mainly on CSS `100vw` / `100dvh`. iPadOS Safari can resolve
those units inconsistently after orientation or browser-chrome changes.

V15.5.5 sizes the presentation scene from `window.visualViewport` in
explicit CSS pixels and reapplies the size on:

- window resize;
- orientation change;
- visualViewport resize;
- visualViewport scroll.

This is intended to prevent the half-screen presentation behaviour seen
on iPad.

## Physics

No changes to solved flow, particle packing, heater physics, heat colours,
flow-direction arrows, tracing or equal-volume representation.
