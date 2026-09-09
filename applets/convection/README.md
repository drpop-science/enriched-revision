# 3D Convection V15.5.4 — tutorial framing refinement

V15.5.4 changes only the guided Tutorial presentation.

## Tutorial heater position

The heater now slides to approximately one-third of the tank width from the
left-hand side before the Tutorial begins.

With the 8.28-unit tank this is:

    tutorial heater x = -1.38

When the Tutorial ends, the heater still returns to the user's original position.

## Step 2 volume comparison

The successful tutorial-only comparison layout is retained and made explicit:

- **red wireframe:** high in the warm plume, close to the water surface;
- **blue wireframe:** high at the top-right of the water.

The two equal volumes are therefore well separated and stay away from the help
banner. The red frame also follows the controlled tutorial plume during the short
heater slide if the user advances unusually quickly.

## Tutorial help banner

The banner is moved from the lower-left to the **lower-right**. This is deliberate:
the controlled tutorial heater now sits in the left third of the tank, so placing
the banner on the opposite side leaves the heater, plume and base visible.

The banner is also slightly shallower:

- maximum width: 820 px;
- reduced padding;
- slightly tighter line spacing.

## Tutorial camera

The camera remains front-on but is framed slightly farther back and higher:

    position = (0, 4.95, 12.35)
    target   = (0, 1.48, 0)

The goal is not to zoom into the heater, but to preserve a clear whole-tank view
while keeping the heater visible above/alongside the floating help banner.

## Physics

No changes. The solved flow, particle packing, heating, microscopic motion,
flow-direction arrows, traces and density model are unchanged.
