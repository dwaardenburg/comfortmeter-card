import { afterEach, describe, expect, it } from "vitest";
import { defined } from "./defined";
import "../src/comfortmeter-card";
import type { ComfortmeterCard } from "../src/comfortmeter-card";
import type { HomeAssistant } from "../src/home-assistant";

const config = {
  type: "custom:comfortmeter-card",
  temperature_entity: "sensor.room_temperature",
  humidity_entity: "sensor.room_humidity",
};

function hassWith(
  temperature: string,
  humidity: string,
  unit = "°C"
): HomeAssistant {
  return {
    states: {
      "sensor.room_temperature": {
        state: temperature,
        attributes: { unit_of_measurement: unit },
      },
      "sensor.room_humidity": {
        state: humidity,
        attributes: { unit_of_measurement: "%" },
      },
    },
  };
}

async function mount(
  hass: HomeAssistant,
  options: Record<string, unknown> = {}
): Promise<ShadowRoot> {
  const card = document.createElement("comfortmeter-card") as ComfortmeterCard;
  card.setConfig({ ...config, ...options });
  card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return defined(card.shadowRoot);
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("the card", () => {
  it("draws the dial from the sensors' states", async () => {
    const root = await mount(hassWith("21.5", "48"));
    expect(root.querySelectorAll(".scale")).toHaveLength(2);
    expect(root.querySelectorAll(".band-line")).toHaveLength(4);
    expect(root.querySelector(".comfort-zone")).not.toBeNull();
    expect(root.querySelectorAll(".needle")).toHaveLength(2);
    expect(root.querySelectorAll(".pivot")).toHaveLength(2);
    expect(root.querySelectorAll(".marker")).toHaveLength(2);
    expect(root.querySelector(".crossing")).not.toBeNull();
  });

  it("moves the needles when a reading changes", async () => {
    const root = await mount(hassWith("21.5", "48"));
    const before = defined(
      root.querySelector(".needle.temperature")
    ).getAttribute("x2");
    const card = root.host as ComfortmeterCard;
    card.hass = hassWith("30", "48");
    await card.updateComplete;
    expect(
      defined(root.querySelector(".needle.temperature")).getAttribute("x2")
    ).not.toBe(before);
  });
});
