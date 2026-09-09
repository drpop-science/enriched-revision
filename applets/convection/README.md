# 3D Convection V15.5.3 — guided-tutorial polish

V15.5.3 is a UX-only refinement of V15.5.2.

## Teaching toolbar wording

- `Flow direction` retained. Singular is intentional: the overlay shows the
  direction of the liquid's bulk flow.
- `Equal volumes` renamed to **Compare volumes**.

## Tutorial control lock

While the four-step Tutorial is active, controls that could interfere with
the assisted demonstration are disabled:

- heat colours;
- flow direction;
- trace;
- compare volumes;
- exam answer;
- pause/reset;
- heater on/off;
- heating power;
- particle count;
- particle motion speed;
- heater slider and left/right nudge buttons.

Direct heater dragging was already blocked during Tutorial.

The **Tutorial** button remains active so it can close the guide, and the
**presentation/full-screen** icon remains available because it does not
alter the simulation state.

## Tutorial camera

The controlled front orientation remains, but the camera is now farther
back rather than zooming in. This keeps the heater and tank base visible
above the help banner while preserving the attention-grabbing transition
to a consistent front view.

Tutorial camera:

    position = (0, 4.75, 12.10)
    target   = (0, 1.55, 0)

## Tutorial banner

- widened to approximately 900 px maximum;
- slightly reduced padding;
- slightly smaller line-height;
- remains in the successful lower-left location.

The result is more banner-like and blocks less of the simulation.

## Compare-volumes overlay

The separate `Equal-volume comparison` pop-up is removed from view. The
neon red and blue wireframes are now sufficiently self-explanatory during
the Tutorial and when `Compare volumes` is toggled.

## Heater slider layout

The heater-position slider now sits immediately beneath the **Move the
heater** hint instead of being pushed to the bottom of the panel. This makes
it visible on initial laptop view.

The small settings note now reads:

    Set up, then enter full screen.

## View-relative slider robustness

The slider mapping now derives directly from the camera's screen-right
direction. After rotating approximately 180 degrees:

- moving the slider left moves the heater visually left;
- moving the slider right moves it visually right;
- the nudge arrows follow the same mapping.

Near a side-on view, where the heater rail is highly foreshortened, the
applet retains the last stable left/right mapping to prevent jitter.

## Physics

No changes.

Solved flow, particle packing, heat transfer model, microscopic motion,
arrow field, tracing and density representation remain unchanged.
