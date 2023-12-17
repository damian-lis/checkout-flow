import { fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";

import { SelectCountryField } from "./SelectCountryField";

jest.mock("react-hook-form", () => ({
  useFormContext: () => ({
    register: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn().mockReturnValue({ country: "US" }),
    trigger: jest.fn(),
    formState: { errors: {} },
  }),
}));

const mockRefetchValidationRules = jest.fn(() => Promise.resolve() as any);

describe("SelectCountryField component", () => {
  const countries = [
    { code: "US", country: "United States" },
    { code: "CA", country: "Canada" },
  ];

  it("renders the select field with country options", () => {
    const { getByLabelText } = render(
      <SelectCountryField disabled={false} countries={countries} refetchValidationRules={mockRefetchValidationRules} />
    );

    expect(getByLabelText("Country")).toBeInTheDocument();
    expect(getByLabelText("Country")).not.toBeDisabled();
  });

  it("triggers refetch and form validation on country select change", async () => {
    const { getByLabelText } = render(
      <SelectCountryField disabled={false} countries={countries} refetchValidationRules={mockRefetchValidationRules} />
    );

    const select = getByLabelText("Country");
    fireEvent.change(select, { target: { value: "US" } });

    await waitFor(() => {
      expect(mockRefetchValidationRules).toHaveBeenCalledWith({
        variables: {
          countryCode: "US",
        },
      });
    });
  });

  it("disables the select field when disabled prop is true", () => {
    const { getByLabelText } = render(
      <SelectCountryField disabled={true} countries={countries} refetchValidationRules={mockRefetchValidationRules} />
    );

    expect(getByLabelText("Country")).toBeDisabled();
  });
});
