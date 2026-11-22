# The comfortmeter dial

How the comfortmeter dial looks, settled in the design grill for
[#2](https://github.com/dwaardenburg/comfortmeter-card/issues/2) on 2026-11-22. It
takes the Fischer comfortmeter's shape and draws it with the thermostat card's strokes and
theme colours ([the design-language note](home-assistant-design-language.md)).

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

**Two arcs: a pointed arch.** Each scale is an arc centred on its own needle's pivot,
with a radius equal to the distance between the pivots, so the dial is a pointed
(equilateral) arch: a triangle with two arcs for sides, as on the Fischer. Humidity is the
left arc and temperature the right one: the reverse of the Fischer 142.01, chosen in the
prototype because the temperature's colours then fan out from the left and read more
easily. Both rise from the base to the apex, and each
spans the full 60°: from the opposite pivot to the apex, where the two arcs overlap. The
scale uses the whole arc. The arcs keep the thermostat track's 24px width and round caps.
They are drawn as one translucent shape, so the overlap at the apex doesn't darken. This replaced an earlier choice to split the thermostat's single 270° arc,
because the prototype showed that the single arc squeezed the comfort zone into a small,
low field. Because each needle sweeps a circle around its own pivot, its tip runs along its
scale and its length stays the same.

**A small white dot on each current value.** Where each needle meets its scale, a small
white dot marks the current value, the size of the thermostat's current-temperature
marker. It is not the thermostat's target handle: there is no target yet.

**Pivots at the arch's base corners.** The temperature needle pivots at the lower left,
the humidity needle at the lower right. Each pivot is a small dot in one colour, sitting at the
end of the opposite scale. At both scale minimums the needles lie on the same line along
the base and have no crossing. The card then puts the crossing in the middle of the base.
A 10 °C, 20 % room is rare indoors.

**Scale ranges.** Temperature 10–35 °C, which is exactly 50–95 °F, so a °F sensor gets the
same geometry. Humidity 20–100 %, as on the Fischer. A reading outside its range pins the
needle at the scale's end.

**Units follow the temperature entity.** The card reads the temperature entity's
`unit_of_measurement`. Home Assistant already converts temperature sensors to the user's
unit system. Scale labels, the default range and the default comfort zone switch with it,
and any temperatures in the card's options are in that unit. There is no `unit` option.

**The arcs stay plain.** The arcs keep the thermostat track's grey and carry no colour or
numbers, so they stay free for controls added later (a target, as on the thermostat).
Scale numbers are left out for now.

**Only the comfort zone is drawn.** The comfort zone is a green field
(`--success-color`), four-sided with straight sides, where the two comfortable bands
overlap. The other bands are not drawn: the dot at the crossing takes the colour of the
band the reading is in. When both readings are off, the temperature's colour wins.

| Band        | Colour                       |
| ----------- | ---------------------------- |
| comfortable | `--success-color`            |
| too warm    | `--state-climate-heat-color` |
| too cold    | `--state-climate-cool-color` |
| too dry     | `--state-climate-dry-color`  |
| too humid   | `--indigo-color`             |

Soft band lines run from each pivot towards its comfort limits and stop just short of the
arcs, so the band edges show without colour. There are no band words, extra rings or
tolerable field. More can come later.

**A comfort level instead of the big number.** The thermostat's big number and its +/- buttons
go. In their place the card shows only the comfort level ("Comfortable", "Too humid"), centred
under the arch's base, where the needles never reach. The prototype first put it just
above the comfort zone, where it covered the crossing dot whenever the room was too warm
and humid.

**The room name on top, the readings below it.** The room name is centred at the top, as
on the thermostat card, and stays on one line, cut off with an ellipsis when it is long.
The two readings sit under it, in the empty corners beside the apex: the humidity at
the left above its scale, the temperature at the right. Each has its Material Design icon,
as in Home Assistant: `mdi:thermometer` and `mdi:water-percent`.

**Default comfortable bands.** Temperature 19–24 °C (66–75 °F for a °F sensor) and
humidity 40–60 %. The Fischer prints its field without numbers, so these are the usual
indoor comfort ranges.

**Options: one optional block per scale.** Each block holds the scale's range and its
comfortable band, with the min/max words Home Assistant's own cards use. Any key left out
keeps its default.
`show_comfort_limits` (default `false`) numbers the four comfort limits at the arcs, as on the
Fischer. It is off by default to keep the dial simple.

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
show_comfort_limits: false
```

**Minimum Home Assistant version: the current stable.** `hacs.json` declares the release
Daan runs and tests against, 2026.11.0 at the time of the grill, and moves up with it.
Older installs are not supported. The lower bound that matters technically was 2024.11,
when [`getGridOptions()`](https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support)
arrived for the sections view.

## Left to the prototype

The type size of the header readings.

## Leads

- Home Assistant 2026.11 moved HACS into Home Assistant as a built-in Marketplace
  ([release notes](https://www.home-assistant.io/blog/2026/11/04/release-202611/)). Check
  whether `hacs.json` and the Release workflow still apply as they are before the first
  release.
