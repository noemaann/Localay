import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "../src/routes/AppRoutes.jsx";

describe("Landing page", () => {
  it("shows the LOCALAY name and product description", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText("LOCALAY", { selector: "span" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /places locals actually love/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/launching first in malappuram/i)).toBeInTheDocument();
  });
});
