# Dial prototype (#2)

Run from the repo root, then open <http://localhost:5180/?variant=F>:

```powershell
node prototype/dial/serve.mjs
```

Three ways to draw the dial settled in the grill
([documents/design/comfortmeter-dial.md](../../documents/design/comfortmeter-dial.md)),
switchable with `?variant=`, the arrow keys or the pink bar. Each one is shown next to a
thermostat-card stand-in, in light and dark, at five readings: comfortable, too warm and
humid, cold below the scale, a °F sensor, and both readings at their minimums.

- **A (colour-washed bands):** every band is a soft wash (cool, heat, dry, indigo, green),
  so the comfort zone is where two greens overlap. Thin needles end at the track's inner
  edge, with a ring at the crossing. Two-line readings in the corners.
- **B (Fischer: lines, words, hatch):** no washes. Band lines through the pivots, printed
  band words, scale ticks and numbers, and a hatched comfort zone in `--primary-color`.
  Needles run onto the track from ringed pivots. Small secondary-line readings in the
  corners.
- **C (zone only, thermostat handle):** only the comfort zone is filled, and stronger when
  the crossing is inside it. The needles are the thermostat's 8px current-value strokes,
  the crossing is its handle dot coloured by the verdict, and the readings are big numbers.

## What the prototype showed

- With the pivots on the arc's ends and the default bands, the comfort zone is small
  (about 40 × 25 in the 320 viewBox) and low, around y = 200–225. The needle chords meet
  at narrow angles down there.
- When it is warm, the needles run through the verdict.
- At both minimums the needles lie on the same chord, as expected.

## Round two: the pointed arch

Daan liked B but found it too busy, and pointed out that every variant still sat on the
single thermostat arc. Instead, each scale should be an arc centred on its needle's pivot,
so the dial is a triangle with two arcs for sides. A and C were dropped. The new variants
are `arch.ts` with:

- **D (two arcs, 24px track):** the thermostat's track weight. Small single-colour pivot
  dots, a green comfort zone, and nothing else on the face. The crossing dot takes the
  band's colour. No scale numbers.
- **E (two arcs, thin 6px track):** the same, with arcs as thin as the Fischer's printed
  scale.

B stays in the switcher to compare against.

The comfort zone is larger than on the single arc (about 50 × 30) and sits higher.
When it is warm and humid, the crossing lands right where the verdict sits, above the
comfort zone.

## Round three

Daan is still drawing from every round, so all variants stay. He asked for:

- **F (full arcs, band lines, room name):** D's 24px arcs, now running from the
  opposite pivot to the apex and overlapping there, with the scale over the whole arc.
  Soft band lines are back. A header row holds the temperature, the room name and the
  humidity. When both readings are at their minimums, the crossing sits in the middle of
  the base.

The verdict first covered the crossing dot when the room was too warm and humid, so F
now puts it centred under the base.

Round four, in F: a white dot like the thermostat's handle marks each current value on
its scale, and the band lines stop 4px short of the arcs.

## Round five

Daan compared F with a real thermostat card, and the value dot didn't match it. Home
Assistant's handle is a white ring round a coloured dot, and its current-value marker is
a small grey dot, not a line. The stand-in and F now match that. In F, each handle's
centre takes the colour of its scale's band. The old A (colour washes on the single arc)
was replaced:

- **A (F with bands washed in the crossing colours):** each band is a soft wash in the
  colour the crossing dot takes in it.
- **G (F with numbered comfort limits):** the four comfort limits are numbered at the arcs, as
  on the Fischer, and nothing else.

## Round six

- G's numbers become the optional `show_comfort_limits`, off by default.
- The value dot is the small white current-value dot again, not the target handle.
- A now colours the face the way the crossing dot would be at each spot: nine regions,
  one per band combination, so every crossing colour shows in one view.
- Readings use `mdi:thermometer` and `mdi:water-percent` instead of emoji.
- The room name stays on one line with an ellipsis, and the readings moved below it into
  the corners beside the apex. The °F reading now has a long room name to show this.

## Round seven

- A's colours now fill the whole arch: the outer bands run on past the scale ends.
- Daan read the temperature's colour fans as humidity's, because they spread from the
  pivot under the humidity scale. The sides are swapped: humidity left, temperature
  right. He confirmed it reads better.
- B, C, D and E were dropped; A, F and G stay.

## Round eight

- Pivots are hollow rings and markers solid white dots, so they differ in dark mode too.
- The nine zones take colours on one felt-temperature scale (blue, green, red): the
  temperature band sets the step, and humid moves it one step warmer, dry one step
  cooler. A shows all nine. At A's soft wash, neighbouring steps are hard to tell apart;
  on the crossing they are clear.

## Verdict

_To fill in with Daan._
