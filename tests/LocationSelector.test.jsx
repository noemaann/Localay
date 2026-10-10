import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LocationProvider } from "../src/context/LocationContext.jsx";
import LocationSelector from "../src/components/LocationSelector.jsx";

function renderSelector() {
  return render(
    <MemoryRouter>
      <LocationProvider>
        <LocationSelector />
      </LocationProvider>
    </MemoryRouter>
  );
}

describe("LocationSelector", () => {
  it("renders the trigger button with the default region label", () => {
    renderSelector();
    const button = screen.getByRole("button", { name: /malappuram/i });
    expect(button).toBeInTheDocument();
  });

  it("opens the dropdown when the trigger is clicked", async () => {
    renderSelector();
    const trigger = screen.getByRole("button", { name: /malappuram/i });
    await userEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("shows all regions in the dropdown", async () => {
    renderSelector();
    await userEvent.click(screen.getByRole("button", { name: /malappuram/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Malappuram")).toBeInTheDocument();
    expect(screen.getByText("Kozhikode")).toBeInTheDocument();
  });

  it("closes the dropdown when Escape is pressed", async () => {
    renderSelector();
    await userEvent.click(screen.getByRole("button", { name: /malappuram/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
