import { describe, expect, it } from "vitest";
import { configForm, type FormSchema } from "../src/editor";

const form = configForm();

/** Every field's path in the configuration, as the form writes it. */
function paths(schema: FormSchema[], prefix = ""): string[] {
  return schema.flatMap((field) => {
    if (!field.schema) return [`${prefix}${field.name}`];
    const into = field.name ? `${prefix}${field.name}.` : prefix;
    return paths(field.schema, into);
  });
}

describe("the visual editor", () => {
  it("has a field for every option", () => {
    expect(paths(form.schema)).toEqual([
      "temperature_entity",
      "humidity_entity",
      "name",
      "show_comfort_limits",
      "temperature.min",
      "temperature.comfortable_min",
      "temperature.comfortable_max",
      "temperature.max",
      "humidity.min",
      "humidity.comfortable_min",
      "humidity.comfortable_max",
      "humidity.max",
    ]);
  });

  it("offers only sensors of the matching device class", () => {
    const [temperature, humidity] = form.schema;
    expect(temperature.selector).toEqual({
      entity: { filter: { domain: "sensor", device_class: "temperature" } },
    });
    expect(humidity.selector).toEqual({
      entity: { filter: { domain: "sensor", device_class: "humidity" } },
    });
  });

  it("labels every field", () => {
    const fields = (schema: FormSchema[]): FormSchema[] =>
      schema.flatMap((f) => (f.schema ? fields(f.schema) : [f]));
    for (const field of fields(form.schema)) {
      expect(form.computeLabel(field), field.name).toBeTruthy();
    }
  });

  it("accepts a valid configuration", () => {
    expect(() =>
      form.assertConfig({
        type: "custom:comfortmeter-card",
        temperature_entity: "sensor.room_temperature",
        humidity_entity: "sensor.room_humidity",
        humidity: { comfortable_min: 35 },
      })
    ).not.toThrow();
  });

  it("names the option of a configuration the card rejects", () => {
    expect(() =>
      form.assertConfig({
        type: "custom:comfortmeter-card",
        temperature_entity: "sensor.room_temperature",
        humidity_entity: "sensor.room_humidity",
        humidity: { comfortable_min: 70, comfortable_max: 60 },
      })
    ).toThrow("humidity.comfortable_max");
  });
});
