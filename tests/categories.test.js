import { describe, it, expect } from "vitest";
import { CATEGORIES } from "../src/data/categories.js";

describe("categories data", () => {
  const EXPECTED_IDS = ["food", "nature", "viewpoints", "waterfalls", "treks", "experiences"];

  it("contains exactly the six discovery categories", () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(EXPECTED_IDS));
    expect(CATEGORIES.length).toBe(EXPECTED_IDS.length);
  });

  it("every category has required fields", () => {
    for (const cat of CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.icon).toBeTruthy();
      expect(cat.description).toBeTruthy();
      expect(cat.accent).toBeTruthy();
      expect(cat.route).toMatch(/^\/discover\//);
    }
  });
});
