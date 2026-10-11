import { describe, it, expect } from "vitest";
import {
  parseGoogleMapsCoordinates,
  buildGoogleMapsDirectionsUrl,
} from "../src/services/locationSearchService.js";
import {
  calculateDistanceKm,
  estimateTravelTimeMinutes,
  buildItinerary,
  getPlaceCoordinates,
} from "../src/services/itineraryService.js";
import { MOCK_PLACES } from "../src/services/mockData.js";

describe("Google Maps Coordinate Parsing", () => {
  it("parses raw comma-separated coordinates", () => {
    const coords = parseGoogleMapsCoordinates("11.0722, 76.0740");
    expect(coords).not.toBeNull();
    expect(coords.lat).toBeCloseTo(11.0722, 4);
    expect(coords.lng).toBeCloseTo(76.074, 4);
  });

  it("parses standard Google Maps @lat,lng URLs", () => {
    const url = "https://www.google.com/maps/@11.0485,76.0712,17z?entry=ttu";
    const coords = parseGoogleMapsCoordinates(url);
    expect(coords).not.toBeNull();
    expect(coords.lat).toBeCloseTo(11.0485, 4);
    expect(coords.lng).toBeCloseTo(76.0712, 4);
  });

  it("parses Google Maps query ?q=lat,lng URLs", () => {
    const url = "https://maps.google.com/?q=11.276,76.241";
    const coords = parseGoogleMapsCoordinates(url);
    expect(coords).not.toBeNull();
    expect(coords.lat).toBeCloseTo(11.276, 3);
    expect(coords.lng).toBeCloseTo(76.241, 3);
  });

  it("parses Google Maps protobuf !3dlat!4dlng URLs", () => {
    const url =
      "https://www.google.com/maps/place/Kottakkunnu/@11.048,76.071,15z/data=!4m6!3m5!1s0x0:0x0!8m2!3d11.048!4d76.071";
    const coords = parseGoogleMapsCoordinates(url);
    expect(coords).not.toBeNull();
    expect(coords.lat).toBeCloseTo(11.048, 3);
    expect(coords.lng).toBeCloseTo(76.071, 3);
  });

  it("returns null for non-coordinate inputs", () => {
    expect(parseGoogleMapsCoordinates("hello world")).toBeNull();
    expect(parseGoogleMapsCoordinates("")).toBeNull();
    expect(parseGoogleMapsCoordinates(null)).toBeNull();
  });
});

describe("GPS Distance & Travel Time Calculations", () => {
  it("calculates distance between two points with road curvature factor", () => {
    // Kottakkunnu (11.048, 76.071) and Kottakkal (11.002, 75.994) ~10 km
    const dist = calculateDistanceKm(
      { lat: 11.048, lng: 76.071 },
      { lat: 11.002, lng: 75.994 }
    );
    expect(dist).toBeGreaterThan(5);
    expect(dist).toBeLessThan(25);
  });

  it("estimates realistic driving travel time in minutes", () => {
    const timeFor10km = estimateTravelTimeMinutes(10);
    // At ~32 km/h, 10 km takes ~20 min
    expect(timeFor10km).toBeGreaterThanOrEqual(15);
    expect(timeFor10km).toBeLessThanOrEqual(30);
  });
});

describe("Itinerary Generation Engine", () => {
  it("builds a sequenced itinerary adhering to time budget", () => {
    const plan = buildItinerary({
      places: MOCK_PLACES,
      selectedCategories: ["viewpoints", "nature", "food"],
      budgetTier: "moderate",
      maxHours: 4,
    });

    expect(plan.stops.length).toBeGreaterThanOrEqual(1);
    expect(plan.totalDurationMinutes).toBeGreaterThan(0);
    expect(plan.totalDurationMinutes).toBeLessThanOrEqual(4.5 * 60);
    expect(plan.estimatedTotalBudget).toBeGreaterThan(0);
    expect(plan.googleMapsDirectionsUrl).toContain("google.com/maps/dir");
  });

  it("builds multi-stop Google Maps URL with valid waypoints", () => {
    const points = [
      { lat: 11.048, lng: 76.071 },
      { lat: 11.002, lng: 75.994 },
      { lat: 11.276, lng: 76.241 },
    ];
    const url = buildGoogleMapsDirectionsUrl(points);
    expect(url).toContain("https://www.google.com/maps/dir");
    expect(url).toContain("origin=11.048%2C76.071");
    expect(url).toContain("destination=11.276%2C76.241");
    expect(url).toContain("waypoints=11.002%2C75.994");
  });
});
