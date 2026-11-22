# Existing cards and the instrument's name

Researched 2026-11-22, before starting the repo: has anyone built this card already, and
what is the instrument called?

## Existing Home Assistant cards

None draws the two crossing needles of a comfortmeter, and none uses the thermostat card's
design language.

- **[ha-air-comfort-card](https://github.com/mrded/ha-air-comfort-card)**: the closest in
  idea. A round dial with colour zones and one moving dot for temperature and humidity,
  plus history charts. Lit and TypeScript, MIT, on HACS.
- **[Simple Air Comfort card](https://community.home-assistant.io/t/simple-air-comfort-card/670656)**:
  the same idea built from YAML with `button-card` and `card-mod`, not a packaged card.
- **[Analog Cards](https://community.home-assistant.io/t/analog-cards-a-family-of-analogue-style-lovelace-cards-for-home-assistant/1017363)**:
  analogue instruments, including a humidity dial with comfort bands. One sensor per dial.
- **Other shapes:**
  [comfortable-environment-card](https://github.com/argaar/comfortable-environment-card) (comfort indices),
  [comfort-compass-card](https://github.com/retomarek/comfort-compass-card) (days out of range),
  [Room Climate Card](https://community.home-assistant.io/t/i-made-a-room-climate-card-for-home-assistant-and-would-love-some-feedback/1020037) (bands across rooms),
  [room-comfort-card](https://github.com/dimitarraychev/room-comfort-card) (a range bar; archived),
  [Psychrometric Card](https://community.home-assistant.io/t/psychrometric-card/974159) (a chart),
  [dual-gauge-card](https://github.com/Rocka84/dual-gauge-card) (two rings).

## What sellers call the instrument

"Comfortmeter", as one word, is the common name, used by several unrelated makers, so it
is a kind of instrument rather than one brand.

- **Comfortmeter:**
  [Weems & Plath](https://www.weems-plath.com/Products/Comfortmeters-1/Endurance-Comfortmeter.html),
  [Conant](https://www.amazon.com/Conant-COMF1LFB-Brass-Standard-Comfortmeter/dp/B00IBIZZ30),
  [Fischer's English shop](https://fischer-barometer.de/en/shop/work/342/142.01-comfortmeter),
  [Lehman's](https://www.lehmans.com/product/brass-comfortmeter).
- **Comfort Meter:**
  [Kikkerland](https://www.onlinesciencemall.com/products/comfort-meter-by-kikkerland-thermometer-hygrometer),
  [Boston General Store × Fischer](https://www.bostongeneralstore.com/products/comfort-meter)
  (printed "Comfort-Meter" on the dial).
- **Climate meter or thermo-hygrometer:** Fischer's
  [category name](https://fischer-barometer.de/en/shop/product-types/climatemeters/);
  _Klimamesser_ in German; in Dutch "hygrometer en thermometer met comfort-zone"
  ([hygrometer-shop.nl](https://www.hygrometer-shop.nl/fischer006-hygrometer-en-thermometer-met-comfort-z.html)).

The marked area is almost always the **comfort zone**, where "both hands cross"; Fischer's
German pages call it the _Behaglichkeitsfeld_. The Fischer dial in the design reference
also has a black field for "tolerable high temperature" next to the hatched ideal field.

The repo is `comfortmeter-card` for that reason: one word like thermometer, and the
spelling a search for the instrument finds.
