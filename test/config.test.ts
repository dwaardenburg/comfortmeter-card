import { describe, expect, it } from "vitest";
import { parseConfig, scalesFor, stubConfig } from "../src/config";
import { defaultScales } from "../src/dial";

describe("parseConfig", () => {
  const valid = {
    type: "custom:comfortmeter-card",
    temperature_entity: "sensor.living_room_temperature",
    humidity_entity: "sensor.living_room_humidity",
  };

  it("accepts both entities", () => {
    expect(parseConfig(valid)).toEqual(valid);
  });

  it.each(["temperature_entity", "humidity_entity"])(
    "names %s when it is missing",
    (option) => {
      expect(() => parseConfig({ ...valid, [option]: undefined })).toThrow(
        option
      );
    }
  );

  it("rejects something that is not an entity id", () => {
    expect(() =>
      parseConfig({ ...valid, humidity_entity: "Living room" })
    ).toThrow("humidity_entity");
  });

  it("accepts a block of options per scale", () => {
    const config = {
      ...valid,
      temperature: {
        min: 15,
        max: 30,
        comfortable_min: 20,
        comfortable_max: 23,
      },
      humidity: { comfortable_min: 35 },
    };
    expect(parseConfig(config)).toEqual(config);
  });

  it.each(["temperature", "humidity"])(
    "names %s when it is not a block of options",
    (scale) => {
      expect(() => parseConfig({ ...valid, [scale]: 20 })).toThrow(scale);
    }
  );

  it.each(["min", "max", "comfortable_min", "comfortable_max"])(
    "names temperature.%s when it is not a number",
    (key) => {
      expect(() =>
        parseConfig({ ...valid, temperature: { [key]: "20" } })
      ).toThrow(`temperature.${key}`);
    }
  );

  it("names the option that is out of order among those set", () => {
    expect(() =>
      parseConfig({
        ...valid,
        humidity: { comfortable_min: 60, comfortable_max: 40 },
      })
    ).toThrow("humidity.comfortable_max");
  });

  it("accepts show_comfort_limits", () => {
    expect(parseConfig({ ...valid, show_comfort_limits: true })).toEqual({
      ...valid,
      show_comfort_limits: true,
    });
  });

  it("names show_comfort_limits when it is not true or false", () => {
    expect(() => parseConfig({ ...valid, show_comfort_limits: "yes" })).toThrow(
      "show_comfort_limits"
    );
  });
});

describe("scalesFor", () => {
  const valid = parseConfig({
    type: "custom:comfortmeter-card",
    temperature_entity: "sensor.room_temperature",
    humidity_entity: "sensor.room_humidity",
  });

  it("uses the defaults for the sensor's unit when no options are set", () => {
    expect(scalesFor(valid, "°F")).toEqual(defaultScales("°F"));
  });

  it("keeps the default for every key left out", () => {
    const scales = scalesFor(
      { ...valid, temperature: { comfortable_max: 25 }, humidity: { max: 90 } },
      "°C"
    );
    expect(scales.temperature).toEqual({
      min: 10,
      max: 35,
      comfortable_min: 19,
      comfortable_max: 25,
    });
    expect(scales.humidity).toEqual({
      min: 20,
      max: 90,
      comfortable_min: 40,
      comfortable_max: 60,
    });
  });

  it("names the option that is out of order once the defaults are filled in", () => {
    expect(() =>
      scalesFor({ ...valid, temperature: { comfortable_min: 26 } }, "°C")
    ).toThrow("temperature.comfortable_min");
  });

  it("reads temperature options in the sensor's unit", () => {
    const config = { ...valid, temperature: { comfortable_min: 68 } };
    expect(scalesFor(config, "°F").temperature.comfortable_min).toBe(68);
    expect(() => scalesFor(config, "°C")).toThrow(
      "temperature.comfortable_min"
    );
  });
});

describe("stubConfig", () => {
  const sensor = (device_class?: string) => ({
    entity_id: "sensor.any",
    state: "1",
    attributes: device_class ? { device_class } : {},
  });

  it("picks the first temperature and humidity sensors", () => {
    expect(
      stubConfig({
        "light.hall": sensor(),
        "sensor.power": sensor("power"),
        "sensor.hall_temperature": sensor("temperature"),
        "sensor.hall_humidity": sensor("humidity"),
        "sensor.attic_temperature": sensor("temperature"),
      })
    ).toEqual({
      temperature_entity: "sensor.hall_temperature",
      humidity_entity: "sensor.hall_humidity",
    });
  });

  it("falls back to example entities that the editor flags as missing", () => {
    expect(stubConfig({})).toEqual({
      temperature_entity: "sensor.temperature",
      humidity_entity: "sensor.humidity",
    });
  });

  it("gives a configuration that parses", () => {
    expect(() =>
      parseConfig({ type: "custom:comfortmeter-card", ...stubConfig({}) })
    ).not.toThrow();
  });
});
