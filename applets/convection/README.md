# 3D Convection V15.5.6 — classroom focus + portrait tablet polish

V15.5.6 is a UX-only refinement. Physics is unchanged.

## Tutorial card
- fixed 330 px height when docked over the settings panel;
- slightly larger tutorial text;
- larger Next / Back / Close buttons;
- constant button position across all four steps.

## Tutorial focus
Outside presentation mode, Tutorial dims/desaturates the page header and
ordinary settings while leaving the 3D diagram and tutorial card fully clear.

A short glow pulse runs around the tutorial card when it first appears.

## Tutorial camera
A modest closer view is used only when there is enough unobstructed room:

    presentation / docked landscape: (0, 4.82, 11.65)
    portrait / narrow layout:       (0, 4.95, 12.35)

## Exam answer
Opening Exam answer now:
- pauses the simulation;
- freezes particle and bulk motion;
- disables camera orbit / zoom;
- dims and slightly desaturates the diagram;
- blocks scene interaction.

Closing it restores the exact previous running/paused state.

## 13-inch iPad portrait
Portrait tablets up to 1200 CSS px now:
- use a single-column layout;
- move settings below the animation;
- keep the toolbar horizontally swipeable;
- keep the tutorial inside the animation panel.

Landscape behaviour is unchanged.

## Physics
No changes to flow, packing, heating, arrows, traces, equal-volume
comparison or heater dynamics.

## Final V15.5.6 tutorial polish

- Tutorial-focus surround now uses the approved darker charcoal `#20272D`.
  The 3D canvas remains `#303940`, preserving the visual hierarchy:
  dark surround → charcoal simulation → white tutorial card.
- Entering Tutorial now starts from a clean thermal/flow state. Existing
  accumulated temperature and bulk circulation are cleared before Step 1.
- The tutorial heater is placed at its standard left-third position before
  heating resumes, avoiding a warm trail while the heater moves into place.
- Exiting Tutorial restores the pre-tutorial fluid temperature/velocity
  fields, representative-particle state, heater position/on-off state and
  previous running/paused state.
- Camera and teaching-toggle restoration from V15.5.6 is retained.
- Asset query strings use `15.5.6-final` only for browser cache busting;
  the applet version remains V15.5.6.

Physics model: unchanged. This update only controls how the existing model
is initialised/restored around the Tutorial.

# V15.6 — flow sonification + attribution

V15.6 builds directly on the approved V15.5.6 release candidate. The convection solver, particle packing, tutorial reset/snapshot restoration, heater behaviour and teaching overlays are unchanged.

## Procedural sound

A new `Sound` toggle has been added to the in-canvas teaching toolbar. Sound is OFF by default.

No prerecorded aquarium, boiling or bubbling audio is used. Instead, the Web Audio API generates a low-level procedural texture whose parameters are continuously driven by the simulation:

- solved bulk-flow speed primarily controls loudness;
- representative-particle movement shapes the spectral texture;
- the developing thermal state gently influences brightness/onset;
- the horizontal location of movement provides modest stereo positioning.

The sound is a **sonification** of the model, not a literal claim that individual particles make audible noises.

When the simulation is paused, when `Exam answer` is open, or when the page is hidden, the sound fades to silence. During Tutorial it remains available so students can hear the current emerge after the tutorial flow reset.

The implementation uses locally generated Web Audio only, adds no media files and keeps the self-contained deployment model intact.

## Attribution and project link

A small footer now appears at the bottom of the settings panel:

`© 2026 Dr Pop · CC BY-NC 4.0 content · More applets ↗`

Attribution/licensing metadata is also embedded in the HTML and JavaScript source so it remains discoverable when the applet is inspected or copied.

## Licensing structure

Educational/non-software teaching content is under **CC BY-NC 4.0**. Original source code is under **PolyForm Noncommercial 1.0.0**. Full details are in `LICENSE.md`.

## Physics

**No changes to the convection physics.** Sound is a presentation layer reading the existing particle and bulk-flow state; it does not feed back into the solver.

