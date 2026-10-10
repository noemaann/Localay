import { describe, it, expect } from "vitest";
import { REGIONS, DEFAULT_REGION_ID, getRegionById } from "../src/data/regions.js";

describe("regions data", () => {
  it("has a non-empty regions array", () => {
    expect(REGIONS.length).toBeGreaterThan(0);
  });

  it("DEFAULT_REGION_ID matches an entry in REGIONS", () => {
    const match = REGIONS.find((r) => r.id === DEFAULT_REGION_ID);
    expect(match).toBeDefined();
  });

  it("the default region is available (not coming-soon)", () => {
    const match = REGIONS.find((r) => r.id === DEFAULT_REGION_ID);
    expect(match?.available).toBe(true);
  });

  it("getRegionById returns the correct region", () => {
    const region = getRegionById("malappuram-kerala");
    expect(region?.name).toBe("Malappuram");
  });

  it("getRegionById falls back to the default region for an unknown id", () => {
    const region = getRegionById("does-not-exist");
    expect(region?.id).toBe(DEFAULT_REGION_ID);
  });

  it("every region has required fields", () => {
    for (const r of REGIONS) {
      expect(r.id).toBeTruthy();
      expect(r.name).toBeTruthy();
      expect(r.state).toBeTruthy();
      expect(r.label).toBeTruthy();
      expect(typeof r.available).toBe("boolean");
    }
  });
});
