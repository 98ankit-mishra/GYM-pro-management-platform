import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthLayer from "./AuthLayer";

describe("AuthLayer", () => {
  it("shows create owner account button only during setup on login screen", () => {
    render(
      <AuthLayer
        mode="login"
        setupRequired={true}
        onModeChange={vi.fn()}
        onLogin={vi.fn()}
        onSignup={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /create owner account/i })).toBeInTheDocument();
  });

  it("calls onModeChange when owner account button is clicked", () => {
    const onModeChange = vi.fn();

    render(
      <AuthLayer
        mode="login"
        setupRequired={true}
        onModeChange={onModeChange}
        onLogin={vi.fn()}
        onSignup={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: /create owner account/i })[0]);
    expect(onModeChange).toHaveBeenCalledWith("signup");
  });
});
