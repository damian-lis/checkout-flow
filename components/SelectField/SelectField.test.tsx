import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { SelectField } from "./SelectField";

jest.mock("react-hook-form", () => ({
  useFormContext: jest.fn(),
}));

const mockUseFormContext = require("react-hook-form").useFormContext;

jest.mock("next/image", () => ({
  __esModule: true,
  default: () => "Image",
}));

describe("SelectField component", () => {
  const mockOptions = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
  ];

  beforeEach(() => {
    mockUseFormContext.mockImplementation(() => ({
      register: jest.fn(),
      setValue: jest.fn(),
      getValues: jest.fn().mockReturnValue({}),
      formState: { errors: {} },
    }));
  });

  it("renders select field with options", () => {
    render(<SelectField name="name" options={mockOptions} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getAllByRole("option").length).toBe(mockOptions.length + 1); // +1 for the placeholder option
  });

  it("selects an option and updates the display", () => {
    render(<SelectField name="testSelect" options={mockOptions} placeholder="Select an option" />);

    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(selectElement, { target: { value: "2" } });

    expect(selectElement.value).toBe("2");
  });

  it("displays label when provided", () => {
    const label = "label";
    render(<SelectField label={label} name="testSelect" options={mockOptions} />);
    const selectElement = screen.getByLabelText(label);

    expect(selectElement).toBeInTheDocument();
    expect(selectElement.tagName).toBe("SELECT");
  });

  it("shows error message when there is an error", () => {
    mockUseFormContext.mockImplementation(() => ({
      register: jest.fn(),
      setValue: jest.fn(),
      getValues: jest.fn().mockReturnValue({}),
      formState: { errors: { testSelect: { message: "Error message" } } },
    }));

    render(<SelectField name="testSelect" options={mockOptions} />);

    expect(screen.getByText("Error message")).toBeInTheDocument();
  });
});
