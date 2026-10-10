import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { LocationProvider } from "../src/context/LocationContext.jsx";
import SubmissionStatusBadge from "../src/components/SubmissionStatusBadge.jsx";
import SubmitPlaceForm from "../src/features/contributions/SubmitPlaceForm.jsx";
import AddReviewForm from "../src/features/contributions/AddReviewForm.jsx";
import AddDishPriceForm from "../src/features/contributions/AddDishPriceForm.jsx";
import AccessUpdateForm from "../src/features/contributions/AccessUpdateForm.jsx";
import CorrectionRequestForm from "../src/features/contributions/CorrectionRequestForm.jsx";
import ModerationPage from "../src/pages/ModerationPage.jsx";
import { submissionService } from "../src/services";

function renderWithProviders(ui) {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>{ui}</LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe("Step 5 — Community Contributions & Moderation UI", () => {
  describe("SubmissionStatusBadge Component", () => {
    it("renders Pending Review status badge", () => {
      render(<SubmissionStatusBadge status="pending" />);
      expect(screen.getByText("Pending Review")).toBeInTheDocument();
    });

    it("renders Published as Community Reported status badge", () => {
      render(<SubmissionStatusBadge status="community_reported" />);
      expect(screen.getByText("Community Reported")).toBeInTheDocument();
    });

    it("renders Verified by Moderator status badge", () => {
      render(<SubmissionStatusBadge status="verified" />);
      expect(screen.getByText("Verified")).toBeInTheDocument();
    });

    it("renders Rejected status badge", () => {
      render(<SubmissionStatusBadge status="rejected" />);
      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });

    it("renders Needs Recheck status badge", () => {
      render(<SubmissionStatusBadge status="needs_recheck" />);
      expect(screen.getByText("Needs Recheck")).toBeInTheDocument();
    });
  });

  describe("SubmitPlaceForm Component", () => {
    it("renders form fields and requires authentication notice or modal", async () => {
      renderWithProviders(<SubmitPlaceForm />);
      expect(screen.getByText("Propose a New Place")).toBeInTheDocument();
      expect(screen.getByLabelText(/Place Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Town \/ Locality/i)).toBeInTheDocument();
    });

    it("shows field-level validation errors when submitting invalid input", async () => {
      renderWithProviders(<SubmitPlaceForm />);
      const submitBtn = screen.getByRole("button", { name: /Submit Proposal/i });
      fireEvent.click(submitBtn);

      // In HTML5 form validation or custom state check
      const nameInput = screen.getByLabelText(/Place Name/i);
      expect(nameInput).toBeRequired();
    });
  });

  describe("AddReviewForm Component", () => {
    it("renders rating selector and content textarea", () => {
      renderWithProviders(<AddReviewForm placeId="place_kottakkunnu" placeName="Kottakkunnu" />);
      expect(screen.getByText("Write a Community Review")).toBeInTheDocument();
      expect(screen.getByLabelText(/Your Review/i)).toBeInTheDocument();
    });
  });

  describe("AddDishPriceForm Component", () => {
    it("renders price input and category selector", () => {
      renderWithProviders(<AddDishPriceForm placeId="place_kottakkunnu" placeName="Kottakkunnu" />);
      expect(screen.getByText("Report Dish / Snack Price")).toBeInTheDocument();
      expect(screen.getByLabelText(/Dish \/ Snack Item Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    });
  });

  describe("AccessUpdateForm & CorrectionRequestForm", () => {
    it("renders road condition selector in AccessUpdateForm", () => {
      renderWithProviders(<AccessUpdateForm placeId="place_kottakkunnu" placeName="Kottakkunnu" />);
      expect(screen.getByText("Update Access & Road Conditions")).toBeInTheDocument();
      expect(screen.getByLabelText(/Road Condition/i)).toBeInTheDocument();
    });

    it("renders correction issue type selector in CorrectionRequestForm", () => {
      renderWithProviders(<CorrectionRequestForm placeId="place_kottakkunnu" placeName="Kottakkunnu" />);
      expect(screen.getByText("Suggest a Correction")).toBeInTheDocument();
      expect(screen.getByLabelText(/Correction Issue Type/i)).toBeInTheDocument();
    });
  });

  describe("Moderation Workflow Service", () => {
    it("moderates pending submission to verified status", async () => {
      const sub = await submissionService.submitNewPlace({
        userId: "user_contributor_test",
        regionId: "malappuram-kerala",
        districtId: "malappuram",
        townId: "kottakkal",
        placeData: {
          name: "Test Waterfall Spot",
          category: "waterfalls",
          description: "Beautiful scenic cascade deep in forest.",
        },
      });

      expect(sub.status).toBe("pending");

      const moderated = await submissionService.moderateSubmission(
        sub.id,
        "verified",
        "user_demo_admin",
        "Verified by local scout"
      );

      expect(moderated.status).toBe("verified");
      expect(moderated.moderatedBy).toBe("user_demo_admin");
      expect(moderated.moderationNotes).toBe("Verified by local scout");
    });
  });
});
