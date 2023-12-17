import { render, screen } from "@testing-library/react";

import { CountryDisplay } from "@/generated/graphql";

import { addressDisplay, convertValuesToSend, getCountriesToDisplay, mapAddressFieldsForAutocompletion } from ".";

const address = {
  firstName: "John",
  lastName: "Doe",
  companyName: "JD Inc.",
  city: "New York",
  streetAddress1: "123 Main St",
  streetNumber: "4A",
  countryArea: "NY",
  country: { code: "US" } as CountryDisplay,
  metadata: [{ key: "streetNumber", value: "4A" }],
  postalCode: "99501",
};

const addressAutocompleteFormat = {
  "given-name": "John",
  "family-name": "Doe",
  organization: "JD Inc.",
  "postal-code": "99501",
  "street-address": "123 Main St",
  "address-line1": "4A",
  "address-level2": "New York",
  country: "US",
  "address-level1": "NY",
};

const addressFormatToSend = {
  firstName: "John",
  lastName: "Doe",
  companyName: "JD Inc.",
  postalCode: "99501",
  streetAddress1: "123 Main St",
  streetNumber: "4A",
  city: "New York",
  country: "US",
  countryArea: "NY",
};

describe("addressDisplay util", () => {
  it("should format the address correctly without countries list", () => {
    render(addressDisplay(address));

    expect(screen.getByText(/John/)).toBeInTheDocument();
    expect(screen.getByText(/Doe/)).toBeInTheDocument();
    expect(screen.getByText(/JD Inc./)).toBeInTheDocument();
    expect(screen.getByText(/New York,/)).toBeInTheDocument();
    expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
    expect(screen.getByText(/4A/)).toBeInTheDocument();
    expect(screen.getByText(/NY/)).toBeInTheDocument();
  });

  it("should display the United States label", () => {
    const countriesToDisplay = [{ label: "United States", value: "US" }];
    render(addressDisplay(address, countriesToDisplay));

    expect(screen.getByText(/United States/)).toBeInTheDocument();
  });
});

describe("getCountriesToDisplay util", () => {
  it("should map countries to display format", () => {
    const countries = [
      { code: "US", country: "United States" },
      { code: "CA", country: "Canada" },
    ];

    const result = getCountriesToDisplay(countries);

    expect(result).toEqual([
      { label: "United States", value: "US" },
      { label: "Canada", value: "CA" },
    ]);
  });

  it("should return undefined if no countries are provided", () => {
    const result = getCountriesToDisplay(null);
    expect(result).toEqual(undefined);
  });
});

describe("mapAddressForAutocompletion", () => {
  it("should map the address to autocomplete format", () => {
    const result = mapAddressFieldsForAutocompletion(address);

    expect(result).toEqual(addressAutocompleteFormat);
  });
});

describe("convertValuesToSend util", () => {
  it("should convert form values from autocomplete format to the expected 'send' format", () => {
    const convertedValuesToSend = convertValuesToSend(addressAutocompleteFormat);

    expect(convertedValuesToSend).toEqual(addressFormatToSend);
  });

  it("should leave values that do not have a mapped field in the same format", () => {
    const nonAddressFields = {
      cardName: "1234 1234 1234 1234",
      expiryDate: "03/24",
      cvc: "123",
    };

    const convertedValuesToSend = convertValuesToSend(nonAddressFields);

    expect(convertedValuesToSend).toEqual(nonAddressFields);
  });
});
