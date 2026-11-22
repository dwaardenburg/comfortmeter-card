# Comfortmeter Card

A [Home Assistant](https://www.home-assistant.io/) dashboard card that shows a room's
temperature and humidity the way a classic comfortmeter does: two needles that cross, and
the room is comfortable when they cross inside the comfort zone. It borrows its look from
Home Assistant's own thermostat card, so it sits naturally next to it on a dashboard.

> **In development.** Versions stay below 1.0 while the design settles, and any 0.x
> release may change the card's options.

## Install

Through the **Marketplace** (Home Assistant 2026.11 and later, where HACS is built in), as
a custom repository:

- In **Settings → Marketplace**, add
  `https://github.com/dwaardenburg/comfortmeter-card` as a custom repository of the
  **Dashboard** type.
- Find **Comfortmeter Card**, download it, and reload the browser.

Or by hand: download `comfortmeter-card.js` from the
[latest release](https://github.com/dwaardenburg/comfortmeter-card/releases), copy it to
`/config/www/`, and add `/local/comfortmeter-card.js` as a JavaScript module under
**Settings → Dashboards → Resources**.

## Use

```yaml
type: custom:comfortmeter-card
temperature_entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
name: Living room
```

The temperature needle turns on the lower left and reads on the right-hand scale; the
humidity needle turns on the lower right and reads on the left-hand scale. Where they
cross says how the air feels: in the green comfort zone it is comfortable, and the crossing
turns bluer as the air feels colder and redder as it feels warmer. The words under the dial
say the same, such as "Too warm and humid".

A sensor that is unavailable shows "—", and its needle is left out until it reports again.

### Options

| Option                | Default    | What it does                                        |
| --------------------- | ---------- | --------------------------------------------------- |
| `temperature_entity`  | (required) | The room's temperature sensor.                      |
| `humidity_entity`     | (required) | The room's relative humidity sensor.                |
| `name`                | none       | The room's name, shown on top.                      |
| `temperature`         | see below  | The temperature scale's range and comfortable band. |
| `humidity`            | see below  | The humidity scale's range and comfortable band.    |
| `show_comfort_limits` | `false`    | Number the four comfort limits at the scales.       |

`temperature` and `humidity` each take `min`, `max`, `comfortable_min` and
`comfortable_max`. Any key left out keeps its default:

| Scale             | `min` | `max` | `comfortable_min` | `comfortable_max` |
| ----------------- | ----- | ----- | ----------------- | ----------------- |
| temperature in °C | 10    | 35    | 19                | 24                |
| temperature in °F | 50    | 95    | 66                | 75                |
| humidity in %     | 20    | 100   | 40                | 60                |

Temperatures are in the temperature sensor's unit, which Home Assistant sets from your
unit system. A reading outside the scale's range keeps its needle at the scale's end.

```yaml
type: custom:comfortmeter-card
temperature_entity: sensor.bedroom_temperature
humidity_entity: sensor.bedroom_humidity
name: Bedroom
temperature:
  comfortable_min: 16
  comfortable_max: 20
show_comfort_limits: true
```

## Contributing

Bug reports and ideas are welcome as
[issues](https://github.com/dwaardenburg/comfortmeter-card/issues). See
[CONTRIBUTING.md](CONTRIBUTING.md) for how to build and test the card.

## Licence

[MIT](LICENSE).
