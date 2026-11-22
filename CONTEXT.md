# Comfortmeter Card

A Home Assistant dashboard card that shows a room's temperature and relative humidity as a
comfortmeter, drawn in the design language of Home Assistant's thermostat card.

## Language

**Comfortmeter**:
An instrument that shows temperature and relative humidity with two needles on one dial,
so that where the needles cross says how comfortable the air is. One word, like
thermometer and hygrometer.
_Avoid_: comfort meter, Comfort-Meter, comfort gauge, climate meter, thermo-hygrometer

**Scale**:
One half of the dial's arc, carrying the ticks for one reading: the temperature scale on
the left, the humidity scale on the right.
_Avoid_: gauge, axis

**Band**:
A range of one scale's readings with a verdict: too cold, comfortable or too warm on the
temperature scale; too dry, comfortable or too humid on the humidity scale.
_Avoid_: sector, field, segment

**Comfort zone**:
The area of the dial where the two comfortable bands overlap, so where the needles cross
when the air is comfortable.
_Avoid_: comfort field, ideal zone, Behaglichkeitsfeld, tolerable zone

**Needle**:
One of the two hands, each showing one reading on its own scale. Each pivots under the
opposite scale.
_Avoid_: hand, pointer

**Crossing**:
The point where the two needles cross; inside the comfort zone means comfortable.
_Avoid_: intersection, dot, marker

**Card**:
The `comfortmeter-card` custom element as placed on a dashboard, with its YAML options.

**Design language**:
The look of Home Assistant's built-in cards (arc geometry, stroke widths, number styling,
theme colours) that this card re-draws rather than reuses.
