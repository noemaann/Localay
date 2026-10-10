import { describe, it, expect, beforeEach } from "vitest";
import {
  isDemoMode,
  regionService,
  placeService,
  reviewService,
  dishPriceService,
  placeUpdateService,
  fareService,
  submissionService,
  authService,
  storageService,
} from "../src/services";

describe("Firebase & Service Layer Architecture (Demo Mode & Contracts)", () => {
  it("should initialize in Demo Mode when live Firebase config is not provided", () => {
    expect(isDemoMode).toBe(true);
  });

  describe("regionService", () => {
    it("fetches available regions", async () => {
      const regions = await regionService.getRegions();
      expect(Array.isArray(regions)).toBe(true);
      expect(regions.length).toBeGreaterThan(0);
      expect(regions[0]).toHaveProperty("id");
      expect(regions[0]).toHaveProperty("districtId");
    });

    it("fetches region by ID", async () => {
      const region = await regionService.getRegionById("malappuram-kerala");
      expect(region).not.toBeNull();
      expect(region.name).toBe("Malappuram");
    });
  });

  describe("placeService", () => {
    it("fetches approved places", async () => {
      const places = await placeService.getPlaces();
      expect(Array.isArray(places)).toBe(true);
      expect(places.length).toBeGreaterThan(0);
      expect(places.every((p) => p.status === "approved")).toBe(true);
    });

    it("filters places by category and region", async () => {
      const places = await placeService.getPlaces({
        regionId: "malappuram-kerala",
        category: "viewpoints",
      });
      expect(places.length).toBeGreaterThan(0);
      expect(places[0].category).toBe("viewpoints");
    });

    it("creates a place document", async () => {
      const newPlace = await placeService.createPlace({
        name: "Test Spot",
        category: "nature",
        regionId: "malappuram-kerala",
        districtId: "malappuram",
        townId: "tirur-town",
      });
      expect(newPlace).toHaveProperty("id");
      expect(newPlace.name).toBe("Test Spot");

      const fetched = await placeService.getPlaceById(newPlace.id);
      expect(fetched).not.toBeNull();
      expect(fetched.name).toBe("Test Spot");
    });
  });

  describe("reviewService", () => {
    it("fetches approved reviews for a place", async () => {
      const reviews = await reviewService.getReviewsForPlace("place_kottakkunnu");
      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBeGreaterThan(0);
      expect(reviews[0].placeId).toBe("place_kottakkunnu");
    });

    it("submits a review with status 'pending' and rating bounds validation", async () => {
      const submission = await reviewService.addReview({
        placeId: "place_kottakkunnu",
        userId: "user_test",
        rating: 5,
        content: "Awesome place!",
      });
      expect(submission.status).toBe("pending");
      expect(submission.rating).toBe(5);

      // Validate rating lower bound
      await expect(
        reviewService.addReview({
          placeId: "place_kottakkunnu",
          userId: "user_test",
          rating: 0,
          content: "Bad rating",
        })
      ).rejects.toThrow("Rating must be a number between 1 and 5.");

      // Validate rating upper bound
      await expect(
        reviewService.addReview({
          placeId: "place_kottakkunnu",
          userId: "user_test",
          rating: 6,
          content: "Over upper limit",
        })
      ).rejects.toThrow("Rating must be a number between 1 and 5.");
    });
  });

  describe("dishPriceService", () => {
    it("appends new dish prices without overwriting history", async () => {
      const initial = await dishPriceService.getDishPricesForPlace("place_kottakkal_arya_vaidya");
      const initialCount = initial.length;

      const added = await dishPriceService.addDishPrice({
        placeId: "place_kottakkal_arya_vaidya",
        dishName: "Pazham Pori",
        price: 12,
        userId: "user_test",
      });

      expect(added.dishName).toBe("Pazham Pori");
      expect(added.price).toBe(12);

      const updated = await dishPriceService.getDishPricesForPlace("place_kottakkal_arya_vaidya");
      expect(updated.length).toBe(initialCount + 1);
    });

    it("validates positive price bounds", async () => {
      await expect(
        dishPriceService.addDishPrice({
          placeId: "place_kottakkal_arya_vaidya",
          dishName: "Free Tea",
          price: -5,
          userId: "user_test",
        })
      ).rejects.toThrow("Price must be a positive number");
    });
  });

  describe("fareService (AutoFare)", () => {
    it("submits auto fare reports as unverified historical records", async () => {
      const report = await fareService.submitFareReport({
        regionId: "malappuram-kerala",
        districtId: "malappuram",
        townId: "tirur-town",
        origin: "Tirur Railway Station",
        destination: "Tirur Bus Stand",
        distanceKm: 1.5,
        fareAmount: 30,
        userId: "user_test",
      });

      expect(report.status).toBe("unverified");
      expect(report.distanceKm).toBe(1.5);
      expect(report.fareAmount).toBe(30);

      const reports = await fareService.getFareReports({ origin: "Tirur Railway Station" });
      expect(reports.length).toBeGreaterThan(0);
    });

    it("validates numeric bounds for distance and fare", async () => {
      await expect(
        fareService.submitFareReport({
          origin: "A",
          destination: "B",
          distanceKm: -1,
          fareAmount: 50,
          userId: "user_test",
        })
      ).rejects.toThrow("distanceKm must be a positive number");

      await expect(
        fareService.submitFareReport({
          origin: "A",
          destination: "B",
          distanceKm: 5,
          fareAmount: -10,
          userId: "user_test",
        })
      ).rejects.toThrow("fareAmount must be a positive number");
    });
  });

  describe("submissionService & placeUpdateService", () => {
    it("handles unmoderated new place proposals", async () => {
      const submission = await submissionService.submitNewPlace({
        userId: "user_test",
        placeData: {
          name: "Hidden Water Stream",
          category: "waterfalls",
        },
      });

      expect(submission.status).toBe("pending");
      expect(submission.placeData.name).toBe("Hidden Water Stream");

      const userSubmissions = await submissionService.getUserSubmissions("user_test");
      expect(userSubmissions.length).toBeGreaterThan(0);
    });

    it("handles proposed edits for existing places", async () => {
      const update = await placeUpdateService.submitPlaceUpdate({
        placeId: "place_kottakkunnu",
        userId: "user_test",
        proposedChanges: { timings: "9:00 AM - 9:00 PM" },
      });

      expect(update.status).toBe("pending");
      expect(update.proposedChanges.timings).toBe("9:00 AM - 9:00 PM");
    });
  });

  describe("authService", () => {
    it("provides current user in demo mode", () => {
      const user = authService.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.isDemo).toBe(true);
    });

    it("notifies listeners on auth state changes", async () => {
      let activeUser = null;
      const unsubscribe = authService.onAuthStateChanged((u) => {
        activeUser = u;
      });

      expect(activeUser).not.toBeNull();
      expect(activeUser.isDemo).toBe(true);
      unsubscribe();
    });

    it("simulates sign in and sign out in demo mode", async () => {
      const newUser = await authService.signInWithGoogle();
      expect(newUser.displayName).toBe("Google Demo User");

      await authService.signOutUser();
      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe("storageService", () => {
    it("validates file size and type limits before upload", async () => {
      const invalidFile = new File(["dummy text content"], "doc.txt", {
        type: "text/plain",
      });

      await expect(
        storageService.uploadFile("submissions/user1/doc.txt", invalidFile)
      ).rejects.toThrow("Only JPEG, PNG, and WebP images are allowed.");
    });

    it("accepts valid image files in demo mode", async () => {
      const validImage = new File(["fake-image-bytes"], "photo.jpg", {
        type: "image/jpeg",
      });

      const result = await storageService.uploadFile(
        "submissions/user1/photo.jpg",
        validImage
      );
      expect(result).toHaveProperty("downloadUrl");
      expect(result).toHaveProperty("fullPath");
    });
  });
});
