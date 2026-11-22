# Comfortmeter Card

A [Home Assistant](https://www.home-assistant.io/) dashboard card that shows a room's
temperature and humidity the way a classic comfortmeter does: two needles that cross, and
the room is comfortable when they cross inside the comfort zone. It borrows its look from
Home Assistant's own thermostat card, so it sits naturally next to it on a dashboard.

> **In development.** Versions stay below 1.0 while the design settles, and any 0.x
> release may change the card's options. There is no release yet: the card currently
> shows the two readings as text while the dial is being designed.

## Install

Through [HACS](https://hacs.xyz/), as a custom repository:

- In HACS, open the menu (top right) and choose **Custom repositories**.
- Add `https://github.com/dwaardenburg/comfortmeter-card` with type **Dashboard**.
- Find **Comfortmeter Card** in HACS, download it, and reload the browser.

Or by hand: download `comfortmeter-card.js` from the
[latest release](https://github.com/dwaardenburg/comfortmeter-card/releases), copy it to
`/config/www/`, and add `/local/comfortmeter-card.js` as a JavaScript module under
**Settings → Dashboards → Resources**.

## Use

```yaml
type: custom:comfortmeter-card
temperature_entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
name: Living room # optional
```

## Contributing

Bug reports and ideas are welcome as
[issues](https://github.com/dwaardenburg/comfortmeter-card/issues). See
[CONTRIBUTING.md](CONTRIBUTING.md) for how to build and test the card.

## Licence

[MIT](LICENSE).
