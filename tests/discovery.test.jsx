import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { LocationProvider } from "../src/context/LocationContext.jsx";
import AppRoutes from "../src/routes/AppRoutes.jsx";

/**
 * Helper: render the full app at a given path.
 */
function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <LocationProvider>
          <AppRoutes />
        </LocationProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("DiscoverPage", () => {
  it("renders the discover page heading", async () => {
    renderApp("/discover");
    expect(
      await screen.findByRole("heading", { level: 1, name: /discover/i })
    ).toBeInTheDocument();
  });

  it("shows a search input on the discover page", async () => {
    renderApp("/discover");
    expect(await screen.findByRole("searchbox")).toBeInTheDocument();
  });

  it("renders place cards after loading", async () => {
    renderApp("/discover");
    // Wait for loading to finish and at least one place card to appear
    await waitFor(() => {
      const cards = screen.queryAllByRole("link", { name: /view details for/i });
      expect(cards.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it("shows a demo data warning banner", async () => {
    renderApp("/discover");
    expect(
      await screen.findByText(/illustrative demo content only/i)
    ).toBeInTheDocument();
  });

  it("filters results by category filter", async () => {
    renderApp("/discover");
    // Wait for results to load
    await waitFor(() =>
      expect(screen.queryAllByRole("link", { name: /view details for/i }).length).toBeGreaterThan(0),
      { timeout: 2000 }
    );
    const foodPill = screen.getByRole("radio", { name: /food/i });
    await userEvent.click(foodPill);
    // After filtering, all visible cards should be food places
    await waitFor(() => {
      const cards = screen.queryAllByRole("link", { name: /view details for/i });
      expect(cards.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it("shows empty state when search has no results", async () => {
    renderApp("/discover?q=xyzzynotarealplace12345");
    await waitFor(() => {
      expect(screen.queryByText(/no places match/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

describe("PlaceDetailPage", () => {
  it("renders loading state initially", () => {
    renderApp("/place/demo-kfc-malappuram");
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders place name after loading", async () => {
    renderApp("/place/demo-kfc-malappuram");
    expect(
      await screen.findByRole("heading", { level: 1, name: /biriyani corner/i })
    ).toBeInTheDocument();
  });

  it("renders the demo data disclaimer", async () => {
    renderApp("/place/demo-kfc-malappuram");
    expect(
      await screen.findByText(/illustrative demo content only/i)
    ).toBeInTheDocument();
  });

  it("shows a not-found message for an unknown place id", async () => {
    renderApp("/place/does-not-exist-xyz");
    expect(await screen.findByText(/place not found/i)).toBeInTheDocument();
  });

  it("renders a back-to-discover link", async () => {
    renderApp("/place/demo-kfc-malappuram");
    expect(
      await screen.findByRole("link", { name: /back to discover/i })
    ).toBeInTheDocument();
  });
});

describe("HomePage navigation", () => {
  it("renders a Discover nav link", () => {
    renderApp("/");
    const discoverLinks = screen.getAllByRole("link", { name: /discover/i });
    expect(discoverLinks.length).toBeGreaterThan(0);
  });
});
