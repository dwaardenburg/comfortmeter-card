import { parseConfig } from "./config";

/** One field or group of the visual editor's form, as Home Assistant's `ha-form` reads it. */
export interface FormSchema {
  name: string;
  type?: "grid" | "expandable";
  title?: string;
  required?: boolean;
  selector?: Record<string, unknown>;
  schema?: FormSchema[];
}

/** A scale's four options side by side, from its bottom end to its top. */
function scaleFields(step: number): FormSchema[] {
  const number = { number: { mode: "box", step } };
  return [
    {
      type: "grid",
      name: "",
      schema: ["min", "comfortable_min", "comfortable_max", "max"].map(
        (name) => ({ name, selector: number })
      ),
    },
  ];
}

const entity = (device_class: string) => ({
  entity: { filter: { domain: "sensor", device_class } },
});

const SCHEMA: FormSchema[] = [
  {
    name: "temperature_entity",
    required: true,
    selector: entity("temperature"),
  },
  { name: "humidity_entity", required: true, selector: entity("humidity") },
  { name: "name", selector: { text: {} } },
  { name: "show_comfort_limits", selector: { boolean: {} } },
  {
    type: "expandable",
    name: "temperature",
    title: "Temperature scale",
    schema: scaleFields(0.5),
  },
  {
    type: "expandable",
    name: "humidity",
    title: "Humidity scale",
    schema: scaleFields(1),
  },
];

const LABELS: Record<string, string> = {
  temperature_entity: "Temperature sensor",
  humidity_entity: "Humidity sensor",
  name: "Name",
  show_comfort_limits: "Number the comfort limits",
  min: "Minimum",
  comfortable_min: "Comfortable from",
  comfortable_max: "Comfortable up to",
  max: "Maximum",
};

const HELPERS: Record<string, string> = {
  temperature:
    "In the temperature sensor's unit. An empty field keeps the default.",
  humidity: "In %. An empty field keeps the default.",
};

/**
 * The card's visual editor: a form Home Assistant draws with the built-in cards' own
 * controls, from `getConfigForm()`. A configuration `parseConfig` rejects turns the
 * form off, and Home Assistant shows the error, naming the option, over the YAML.
 */
export function configForm() {
  return {
    schema: SCHEMA,
    computeLabel: (schema: FormSchema) => LABELS[schema.name],
    computeHelper: (schema: FormSchema) => HELPERS[schema.name],
    assertConfig: (config: unknown) => {
      parseConfig(config);
    },
  };
}
