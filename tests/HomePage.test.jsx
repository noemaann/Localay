import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LocationProvider } from "../src/context/LocationContext.jsx";
import AppRoutes from "../src/routes/AppRoutes.jsx";

/**
 * Helper: render AppRoutes inside the providers it needs.
 */
function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocationProvider>
        <AppRoutes />
      </LocationProvider>
    </MemoryRouter>
  );
}

describe("Landing page", () => {
  it("shows the LOCALAY brand name", () => {
    renderApp();
    // Brand appears in header and footer — find at least one
    const brand = screen.getAllByText(/LOCALAY/i);
    expect(brand.length).toBeGreaterThan(0);
  });

  it("shows the main heading", () => {
    renderApp();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /places locals actually love/i,
      })
    ).toBeInTheDocument();
  });

  it("shows the launch region badge using the default region label", () => {
    renderApp();
    // The badge reads "Now in Malappuram, Kerala" (driven by context default)
    expect(screen.getByText(/now in malappuram/i)).toBeInTheDocument();
  });

  it("renders the search input", () => {
    renderApp();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("renders the main navigation landmark", () => {
    renderApp();
    expect(screen.getByRole("navigation", { name: /main navigation/i })).toBeInTheDocument();
  });
});
