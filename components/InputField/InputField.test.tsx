import { render, screen } from "@testing-library/react";
import React from "react";

import { InputField } from "./InputField";

jest.mock("react-hook-form", () => ({
  useFormContext: jest.fn(),
}));

const mockUseFormContext = require("react-hook-form").useFormContext;

describe("InputField component", () => {
  beforeEach(() => {
    mockUseFormContext.mockImplementation(() => ({
      register: jest.fn(),
      formState: { errors: {} },
    }));
  });

  it("renders input field", () => {
    render(<InputField name="name" />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays label when provided", () => {
    render(<InputField label="label" name="name" />);

    expect(screen.getByText("label")).toBeInTheDocument();
  });

  it("shows error message when there is an error", () => {
    mockUseFormContext.mockImplementation(() => ({
      register: jest.fn(),
      formState: { errors: { name: { message: "Error message" } } },
    }));
    render(<InputField name="name" />);

    expect(screen.getByText("Error message")).toBeInTheDocument();
  });
});
