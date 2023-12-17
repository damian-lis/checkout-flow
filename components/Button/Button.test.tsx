import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { Button } from ".";

describe("Button component", () => {
  it("renders with correct text", () => {
    render(<Button>Hello</Button>);

    expect(screen.getByRole("button", { name: /hello/i })).toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    render(<Button loading>Hello</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    render(<Button loading>Hello</Button>);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("calls 'onClick' prop when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Hello</Button>);

    fireEvent.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
