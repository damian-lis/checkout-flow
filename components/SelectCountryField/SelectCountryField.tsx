"use client";

import { LazyQueryExecFunction } from "@apollo/client";
import React from "react";
import { useFormContext } from "react-hook-form";

import { AddressValidationRulesQuery, CountryCode, CountryDisplay } from "@/generated/graphql";
import { getCountriesToDisplay, mappedAddressFieldsForAutocompletion } from "@/utils/address";

import { SelectField } from "..";

interface SelectCountryFieldProps {
  disabled: boolean;
  countries?: CountryDisplay[] | null;
  refetchValidationRules: LazyQueryExecFunction<
    AddressValidationRulesQuery,
    {
      countryCode: CountryCode;
      countryArea?: string | null;
    }
  >;
}

export const SelectCountryField = ({ disabled, refetchValidationRules, countries }: SelectCountryFieldProps) => {
  const { setValue, trigger } = useFormContext();

  return (
    <SelectField
      disabled={disabled}
      label="Country"
      name="country"
      placeholder="Country"
      options={getCountriesToDisplay(countries)}
      onChange={async ({ target: { value } }) => {
        setValue(mappedAddressFieldsForAutocompletion.country, value);
        setValue(mappedAddressFieldsForAutocompletion.countryArea, "");

        await refetchValidationRules({
          variables: {
            countryCode: value as CountryCode,
          },
        });
        trigger();
      }}
    />
  );
};
