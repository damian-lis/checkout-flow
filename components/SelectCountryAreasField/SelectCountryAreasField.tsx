"use client";

import { LazyQueryExecFunction } from "@apollo/client";
import React from "react";
import { useFormContext } from "react-hook-form";

import { AddressValidationRulesQuery, CountryCode, CountryDisplay } from "@/generated/graphql";
import { mappedAddressFieldsForAutocompletion } from "@/utils/address";

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
      name={mappedAddressFieldsForAutocompletion.countryArea}
      placeholder="Select a country area"
      options={countryAreaChoices}
      onChange={async ({ target: { value } }) => {
        const selectedCountryCode = getValues()[mappedAddressFieldsForAutocompletion.country] as CountryCode;
        setValue(mappedAddressFieldsForAutocompletion.countryArea, value);

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
