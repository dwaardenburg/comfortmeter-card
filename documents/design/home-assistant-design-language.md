# Home Assistant's design language

The card should look like it belongs next to Home Assistant's thermostat card. This note
records what that card is made of, so the comfortmeter can re-draw it. Read from the
frontend's `dev` branch on 2026-11-22:

- [`ha-control-circular-slider.ts`](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-control-circular-slider.ts)
- [`ha-state-control-climate-temperature.ts`](https://github.com/home-assistant/frontend/blob/dev/src/state-control/climate/ha-state-control-climate-temperature.ts)
- [`ha-big-number.ts`](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-big-number.ts)

Numbers can drift between Home Assistant releases. Check the source again before relying
on one that matters.

## Why re-draw instead of reuse

These elements are registered with `@customElement`, but only as a side effect of the
frontend importing them for its own pages. A custom card cannot count on them being
loaded, and `ha-big-number` also expects Home Assistant's internationalisation context
above it. They are not a public API, so the card draws its own SVG with the same numbers
and theme variables. `ha-card` is the exception: it is always available.

## The arc

- **Canvas:** `viewBox="0 0 320 320"`; the element is 320px wide and scales with the card.
- **Sweep:** 270°, radius 145. The arc group is `translate(160 160) rotate(135)`, so it
  starts at the lower left and leaves the gap at the bottom.
- **Track:** 24px stroke with round caps, colour `--control-circular-slider-background`
  (defaults to `--disabled-color`) at opacity 0.3.
- **Value arc:** 24px, round caps, drawn as a `stroke-dasharray` along the track.
- **Target handle:** no separate shape. A zero-length dash with round caps gives a dot:
  18px white on a 24px white border.
- **Current value marker:** 8px, `--primary-text-color` at opacity 0.5.
- **Motion:** 300ms for dash and stroke-width changes, 180ms for colour and opacity.

## The middle

- **Label** above the number: the HVAC action or state ("Heat").
- **Big number:** 57px, line-height 1.12, letter-spacing -0.25px. Decimals at 0.42em, the
  unit at 0.33em, both set beside the integer at the top.
- **Secondary line** below: a thermometer icon and the current temperature.
- **Buttons** under the arc: two outlined icon buttons, minus and plus.

## Colours

The card uses theme variables only, so it follows light and dark themes and any custom
theme: `--primary-color`, `--disabled-color`, `--primary-text-color`,
`--secondary-text-color`, `--card-background-color`, and the state colours such as
`--state-climate-heat-color` and `--state-climate-cool-color`.

## Open for the design

How the comfortmeter maps onto this is the next design step: which side each scale takes,
where the needles pivot, how the comfort zone is drawn, and what takes the place of the big
number and the buttons.
