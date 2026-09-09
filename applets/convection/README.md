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
