import { describe, it, expect } from "vitest";
import { normalise, matchesQuery, filterPlaces } from "../src/utils/search.js";
import { MOCK_PLACES } from "../src/data/mockPlaces.js";

describe("normalise", () => {
  it("lowercases and trims", () => {
    expect(normalise("  Hello World  ")).toBe("hello world");
  });
  it("collapses internal whitespace", () => {
    expect(normalise("a  b   c")).toBe("a b c");
  });
  it("handles null/undefined gracefully", () => {
    expect(normalise(null)).toBe("");
    expect(normalise(undefined)).toBe("");
  });
});

describe("matchesQuery", () => {
  it("returns true for an empty query", () => {
    expect(matchesQuery("anything", "")).toBe(true);
    expect(matchesQuery("anything", "  ")).toBe(true);
  });
  it("matches a single word case-insensitively", () => {
    expect(matchesQuery("Biriyani Corner", "biriyani")).toBe(true);
  });
  it("matches all words in query (AND logic)", () => {
    expect(matchesQuery("Biriyani Corner Malappuram", "corner malappuram")).toBe(true);
    expect(matchesQuery("Biriyani Corner", "corner waterfall")).toBe(false);
  });
  it("returns false when needle is not in haystack", () => {
    expect(matchesQuery("Tea stall", "biriyani")).toBe(false);
  });
});

describe("filterPlaces", () => {
  it("returns all places when no filters are provided", () => {
    const result = filterPlaces(MOCK_PLACES);
    expect(result.length).toBe(MOCK_PLACES.length);
  });

  it("filters by regionId", () => {
    const result = filterPlaces(MOCK_PLACES, { regionId: "malappuram-kerala" });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) => expect(p.regionId).toBe("malappuram-kerala"));
  });

  it("returns empty array for a non-existent regionId", () => {
    const result = filterPlaces(MOCK_PLACES, { regionId: "nowhere-land" });
    expect(result).toHaveLength(0);
  });

  it("filters by categoryId", () => {
    const result = filterPlaces(MOCK_PLACES, { categoryId: "food" });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) => expect(p.categoryId).toBe("food"));
  });

  it("combines regionId and categoryId filters", () => {
    const result = filterPlaces(MOCK_PLACES, {
      regionId: "malappuram-kerala",
      categoryId: "nature",
    });
    result.forEach((p) => {
      expect(p.regionId).toBe("malappuram-kerala");
      expect(p.categoryId).toBe("nature");
    });
  });

  it("filters by query against name and tagline", () => {
    const result = filterPlaces(MOCK_PLACES, { query: "biriyani" });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) =>
      expect(
        [p.name, p.tagline, p.description, ...(p.tags ?? [])].join(" ").toLowerCase()
      ).toContain("biriyani")
    );
  });

  it("returns empty array for a non-matching query", () => {
    const result = filterPlaces(MOCK_PLACES, { query: "xyzzyplacenotexist" });
    expect(result).toHaveLength(0);
  });
});
