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

**A marker on each reading.** Where each needle meets its scale, a marker shows the
reading: a solid dot in the needles' colour (dark in light mode, near-white in dark
mode), a little larger than the thermostat's
current-temperature dot. It is not the thermostat's target handle: there is no target yet.

**The needles' colour.** Needles, pivots, markers and the crossing's ring share one
colour: `--primary-text-color` at 75 %, halfway between the full text colour and the
thermostat's current-value marker (50 %), which looked too faint for the needles. It is
mixed solid against `--card-background-color` instead of drawn see-through, so the
needles don't darken where they cross.

**Pivots at the arch's base corners.** The temperature needle pivots at the lower left,
the humidity needle at the lower right. Each pivot is a hollow ring in the needle's colour, sitting at
the end of the opposite scale. A ring against the marker's solid dot keeps the two apart
in both themes; as two dots, they looked the same in dark mode. At both scale minimums the needles lie on the same line along
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
overlap. The other zones are not drawn: the crossing takes its zone's colour. The
crossing is a dot in that colour inside a thin (1px) ring in the needles' colour, so it reads as a
joint of the needles, like the pivots.

Colouring every zone is a debugging view for now, to see what colour the crossing takes
anywhere on the dial (variant A in the prototype). It may become an option later; it is
not one yet.

**Zone colours follow felt temperature.** Each of the nine zones has its own colour on
one scale from blue through green to red. The temperature band sets the main step, and
humidity moves it one step: humid feels warmer and dry feels cooler. That is how the heat
index, humidex and the ASHRAE 55 comfort zone treat humidity. The popular idea that damp
cold feels colder has little evidence behind it, so the card does not use it
([Globe and Mail](https://www.theglobeandmail.com/life/health-and-fitness/fitness/is-damp-cold-really-the-worst/article28346087/),
[Tempest](https://tempest.earth/resources/dry-cold-vs-humid-cold/)). Daan asked for the
generally accepted model, not intuition, to lead. The colours are mixed from three theme
colours: `--state-climate-cool-color` for cold, `--success-color` for comfortable and
`--red-color` for hot, with 30, 55, 80 and 100 % of blue or red per step.

| Zone               | Step | Colour    |
| ------------------ | ---- | --------- |
| too cold and dry   | −4   | blue      |
| too cold           | −3   | 80 % blue |
| too cold and humid | −2   | 55 % blue |
| too dry            | −1   | 30 % blue |
| comfortable        | 0    | green     |
| too humid          | 1    | 30 % red  |
| too warm and dry   | 2    | 55 % red  |
| too warm           | 3    | 80 % red  |
| too warm and humid | 4    | red       |

Soft band lines run from each pivot towards its comfort limits and stop just short of the
arcs, so the band edges show without colour. There are no band words, extra rings or
tolerable field. More can come later.

**A comfort level instead of the big number.** The thermostat's big number and its +/- buttons
go. In their place the card shows only the comfort level ("Comfortable", "Too humid"), centred
under the arch's base, where the needles never reach. The prototype first put it just
above the comfort zone, where it covered the crossing dot whenever the room was too warm
and humid.

**The room name on top, the readings either side of it.** The room name is centred at the
top, as on the thermostat card, and stays on one line, cut off with an ellipsis when it is
long. The two readings share its line, at its ends: the humidity at the left above its
scale, the temperature at the right. The thermostat card keeps its more-info button on
that line too. Without a name the readings keep the line. When the whole name doesn't fit
between them, the readings move down a line into the empty corners beside the apex, in
front of the dial, without making the card taller: the name and the dial keep their
places. Only when the two readings don't fit side by side does the card grow, with each
reading on a line of its own under the name, the humidity at the left and the temperature
at the right, so each stays on its half of the card (see the tap below). The card measures the
name and the readings to choose, so the readings stay beside any name that fits
(`src/header.ts`). Until
[#12](https://github.com/dwaardenburg/comfortmeter-card/issues/12) the readings sat a line
below the name, level with nothing on the dial.

**The thermostat's spacing above the dial.** The name's line is the thermostat title's:
8px above and below a 24px line. Below it the dial has the 8px the thermostat keeps round
its slider, and its viewBox starts 3 units above the apex's rounded tip, as the
thermostat's canvas does above its track. The gap from the name to the scales is then
the thermostat's, about 19px. Each has its Material Design icon,
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

## Decided while building

Settled in the build ([#3](https://github.com/dwaardenburg/comfortmeter-card/issues/3) to
[#9](https://github.com/dwaardenburg/comfortmeter-card/issues/9)), on 2026-11-22.

**A missing reading leaves out its needle.** A sensor that is missing, `unavailable`,
`unknown` or not a number shows "—" for its reading. Its needle is left out, and with it
the crossing and the comfort level: without both needles there is no crossing to show.
Daan agreed.

**Readings as Home Assistant formats them.** The readings use `hass.formatEntityState`, so
they follow the sensor's display precision, the user's locale and Home Assistant's own
spacing before units.

**At most one decimal.** A comfortmeter needs no more, so a reading shows at most one
decimal whatever the sensor's precision; a sensor set to fewer keeps its setting
([#13](https://github.com/dwaardenburg/comfortmeter-card/issues/13)). The card rounds the
state and hands it to `formatEntityState`. Home Assistant pads a state to the display
precision it finds in the entity registry under the entity's id, so for a sensor set to
more than one decimal the card passes the rounded state under an id the registry doesn't
know, in the same domain. That loses only a unit the integration translates, which
temperature and humidity sensors don't use.

**Scale options are checked against the sensor's unit.** The temperature defaults depend
on the sensor's unit, which the card only learns from `hass`. The card editor therefore
checks only the keys that are set. If the defaults then fill in a scale out of order, such
as `comfortable_min: 26` against the default 24 °C maximum, the card shows the error,
naming the option, in place of the dial.

**The visual editor is a form Home Assistant draws.** The card returns a schema from the
static `getConfigForm()`
([contributor docs](https://contributors.home-assistant.io/frontend/custom-ui/card-editor/)),
so Home Assistant renders `ha-form` with the built-in cards' controls and the card never
loads or imports them itself
([#11](https://github.com/dwaardenburg/comfortmeter-card/issues/11)). Each scale's options
sit in their own expandable section, closed, since most people keep the defaults. Its
`assertConfig` runs `parseConfig`, so a configuration the card rejects turns the form off
and Home Assistant shows the error, naming the option. Errors that need the sensor's unit
still show in the card's preview, as above.

**The dial keeps the thermostat's size.** On a wide card the readings and the dial stay at
most 344px wide, centred, as the thermostat card's dial does. In the sections view the card
starts a full section wide, at least half, and as tall as the dial needs, as the thermostat
card does. It started half a section wide until
[#10](https://github.com/dwaardenburg/comfortmeter-card/issues/10): beside an empty half, the
dial drew about 155px wide and the comfort level under it shrank to 5-6px. Moving the text
out of the SVG was the other option; the full-width default was chosen because it also
matches the thermostat card above or below it. At half a section the comfort level is
still small.

**A tap opens the sensor on its half.** Home Assistant's more-info dialog shows one entity,
so the card is split down the middle into two transparent buttons
([#15](https://github.com/dwaardenburg/comfortmeter-card/issues/15)): the left half, with
the humidity reading and the humidity scale, opens the humidity sensor; the right half the
temperature sensor. Large targets were preferred over tapping only the small readings.
Taps follow the scales, not the needles, which cross the middle: the temperature needle's
pivot lies in the humidity half. The halves look like the entity card, whose whole
card is a button: a pointer, no hover or pressed tint (the tile card's tint was tried and
left out, as it isn't part of the thermostat's design), and a 1px focus ring, in
`--primary-color` since the card has no state colour. The halves stop 4px short of the
middle, leaving 8px between them, Home Assistant's space between two cards, so a tap on
the centre line opens nothing rather than a guess. Only the tap targets have the gap: a
prototype that split the card's surface as well, with and without cutting the dial, was
turned down on 2026-11-23, as the dial reads as one instrument and the card looked right
whole. A sensor
that is missing or unavailable still opens its dialog. A `tap_action` option can come later
without breaking anything.

## The prototype's verdict

The prototype ran ten rounds next to a thermostat-card stand-in, in light and dark. Daan
chose **variant F** for the first release on 2026-11-22. **G** showed
`show_comfort_limits` turned on, and **A** the zone-colour debugging view. The decisions
above describe F. The build rewrote it in `src/` with tests for the geometry and deleted
the prototype; it is in git history at `b1cbd56` (`prototype/dial/`). The preview page
(`pnpm run preview`) keeps the thermostat stand-in for checking changes.

## HACS as the Marketplace

Home Assistant 2026.11 built HACS in as the Marketplace, under Settings → Marketplace, and
the separate HACS installer stops at that release
([release notes](https://www.home-assistant.io/blog/2026/11/04/release-202611/)). A custom
repository still needs to be a public GitHub repository with a `hacs.json`
([Marketplace documentation](https://www.home-assistant.io/integrations/marketplace/)), so
`hacs.json` and the Release workflow stay as they are. Dashboard resources are now served
from `/local/community/` rather than `/hacsfiles/`. Neither page says where the
Marketplace reads the minimum Home Assistant version from; `hacs.json`'s `homeassistant`
key is HACS's way, and is kept until the Marketplace says otherwise. Read on 2026-11-22.
