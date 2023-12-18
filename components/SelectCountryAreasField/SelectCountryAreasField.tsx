"use client";

import { LazyQueryExecFunction } from "@apollo/client";
import React from "react";
import { useFormContext } from "react-hook-form";

import { AddressValidationRulesQuery, CountryCode, CountryDisplay } from "@/generated/graphql";
import { mappedDefaultToAutocompletionFormat } from "@/utils/address";

import { Option, SelectField } from "..";

interface SelectCountryAreasFieldProps {
  disabled: boolean;
  countryAreaChoices: Option[];
  refetchValidationRules: LazyQueryExecFunction<
    AddressValidationRulesQuery,
    {
      countryCode: CountryCode;
      countryArea?: string | null;
    }
  >;
}

export const SelectCountryAreasField = ({
  disabled,
  refetchValidationRules,
  countryAreaChoices,
}: SelectCountryAreasFieldProps) => {
  const { getValues, setValue, trigger } = useFormContext();

  return (
    <SelectField
      disabled={disabled}
      label="Country area"
      name={mappedDefaultToAutocompletionFormat.countryArea}
      placeholder="Select a country area"
      options={countryAreaChoices}
      onChange={async ({ target: { value } }) => {
        const selectedCountryCode = getValues()["country"] as CountryCode;
        setValue(mappedDefaultToAutocompletionFormat.countryArea, value);

        await refetchValidationRules({
          variables: {
            countryCode: selectedCountryCode,
            countryArea: value,
          },
        });
        trigger();
      }}
    />
  );
};
