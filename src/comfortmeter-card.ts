import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { parseConfig, type ComfortmeterCardConfig } from "./config";
import type { HassEntity, HomeAssistant } from "./home-assistant";

/**
 * The comfortmeter card.
 *
 * A placeholder while the design settles: it shows the two readings as text. The dial
 * with its two needles and comfort zone replaces this body.
 */
@customElement("comfortmeter-card")
export class ComfortmeterCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: ComfortmeterCardConfig;

  public setConfig(config: unknown): void {
    this._config = parseConfig(config);
  }

  public getCardSize(): number {
    return 3;
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;
    const temperature = this.hass.states[this._config.temperature_entity];
    const humidity = this.hass.states[this._config.humidity_entity];
    return html`
      <ha-card header=${this._config.name ?? nothing}>
        <div class="readings">
          <p>Temperature: ${formatReading(temperature)}</p>
          <p>Humidity: ${formatReading(humidity)}</p>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    .readings {
      padding: 0 16px 16px;
    }
  `;
}

function formatReading(entity: HassEntity | undefined): string {
  if (!entity) return "entity not found";
  const unit = entity.attributes.unit_of_measurement;
  return unit ? `${entity.state} ${unit}` : entity.state;
}

declare global {
  interface HTMLElementTagNameMap {
    "comfortmeter-card": ComfortmeterCard;
  }
  interface Window {
    customCards?: { type: string; name: string; description: string }[];
  }
}

window.customCards ??= [];
window.customCards.push({
  type: "comfortmeter-card",
  name: "Comfortmeter",
  description:
    "Temperature and humidity as two crossing needles over a comfort zone.",
});
