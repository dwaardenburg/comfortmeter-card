import { describe, expect, it } from "vitest";
import { headerLayout } from "../src/header";

const widths = { humidity: 60, temperature: 70, gap: 8 };

describe("headerLayout", () => {
  it("keeps the readings beside a name that fits between them", () => {
    expect(headerLayout({ ...widths, available: 300, name: 90 })).toBe(
      "inline"
    );
  });

  it("keeps them beside a name that just fits", () => {
    expect(headerLayout({ ...widths, available: 236, name: 90 })).toBe(
      "inline"
    );
  });

  it("moves the readings down a line when the name doesn't fit", () => {
    expect(headerLayout({ ...widths, available: 235, name: 90 })).toBe(
      "stacked"
    );
  });

  it("keeps the readings on the top line without a name", () => {
    expect(headerLayout({ ...widths, available: 140, name: 0 })).toBe("inline");
  });

  it("centres the readings one per line when they don't fit side by side", () => {
    expect(headerLayout({ ...widths, available: 137, name: 90 })).toBe(
      "narrow"
    );
    expect(headerLayout({ ...widths, available: 137, name: 0 })).toBe("narrow");
  });
});
