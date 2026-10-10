import { describe, it, expect } from "vitest";
import { MOCK_PLACES } from "../src/data/mockPlaces.js";

describe("MOCK_PLACES data integrity", () => {
  it("has at least one place per category", () => {
    const REQUIRED_CATEGORIES = [
      "food",
      "nature",
      "viewpoints",
      "waterfalls",
      "treks",
      "experiences",
    ];
    const ids = new Set(MOCK_PLACES.map((p) => p.categoryId));
    REQUIRED_CATEGORIES.forEach((c) => {
      expect(ids.has(c), `No place found for category: ${c}`).toBe(true);
    });
  });

  it("every place has _demo: true", () => {
    MOCK_PLACES.forEach((p) => {
      expect(p._demo, `${p.id} is missing _demo:true`).toBe(true);
    });
  });

  it("every place has a stable id", () => {
    const ids = MOCK_PLACES.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length); // no duplicates
    ids.forEach((id) => {
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  it("every place references a regionId, not a hard-coded town name", () => {
    MOCK_PLACES.forEach((p) => {
      expect(p.regionId, `${p.id} has no regionId`).toBeTruthy();
      // regionId should be a slug, not a bare town name like "Malappuram"
      expect(p.regionId).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it("every place has required fields", () => {
    MOCK_PLACES.forEach((p) => {
      expect(p.name).toBeTruthy();
      expect(p.categoryId).toBeTruthy();
      expect(p.tagline).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.location).toBeTruthy();
      expect(p.access).toBeTruthy();
      expect(Array.isArray(p.tags)).toBe(true);
    });
  });

  it("coordinates are either null or a valid object with lat/lng/accuracy", () => {
    MOCK_PLACES.forEach((p) => {
      if (p.coordinates !== null) {
        expect(typeof p.coordinates.lat).toBe("number");
        expect(typeof p.coordinates.lng).toBe("number");
        expect(["approximate", "exact"]).toContain(p.coordinates.accuracy);
      }
    });
  });

  it("access difficulty is a valid value when present", () => {
    const VALID = ["easy", "moderate", "difficult", "unknown"];
    MOCK_PLACES.forEach((p) => {
      if (p.access?.difficulty) {
        expect(VALID).toContain(p.access.difficulty);
      }
    });
  });
});
