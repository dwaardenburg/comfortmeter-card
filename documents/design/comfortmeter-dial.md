# The comfortmeter dial

How the comfortmeter dial looks, settled in the design grill for
[#2](https://github.com/dwaardenburg/comfortmeter-card/issues/2) on 2026-11-22. It
re-draws the thermostat card's arc ([the design-language note](home-assistant-design-language.md))
and lays the Fischer comfortmeter on it.

## The reference instrument

The Fischer 142.01 _Raum-Klimamesser_
([product page](https://fischer-barometer.de/en/shop/work/342/142.01-comfortmeter), read
from its product photo on 2026-11-22):

- Temperature on the left (0–40 °C), relative humidity on the right (20–100 %). Both scales
  rise upward and meet at the top.
- Each needle pivots low on the side opposite its scale: the temperature needle at the
  lower right, the humidity needle at the lower left. They cross in the lower middle.
- Lines from each pivot divide the face into bands: _zu kalt / normal / zu warm_ and
  _zu trocken / normal / zu feucht_. The hatched comfort zone is where the two _normal_
  bands overlap. The page's rule: comfortable "when the hands cross over the highlighted
  field".

## Decisions

**Scales on the 270° arc.** The thermostat's arc (r=145, gap at the bottom) is split at
the top. Temperature takes the left 135° and rises clockwise from the lower-left end, the
same direction as the thermostat's own arc. Humidity takes the right 135° and rises
counter-clockwise from the lower-right end. Both meet at the top, as on the Fischer.

**Pivots on the arc's ends.** The temperature needle pivots on the lower-right end of the
arc, the humidity needle on the lower-left end, so each needle grows out of the opposite
scale's round cap. This was chosen over pivots inset from the ring. The known cost: at both
scale minimums the needles lie on the same chord along the bottom. A 10 °C, 20 % room is
rare indoors.

**Scale ranges.** Temperature 10–35 °C, which is exactly 50–95 °F, so a °F sensor gets the
same geometry. Humidity 20–100 %, as on the Fischer. A reading outside its range pins the
needle at the scale's end.

**Units follow the temperature entity.** The card reads the temperature entity's
`unit_of_measurement`. Home Assistant already converts temperature sensors to the user's
unit system. Scale labels, the default range and the default comfort zone switch with it,
and any temperatures in the card's options are in that unit. There is no `unit` option.

**The track stays plain.** The 24px track keeps the thermostat's grey and carries no
colour, so it stays free for controls added later (a target, as on the thermostat).

**Bands drawn the Fischer way.** Lines from each pivot through the band limits on the
opposite scale divide the face into bands: too cold, comfortable, too warm, and too dry,
comfortable, too humid. The bands are coloured, and the comfort zone is where the two
comfortable bands overlap. That is a four-sided field with straight sides. Nothing else
for now: no extra ring of colour and no tolerable field. More can come later.

**A verdict instead of the big number.** The middle shows only the verdict
("Comfortable", "Too humid"), placed above the comfort zone. The thermostat's big number
and its +/- buttons go. With the default ranges and a 21 °C, 50 % room, the needles cross
at about (170, 210) in the 320 viewBox, below the dial's centre, so the space above the
comfort zone is usually clear.

**Current readings in the top corners.** Each scale's current reading sits in the card's
top corner above it: the temperature at the top left, the humidity at the top right.

**Default comfortable bands.** Temperature 19–24 °C (66–75 °F for a °F sensor) and
humidity 40–60 %. The Fischer prints its field without numbers, so these are the usual
indoor comfort ranges.

**Options: one optional block per scale.** Each block holds the scale's range and its
comfortable band, with the min/max words Home Assistant's own cards use. Any key left out
keeps its default.

```yaml
type: custom:comfortmeter-card
temperature_entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
temperature:
  min: 10
  max: 35
  comfortable_min: 19
  comfortable_max: 24
humidity:
  comfortable_min: 40
  comfortable_max: 60
```

**Minimum Home Assistant version: the current stable.** `hacs.json` declares the release
Daan runs and tests against, 2026.11.0 at the time of the grill, and moves up with it.
Older installs are not supported. The lower bound that matters technically was 2024.11,
when [`getGridOptions()`](https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support)
arrived for the sections view.

## Left to the prototype

The band colours, how the needles and their crossing are drawn, and the type size of the
corner readings.

## Leads

- Home Assistant 2026.11 moved HACS into Home Assistant as a built-in Marketplace
  ([release notes](https://www.home-assistant.io/blog/2026/11/04/release-202611/)). Check
  whether `hacs.json` and the Release workflow still apply as they are before the first
  release.
