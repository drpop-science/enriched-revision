# 3D Convection V15.1

V15.1 is an **arrow-visibility-only** refinement of V15.

The convection solver, particle packing, heating, microscopic motion, tank geometry,
camera controls, fluorescent-green traces and far-field arrow-length behaviour are
all unchanged.

## Changes

- Solved-flow arrow shafts changed from magenta/violet to **cool white** (`#F4FAFF`).
- Arrowheads are **solid white**.
- Arrow glow changed to a faint **cyan-white** so it remains visible against the
  charcoal canvas without competing with the fluorescent-green particle traces.
- Arrow opacity increased slightly.
- Arrow glow increased slightly.
- Arrow thickness and far-field length scaling are unchanged.

## Normalised factors

Relative to V15:

| Effect | V15.1 factor |
|---|---:|
| arrowThickness | 1.00 — unchanged |
| arrowOpacity | 1.08 |
| arrowGlow | 1.10 |
| farFlowArrowLength | 1.00 — unchanged |
| camera behaviour | 1.00 — unchanged |
| solved flow mechanism | 1.00 — unchanged |
| particle packing | 1.00 — unchanged |
| heating / buoyancy / cooling | 1.00 — unchanged |

Internal cumulative display values remain:

- `arrowThickness = 1.35`
- `arrowOpacity = 1.40`
- `arrowGlow = 1.30`
- `farFlowArrowLength = 1.55`

## Deployment

Replace:

```text
applets/convection/
├── index.html
└── script.js
```

`styles.css` is unchanged from V15.

The complete package is also provided for convenience. `index.html` uses
`?v=15.1` cache-busting.
