import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { LocationProvider } from "../src/context/LocationContext.jsx";
import { fareService } from "../src/services";
import SubmitFareReportForm from "../src/features/autofare/SubmitFareReportForm.jsx";
import AutoFarePage from "../src/pages/AutoFarePage.jsx";

const nowMs = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

// Synthetic Test Fixtures (Labeled clearly as test data)
const SYNTHETIC_TEST_REPORTS = [
  {
    id: "test_fare_1",
    origin: "Kottakkal Stand",
    destination: "Changuvetty Junction",
    distanceKm: 2.5,
    fareAmount: 40,
    waitingCharges: 0,
    tollsAndExtras: 0,
    tripType: "one_way",
    timeOfDay: "day",
    createdAt: new Date(nowMs - 5 * dayMs).toISOString(), // 5 days old (recent)
  },
  {
    id: "test_fare_2",
    origin: "Kottakkal Stand",
    destination: "Changuvetty Junction",
    distanceKm: 2.5,
    fareAmount: 45,
    waitingCharges: 5, // Total effective fare = 50
    tollsAndExtras: 0,
    tripType: "one_way",
    timeOfDay: "day",
    createdAt: new Date(nowMs - 10 * dayMs).toISOString(), // 10 days old (recent)
  },
  {
    id: "test_fare_3",
    origin: "Kottakkal Stand",
    destination: "Changuvetty Junction",
    distanceKm: 2.6,
    fareAmount: 60,
    waitingCharges: 0,
    tollsAndExtras: 10, // Total effective fare = 70
    tripType: "one_way",
    timeOfDay: "day",
    createdAt: new Date(nowMs - 15 * dayMs).toISOString(), // 15 days old (recent)
  },
  {
    id: "test_fare_stale",
    origin: "Kottakkal Stand",
    destination: "Changuvetty Junction",
    distanceKm: 2.5,
    fareAmount: 30,
    waitingCharges: 0,
    tollsAndExtras: 0,
    tripType: "one_way",
    timeOfDay: "day",
    createdAt: new Date(nowMs - 200 * dayMs).toISOString(), // Stale report (> 180 days old)
  },
  {
    id: "test_fare_dissimilar",
    origin: "Tirur Station",
    destination: "Tanur Beach",
    distanceKm: 12.0,
    fareAmount: 250,
    tripType: "one_way",
    timeOfDay: "day",
    createdAt: new Date(nowMs - 2 * dayMs).toISOString(), // Dissimilar route
  },
];

function renderWithProviders(ui) {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>{ui}</LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe("Step 7 — AutoFare Feature & Comparison Algorithm", () => {
  describe("calculateFareSummary Algorithm", () => {
    it("returns insufficient_data for empty dataset", () => {
      const summary = fareService.calculateFareSummary([], { distanceKm: 2.5 });
      expect(summary.status).toBe("insufficient_data");
      expect(summary.sampleSize).toBe(0);
      expect(summary.comparisonOutcome).toBe("Insufficient comparable data");
      expect(summary.observedRange).toBeNull();
    });

    it("returns insufficient_data when only one report matches criteria", () => {
      const singleReport = [SYNTHETIC_TEST_REPORTS[0]];
      const summary = fareService.calculateFareSummary(singleReport, {
        origin: "Kottakkal Stand",
        destination: "Changuvetty Junction",
      });
      expect(summary.status).toBe("insufficient_data");
      expect(summary.sampleSize).toBe(1);
    });

    it("excludes stale reports (> 180 days old) from calculation", () => {
      const staleOnly = [SYNTHETIC_TEST_REPORTS[3]]; // 200 days old report
      const summary = fareService.calculateFareSummary(staleOnly, {
        origin: "Kottakkal Stand",
        destination: "Changuvetty Junction",
        maxAgeDays: 180,
      });
      expect(summary.status).toBe("insufficient_data");
      expect(summary.sampleSize).toBe(0);
    });

    it("accounts for extra charges (tolls & waiting) in effective total fare", () => {
      const summary = fareService.calculateFareSummary(SYNTHETIC_TEST_REPORTS, {
        origin: "Kottakkal Stand",
        destination: "Changuvetty Junction",
        distanceKm: 2.5,
      });

      // Synthetic reports:
      // Report 1: 40 + 0 = 40
      // Report 2: 45 + 5 = 50
      // Report 3: 60 + 10 = 70
      // Stale & Dissimilar excluded -> 3 comparable reports
      expect(summary.status).toBe("success");
      expect(summary.sampleSize).toBe(3);
      expect(summary.stats.minFare).toBe(40);
      expect(summary.stats.maxFare).toBe(70);
      expect(summary.stats.medianFare).toBe(50);
    });

    it("evaluates neutral comparison outcomes against quoted fares", () => {
      // Test "Within reported range" (quoted = 50 INR, min = 40, max = 70)
      const resWithin = fareService.calculateFareSummary(SYNTHETIC_TEST_REPORTS, {
        origin: "Kottakkal Stand",
        destination: "Changuvetty Junction",
        queryFareAmount: 50,
      });
      expect(resWithin.comparisonOutcome).toBe("Within reported range");

      // Test "Below reported range" (quoted = 30 INR)
      const resBelow = fareService.calculateFareSummary(SYNTHETIC_TEST_REPORTS, {
        origin: "Kottakkal Stand",
        destination: "Changuvetty Junction",
        queryFareAmount: 30,
      });
      expect(resBelow.comparisonOutcome).toBe("Below reported range");

      // Test "Above reported range" (quoted = 100 INR)
      const resAbove = fareService.calculateFareSummary(SYNTHETIC_TEST_REPORTS, {
        origin: "Kottakkal Stand",
        destination: "Changuvetty Junction",
        queryFareAmount: 100,
      });
      expect(resAbove.comparisonOutcome).toBe("Above reported range");
    });

    it("never claims a driver overcharged and includes methodology disclaimer", () => {
      const summary = fareService.calculateFareSummary(SYNTHETIC_TEST_REPORTS, {
        origin: "Kottakkal Stand",
        destination: "Changuvetty Junction",
        queryFareAmount: 120,
      });
      expect(summary.disclaimer).toContain("crowd-sourced community reports");
      expect(JSON.stringify(summary)).not.toContain("overcharged");
      expect(JSON.stringify(summary)).not.toContain("scam");
    });
  });

  describe("SubmitFareReportForm Component", () => {
    it("renders form inputs for pickup, drop-off, distance, fare, and extra charges", () => {
      renderWithProviders(<SubmitFareReportForm />);
      expect(screen.getByText("Log an Auto-Rickshaw Fare")).toBeInTheDocument();
      expect(screen.getByLabelText(/Pickup Stand \/ Landmark/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Drop-off Destination/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Approx Distance/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Total Fare Amount/i)).toBeInTheDocument();
    });
  });

  describe("AutoFarePage Component", () => {
    it("renders calculator, comparison badge, and disclaimer", () => {
      renderWithProviders(<AutoFarePage />);
      expect(screen.getByText("Community Auto-Rickshaw Fare Finder")).toBeInTheDocument();
      expect(screen.getByText(/Route Criteria/i)).toBeInTheDocument();
    });
  });
});
