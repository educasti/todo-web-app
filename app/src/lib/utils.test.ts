import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn()", () => {
  it("combina clases", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("ignora valores falsy", () => {
    expect(cn("px-2", false && "py-1", undefined, null)).toBe("px-2");
  });

  it("resuelve conflictos con tailwind-merge", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
