import { describe, expect, it } from "vitest";
import { parseConfig } from "../src/config";

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
});
