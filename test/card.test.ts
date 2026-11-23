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
    formatEntityState: (entity, state = entity.state) =>
      `${state} ${entity.attributes.unit_of_measurement ?? ""}`.trim(),
    states: {
      "sensor.room_temperature": {
        entity_id: "sensor.room_temperature",
        state: temperature,
        attributes: { unit_of_measurement: unit },
      },
      "sensor.room_humidity": {
        entity_id: "sensor.room_humidity",
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

  it("says how the air feels under the base", async () => {
    const root = await mount(hassWith("26.3", "68"));
    expect(root.querySelector(".comfort-level")?.textContent).toBe(
      "Too warm and humid"
    );
    expect(root.querySelector(".crossing")?.getAttribute("style")).toContain(
      "var(--red-color) 100%"
    );
  });

  it("leaves out the crossing and the comfort level when a reading is unavailable", async () => {
    const root = await mount(hassWith("21.5", "unavailable"));
    expect(root.querySelectorAll(".needle")).toHaveLength(1);
    expect(root.querySelector(".crossing")).toBeNull();
    expect(root.querySelector(".comfort-level")).toBeNull();
  });

  it("shows the room name and both readings", async () => {
    const root = await mount(hassWith("21.5", "48"), { name: "Living room" });
    expect(root.querySelector(".name")?.textContent).toBe("Living room");
    expect(
      root.querySelector(".reading.temperature")?.textContent?.trim()
    ).toBe("21.5 °C");
    expect(root.querySelector(".reading.humidity")?.textContent?.trim()).toBe(
      "48 %"
    );
  });

  it("shows a reading with at most one decimal", async () => {
    const root = await mount(hassWith("21.5", "55.54"));
    expect(root.querySelector(".reading.humidity")?.textContent?.trim()).toBe(
      "55.5 %"
    );
  });

  it("shows a dash for a reading the sensor cannot give", async () => {
    const root = await mount(hassWith("21.5", "unavailable"));
    expect(root.querySelector(".reading.humidity")?.textContent?.trim()).toBe(
      "—"
    );
  });

  it("leaves out the name when none is set", async () => {
    const root = await mount(hassWith("21.5", "48"));
    expect(root.querySelector(".name")).toBeNull();
  });

  it("follows a custom comfortable band", async () => {
    const root = await mount(hassWith("26.3", "55"), {
      temperature: { comfortable_max: 27 },
    });
    expect(root.querySelector(".comfort-level")?.textContent).toBe(
      "Comfortable"
    );
  });

  it("names the option when the scale is out of order for the sensor's unit", async () => {
    const root = await mount(hassWith("21.5", "48"), {
      temperature: { comfortable_min: 68 },
    });
    expect(root.querySelector(".dial")).toBeNull();
    expect(root.querySelector(".warning")?.textContent).toContain(
      "temperature.comfortable_min"
    );
  });

  it("numbers the comfort limits when show_comfort_limits is on", async () => {
    const off = await mount(hassWith("21.5", "48"));
    expect(off.querySelectorAll(".comfort-limit")).toHaveLength(0);
    const on = await mount(hassWith("21.5", "48"), {
      show_comfort_limits: true,
    });
    expect(
      [...on.querySelectorAll(".comfort-limit")].map((n) => n.textContent)
    ).toEqual(["19", "24", "40", "60"]);
  });
});

describe("tapping the card", () => {
  /** The entity ids of the more-info dialogs the card asks Home Assistant to open. */
  function opened(): string[] {
    const ids: string[] = [];
    document.addEventListener("hass-more-info", (event) => {
      ids.push((event as CustomEvent<{ entityId: string }>).detail.entityId);
    });
    return ids;
  }

  function half(root: ShadowRoot, scale: string): HTMLButtonElement {
    return defined(root.querySelector<HTMLButtonElement>(`.half.${scale}`));
  }

  it("opens the humidity sensor from the left half and the temperature sensor from the right", async () => {
    const ids = opened();
    const root = await mount(hassWith("21.5", "48"));
    half(root, "humidity").click();
    half(root, "temperature").click();
    expect(ids).toEqual(["sensor.room_humidity", "sensor.room_temperature"]);
  });

  it("opens a sensor Home Assistant doesn't know", async () => {
    const ids = opened();
    const hass = hassWith("21.5", "48");
    delete hass.states["sensor.room_humidity"];
    const root = await mount(hass);
    half(root, "humidity").click();
    expect(ids).toEqual(["sensor.room_humidity"]);
  });

  it("opens a sensor that is unavailable", async () => {
    const ids = opened();
    const root = await mount(hassWith("unavailable", "48"));
    half(root, "temperature").click();
    expect(ids).toEqual(["sensor.room_temperature"]);
  });

  it("labels each half with the sensor it opens", async () => {
    const hass = hassWith("21.5", "48");
    defined(hass.states["sensor.room_temperature"]).attributes.friendly_name =
      "Living room temperature";
    const root = await mount(hass);
    expect(half(root, "temperature").getAttribute("aria-label")).toBe(
      "Open Living room temperature"
    );
    expect(half(root, "humidity").getAttribute("aria-label")).toBe(
      "Open sensor.room_humidity"
    );
  });

  it("has nothing to tap when the configuration is at odds", async () => {
    const root = await mount(hassWith("21.5", "48"), {
      temperature: { comfortable_min: 68 },
    });
    expect(root.querySelector(".half")).toBeNull();
  });
});
