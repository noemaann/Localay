import { describe, it, expect } from "vitest";
import {
  formatDifficulty,
  difficultyIcon,
  difficultyClass,
  formatCoordinateAccuracy,
} from "../src/utils/format.js";

describe("formatDifficulty", () => {
  it("labels easy", () => expect(formatDifficulty("easy")).toBe("Easy access"));
  it("labels moderate", () => expect(formatDifficulty("moderate")).toBe("Moderate access"));
  it("labels difficult", () => expect(formatDifficulty("difficult")).toBe("Difficult / 4WD"));
  it("labels unknown/fallback", () => {
    expect(formatDifficulty("unknown")).toBe("Access unknown");
    expect(formatDifficulty(undefined)).toBe("Access unknown");
  });
});

describe("difficultyIcon", () => {
  it("returns green circle for easy", () => expect(difficultyIcon("easy")).toBe("🟢"));
  it("returns yellow circle for moderate", () => expect(difficultyIcon("moderate")).toBe("🟡"));
  it("returns red circle for difficult", () => expect(difficultyIcon("difficult")).toBe("🔴"));
  it("returns white circle for unknown", () => expect(difficultyIcon("other")).toBe("⚪"));
});

describe("difficultyClass", () => {
  it("returns green class for easy", () => expect(difficultyClass("easy")).toContain("green"));
  it("returns amber class for moderate", () => expect(difficultyClass("moderate")).toContain("amber"));
  it("returns red class for difficult", () => expect(difficultyClass("difficult")).toContain("red"));
  it("returns monsoon class for unknown", () => expect(difficultyClass("??")).toContain("monsoon"));
});

describe("formatCoordinateAccuracy", () => {
  it("labels exact", () =>
    expect(formatCoordinateAccuracy("exact")).toBe("Exact location"));
  it("labels approximate", () =>
    expect(formatCoordinateAccuracy("approximate")).toBe("Approximate location"));
  it("labels null/unknown", () => {
    expect(formatCoordinateAccuracy(null)).toBe("Location not confirmed");
    expect(formatCoordinateAccuracy(undefined)).toBe("Location not confirmed");
  });
});
