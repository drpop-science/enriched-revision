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

# V15.6.1 — audible water-like sonification + CC marks

This is a presentation/audio refinement of V15.6. Physics is unchanged.

## Sound

- Replaced the hiss-heavy texture with locally generated pink-ish noise.
- Raised the maximum classroom output substantially.
- Removed inaudible sub-bass from the main path so iPad/laptop speakers can
  reproduce more of the sound.
- Added a broad moving-water body, a mid-frequency stream texture, and a
  gently pulsing resonant burble.
- The burble strength is driven by the measured vertical bulk-flow component;
  overall loudness remains driven by the actual solved current.
- The result is intentionally exaggerated for Year 9/10 teaching, while
  remaining explicitly a sonification rather than literal particle noise.
- Sound remains OFF by default and still fades out for Pause / Exam answer.

## Sound control

The toolbar now uses an icon-only speaker toggle:
- speaker + X = sound off;
- speaker + waves = sound on.

Accessible labels and tooltips remain available for screen readers / pointer
users.

## Creative Commons marking

The subtle attribution footer now shows the CC, BY and NC marks immediately
beside `CC BY-NC 4.0`, linked to the licence deed. The assets are stored
locally under `assets/` so the applet remains self-contained.

## Physics

No changes to the Boussinesq flow solver, particle packing, heating, tutorial
reset/snapshot restoration, arrows, traces, comparison volumes or heater
dynamics.

# V15.6.2 — underwater bubble-style sonification + control grouping

V15.6.2 is an audio and UI refinement. The convection physics is unchanged.

## Sound character

The V15.6.1 continuous texture could still read as wind. V15.6.2 therefore
changes the presentation model substantially:

- the continuous pink-noise bed is now very quiet and deliberately muffled;
- most audible character comes from short, damped resonant events;
- those events use varied pitch, duration and short upward frequency sweeps
  to create a rounded underwater "blup / burble" quality;
- occasional irregular clusters avoid a mechanical/metronomic pattern;
- no supplied YouTube audio is copied, sampled, downloaded or embedded.

The supplied underwater-bubble references were used only as a sound-design
direction. The applet still synthesises everything locally with Web Audio.

The simulation itself drives event rate, event strength, spectral activity
and stereo position. The stochastic timing/pitch layer is presentation only.

## Toolbar

`Sound` has moved to sit immediately beside the full-screen control. A divider
now separates the physics/teaching controls from these presentation controls.

## Creative Commons mark

A small single CC mark now appears beside
`Dr Pop's Enriched Revision · Cambridge IGCSE Physics` in the header.

It is intentionally low contrast and links to the CC BY-NC 4.0 deed. The
fuller CC / BY / NC attribution remains in the settings footer.

## Physics

No changes to the Boussinesq solver, particle packing, heating, tutorial
reset/snapshot restoration, flow arrows, traces, comparison volumes or
heater dynamics.

# V15.6.3 — final fish-tank sound trial + CC mark beside title

V15.6.3 is an audio/UI refinement only. Physics is unchanged.

## Fish-tank ambience

The V15.6.2 runtime-generated hiss/resonance model has been removed.

V15.6.3 uses a new ORIGINAL locally bundled ambience:
`assets/fish-tank-loop.wav`.

It was synthesised from scratch for the applet. No audio from the user's
YouTube references is downloaded, sampled, copied or embedded.

The sound deliberately prioritises a recognisable aquarium/fish-tank feel
for Year 9/10 rather than acoustic realism. It uses:
- a soft low-mid pump/body hum;
- dense irregular low/mid gurgle events;
- occasional lower "glug" events;
- virtually no broadband hiss;
- no high-pitched oscillator chirps.

The actual simulation still controls overall sound level and gentle stereo
position. Pause, Exam answer and a hidden page still fade to silence.

## Toolbar

Sound remains immediately beside Fullscreen as the presentation-control pair.

## Creative Commons mark

The small CC logo has moved from the Dr Pop / Cambridge side of the header to
sit directly beside the `3D Convection` title. The full CC / BY / NC licence
marking remains in the settings footer.

## Physics

No changes to the Boussinesq solver, particle packing, heating, tutorial
reset/snapshot restoration, flow arrows, traces, comparison volumes or heater
dynamics.

# V15.6.4 — aquarium atmosphere + transient heater gurgle

V15.6.4 is an audio/presentation refinement only. Physics is unchanged.

## Audio source boundary

The user supplied a separate Claude-built convection HTML file as a sound
reference and explicitly requested that nothing else from it be used.

V15.6.4 therefore adapts only the audio treatment:
- a very quiet, heavily low-passed brown-noise water body;
- no simulation/rendering/particle/physics/UI code from that file.

Our existing applet architecture remains unchanged.

## Short heater gurgle

The longer V15.6.3 fish-tank loop has been removed.

A new 3.7-second local asset, `assets/heater-gurgle.wav`, is based on the
clean gurgling candidate approved by the user. It contains:
- no broadband noise/static bed;
- no pump hum;
- no high-pitched chirps;
- only smooth low/mid bubble and glug resonances.

The gurgle plays when:
- Sound is first switched on while the heater is active;
- the heater is switched from Off to On;
- the user begins dragging the heater;
- the heater position slider/nudge controls are used;
- the simulation is reset while sound and heating are active;
- Tutorial starts its clean heater sequence.

A cooldown prevents repeated heater movements from creating overlapping
gurgles.

## Pedagogical disclaimer

The first time Sound is switched on in a page session, a temporary toast says:

`Sound effect only — Convection does not produce these bubbling sounds —
they are included only to make the animation more engaging.`

The toast is informational and non-blocking.

## UI / licensing

Sound remains next to Fullscreen. The CC logo remains beside the
`3D Convection` title, with the full CC/BY/NC attribution in the settings
footer.

## Physics

No changes to the Boussinesq solver, particles, heating, packing, flow
arrows, traces, comparison volumes, tutorial reset/snapshot restoration,
or heater dynamics.

# V15.6.5 — final sound behaviour and title licence lockup

V15.6.5 is an audio/presentation refinement only. **Physics is unchanged.**

## Final sound behaviour

Sound remains optional and OFF by default.

The short 3–4 second `assets/heater-gurgle.wav` transient now plays only at two moments:

- when the heater changes from Off to On;
- once at the start of Tutorial, after its clean flow reset.

It no longer plays on heater dragging, slider/nudge movement, Reset, or merely when Sound is toggled on.

`assets/aquarium-atmosphere.wav` is a seamless local loop made from the approved 1x aquarium-atmosphere preview. While a meaningful convection current exists, it plays at unity gain: the approved **1x level with no flow-dependent attenuation or volume modulation**. A short fade is used only when switching the loop on/off to prevent clicks.

To reduce overhead, the applet does not procedurally synthesise the steady atmosphere and does not update audio parameters every frame. It checks a sparse sample of the already-solved velocity grid roughly three times per second and uses a small hysteresis threshold to decide whether convectional flow is present.

The first time Sound is enabled in a page session, the existing non-blocking disclaimer explains that the bubbling/aquarium sound is a presentation effect and not produced by convection itself.

## Creative Commons title mark

All three local Creative Commons symbols — **CC · BY · NC** — now sit immediately beside `3D Convection`. They are larger and vertically centred with the title. The full text attribution remains in the settings footer.

## Physics

No changes to the Boussinesq solver, fluid constants, particle dynamics, thermal spacing, packing, arrows, traces, comparison volumes, heater physics, camera, Tutorial content, or snapshot/restore behaviour.

# V15.6.6 — event-only sound and title licence alignment

V15.6.6 removes the continuous aquarium atmosphere entirely. **Physics is unchanged.**

## Sound

- `assets/heater-gurgle.wav` is now approximately 1.85 seconds, about half the previous duration.
- The gurgle plays only when the heater changes **Off → On** and once at the **start of Tutorial**.
- Dragging, slider movement, nudges, Reset and ordinary animation produce no sound.
- There is no looping background ambience, no procedural sonification, no flow sampling and no per-frame audio work.
- Playback uses a single local HTML audio asset.
- The small Sound toggle is retained as a classroom mute control. Sound effects are enabled by default.
- The one-time pedagogical disclaimer remains.

## Title licence mark

The CC, BY and NC symbols remain beside `3D Convection`. Their lower edges are aligned to the bottom of the title text.

## Physics

No changes to the Boussinesq solver, particles, thermal model, packing, flow arrows, traces, comparison volumes, tutorial reset/snapshot behaviour or heater dynamics.

