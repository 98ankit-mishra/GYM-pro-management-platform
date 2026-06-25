import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NoticeBar from "./NoticeBar";

describe("NoticeBar", () => {
  it("renders success notices", () => {
    render(<NoticeBar notice={{ type: "success", message: "Saved successfully." }} onDismiss={vi.fn()} />);

    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Saved successfully.")).toBeInTheDocument();
  });

  it("calls dismiss handler", () => {
    const onDismiss = vi.fn();
    render(<NoticeBar notice={{ type: "error", message: "Something failed." }} onDismiss={onDismiss} />);

    fireEvent.click(screen.getAllByRole("button", { name: /dismiss notice/i })[0]);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
