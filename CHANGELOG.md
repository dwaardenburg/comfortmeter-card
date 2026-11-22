# Changelog

Written for people who use the card. Each release's section becomes its GitHub Release
notes. While the version is below 1.0, any release may change the card's options; such
changes are listed under **Breaking changes**.

## [Unreleased]

### New

- The comfortmeter dial: a temperature and a humidity needle that cross over a green
  comfort zone, drawn in the style of Home Assistant's thermostat card and following its
  light and dark themes.
- The crossing takes a colour from blue through green to red for how warm the air feels,
  and the words under the dial say how comfortable it is, such as "Too warm and humid".
- The room name on top with a reading either side, each with its icon. A reading
  shows at most one decimal.
- `temperature` and `humidity` options set each scale's range and comfortable band.
  Temperatures follow the sensor's unit, °C or °F.
- `show_comfort_limits` numbers the comfort limits at the scales.
- A sensor that is unavailable shows "—", and its needle is left out.
- The card takes a full section's width in the sections view, as the thermostat card does,
  and the card picker shows it with a temperature and a humidity sensor from one device,
  both reporting, where there is one.
- A visual editor: pick the sensors from those with the right device class, set the name,
  and open each scale's options when you want to change them.
- Requires Home Assistant 2026.11 or later.
