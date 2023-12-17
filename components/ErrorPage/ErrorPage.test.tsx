import { render, screen } from "@testing-library/react";
import React from "react";

import { ErrorPage } from "./ErrorPage";

describe("ErrorPage component", () => {
  it("renders with provided title", () => {
    render(<ErrorPage title="Error" />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Error");
  });

  it("contains link to go back to the initial page", () => {
    render(<ErrorPage title="Error" />);
    const linkElement = screen.getByText("Go back to the initial page");

    expect(linkElement).toBeInTheDocument();
    expect(linkElement.closest("a")).toHaveAttribute("href", "/");
  });
});
