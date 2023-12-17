import { fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";

import { SelectCountryAreasField } from "./SelectCountryAreasField";

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

describe("SelectCountryAreasField component", () => {
  const countryAreaChoices = [
    { label: "Area 1", value: "area1" },
    { label: "Area 2", value: "area2" },
  ];

  it("renders the select field with options", () => {
    const { getByLabelText } = render(
      <SelectCountryAreasField
        disabled={false}
        countryAreaChoices={countryAreaChoices}
        refetchValidationRules={mockRefetchValidationRules}
      />
    );

    expect(getByLabelText("Country area")).toBeInTheDocument();
    expect(getByLabelText("Country area")).not.toBeDisabled();
  });

  it("triggers refetch and form validation on select change", async () => {
    const { getByLabelText } = render(
      <SelectCountryAreasField
        disabled={false}
        countryAreaChoices={countryAreaChoices}
        refetchValidationRules={mockRefetchValidationRules}
      />
    );

    const select = getByLabelText("Country area");
    fireEvent.change(select, { target: { value: countryAreaChoices[0].value } });

    await waitFor(() => {
      expect(mockRefetchValidationRules).toHaveBeenCalledWith({
        variables: {
          countryCode: "US",
          countryArea: countryAreaChoices[0].value,
        },
      });
    });
  });

  it("disables the select field when disabled prop is true", () => {
    const { getByLabelText } = render(
      <SelectCountryAreasField
        disabled={true}
        countryAreaChoices={countryAreaChoices}
        refetchValidationRules={mockRefetchValidationRules}
      />
    );

    expect(getByLabelText("Country area")).toBeDisabled();
  });
});
