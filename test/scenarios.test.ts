import { afterEach, describe, expect, it } from "vitest";
import { defined } from "./defined";
import "../src/comfortmeter-card";
import type { ComfortmeterCard } from "../src/comfortmeter-card";
import {
  configFor,
  edgeCases,
  hassFor,
  looks,
  type Scenario,
} from "../preview/scenarios";

async function mount(scenario: Scenario): Promise<ShadowRoot> {
  const card = document.createElement("comfortmeter-card") as ComfortmeterCard;
  card.setConfig(configFor(scenario));
  card.hass = hassFor(scenario);
  document.body.append(card);
  await card.updateComplete;
  return defined(card.shadowRoot);
}

afterEach(() => {
  document.body.innerHTML = "";
});

/** Every attribute value in the card, such as each needle's coordinates. */
function attributes(root: ShadowRoot): string[] {
  return [...root.querySelectorAll("*")].flatMap((element) =>
    [...element.attributes].map(
      (a) => `${element.tagName}.${a.name}=${a.value}`
    )
  );
}

// The preview page's scenarios, so what a person looks at there is also checked here.
describe.each([...looks, ...edgeCases].map((s) => [s.label, s] as const))(
  "the preview scenario %s",
  (_, scenario) => {
    it("draws without a coordinate that isn't a number", async () => {
      const root = await mount(scenario);
      for (const attribute of attributes(root)) {
        expect(attribute).not.toMatch(/NaN|Infinity|undefined/);
      }
    });

    it("writes no text that isn't meant for people", async () => {
      const root = await mount(scenario);
      expect(root.textContent).not.toMatch(/NaN|Infinity|undefined|null/);
    });

    it("shows each reading as a value or a dash", async () => {
      const root = await mount(scenario);
      if (root.querySelector(".warning")) return;
      for (const reading of root.querySelectorAll(".reading")) {
        expect(reading.textContent?.trim()).toMatch(/^(—|-?[\d,.]+( \S+)?)$/);
      }
    });
  }
);
