# 3D Convection V14.1

V14.1 is a **loading hotfix only**. The V14 simulation geometry, particle packing,
flow solver and all teaching behaviour are unchanged.

## The V14 loading bug

V14 tried several Three.js CDNs sequentially:

1. wait for provider A;
2. if A rejects, try B;
3. if B rejects, try C.

The problem is that a network request can **stall without rejecting**. In that case
the applet remained on “Initialising the particle model” forever and never reached
the fallback providers.

## V14.1 fix

- All three version-pinned Three.js mirrors are now attempted **in parallel**.
- `Promise.any()` uses the **first successful response**.
- Each source has an **8-second timeout**.
- If all mirrors fail or time out, the loading card changes to a clear error message
  instead of hanging indefinitely.
- jsDelivr is listed first again because it had been the most reliable provider for
  earlier builds, although all mirrors now start concurrently.

## Simulation changes

**None.**

| Effect | V14.1 vs V14 |
|---|---:|
| pool width | 1.00 |
| heater travel | 1.00 |
| solved flow mechanism | 1.00 |
| particle packing | 1.00 |
| microscopic motion | 1.00 |
| all teaching overlays | 1.00 |

The V14 pool remains 8.28 units wide, with the V13 flow/packing mechanism unchanged.

## Deployment

Replace the three normal applet files:

```text
applets/convection/
├── index.html
├── styles.css
└── script.js
```

`index.html` uses `?v=14.1` cache-busting.
