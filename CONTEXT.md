# Comfortmeter Card

A Home Assistant dashboard card that shows a room's temperature and relative humidity as a
comfortmeter, drawn in the design language of Home Assistant's thermostat card.

## Language

**Comfortmeter**:
An instrument that shows temperature and relative humidity with two needles on one dial,
so that where the needles cross says how comfortable the air is. One word, like
thermometer and hygrometer.
_Avoid_: comfort meter, Comfort-Meter, comfort gauge, climate meter, thermo-hygrometer

**Dial**:
The face of the comfortmeter: a pointed arch whose two sides are the scales, with the
needles' pivots at its base corners.
_Avoid_: gauge, face plate

**Scale**:
One of the dial's two arcs, centred on its needle's pivot, along which that needle's tip
reads: the humidity scale on the left, the temperature scale on the right.
_Avoid_: track, axis

**Pivot**:
The point a needle turns on, at a lower corner of the dial under the opposite scale.
_Avoid_: hub, axis, centre

**Base**:
The straight bottom edge of the dial, between the two pivots.
_Avoid_: baseline, springing line, chord, span

**Apex**:
The top of the dial, where the two scales meet.
_Avoid_: top, peak

**Band**:
A range of one scale's readings, named for how the air feels in it: too cold, comfortable or too warm on the
temperature scale; too dry, comfortable or too humid on the humidity scale. A stretch of
one scale, not an area.
_Avoid_: sector, field, segment, zone

**Comfort limit**:
A reading where a scale's comfortable band ends and the next band begins, such as 19 °C
or 60 %. Each scale has two.
_Avoid_: comfort limit, threshold, boundary

**Band line**:
The faint line from a pivot towards a comfort limit on its needle's scale.
Band lines outline the zones.
_Avoid_: zone line, limit line, boundary

**Zone**:
An area of the dial where one band of each scale overlaps, so where the needles cross for
that pair of bands. There are nine, such as the too-warm-and-humid zone.
_Avoid_: band, field, region, patch

**Zone edge**:
The boundary of a zone, made of pieces of four band lines.
_Avoid_: zone line, outline, border

**Comfort zone**:
The zone where both bands are comfortable, so where the needles cross when the air is
comfortable.
_Avoid_: comfort field, ideal zone, Behaglichkeitsfeld, tolerable zone

**Reading**:
The current temperature or relative humidity as its sensor reports it, shown on its scale
and in its corner of the card.
_Avoid_: value, measurement

**Needle**:
One of the two hands, each showing one reading on its own scale. Each pivots under the
opposite scale.
_Avoid_: hand, pointer

**Marker**:
The small dot where a needle meets its scale, showing that scale's reading.
_Avoid_: tip, value dot, indicator, handle

**Crossing**:
The point where the two needles cross; inside the comfort zone means comfortable.
_Avoid_: intersection, dot

**Comfort level**:
The words that say which zone the crossing is in, such as "Comfortable" or "Too warm and
humid", shown under the base.
_Avoid_: verdict, status, label

**Card**:
The `comfortmeter-card` custom element as placed on a dashboard, with its YAML options.

**Design language**:
The look of Home Assistant's built-in cards (arc geometry, stroke widths, number styling,
theme colours) that this card re-draws rather than reuses.
