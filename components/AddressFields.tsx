"use client";

import { LazyQueryExecFunction } from "@apollo/client";
import React from "react";

import { AddressValidationRulesQuery, CountryCode, CountryDisplay } from "@/generated/graphql";
import { mappedAddressFieldsForAutocompletion } from "@/utils/address";

import { InputField, Option } from ".";
import { SelectCountryAreasField } from "./SelectCountryAreasField/SelectCountryAreasField";
import { SelectCountryField } from "./SelectCountryField";

// INFO: Tests for this file are not needed since they have been written for included components separately

interface AddressFieldsProps {
  disabled: boolean;
  countries?: CountryDisplay[] | null;
  countryAreaChoices: Option[];
  refetchValidationRules: LazyQueryExecFunction<
    AddressValidationRulesQuery,
    {
      countryCode: CountryCode;
      countryArea?: string | null;
    }
  >;
}

export const AddressFields = ({
  disabled,
  refetchValidationRules,
  countries,
  countryAreaChoices,
}: AddressFieldsProps) => (
  <>
    <InputField
      className="mt-5"
      disabled={disabled}
      label="Fist name"
      name={mappedAddressFieldsForAutocompletion.firstName}
      placeholder="First name"
    />
    <InputField
      disabled={disabled}
      label="Last name"
      name={mappedAddressFieldsForAutocompletion.lastName}
      placeholder="Last name"
    />
    <InputField
      disabled={disabled}
      label="Company name"
      name={mappedAddressFieldsForAutocompletion.companyName}
      placeholder="Company name"
    />
    <InputField
      disabled={disabled}
      label="Zip / postal codel"
      name={mappedAddressFieldsForAutocompletion.postalCode}
      placeholder="Zip / postal code"
    />
    <div className="flex gap-3.5">
      <div className="flex-grow">
        <InputField
          disabled={disabled}
          label="Address (street + house number)"
          name={mappedAddressFieldsForAutocompletion.streetAddress1}
          placeholder="Enter a street"
        />
      </div>
      <div className="mt-[18px] w-[86px]">
        <InputField
          disabled={disabled}
          type="number"
          name={mappedAddressFieldsForAutocompletion.streetNumber}
          placeholder="number"
        />
      </div>
    </div>
    <InputField disabled={disabled} label="City" name={mappedAddressFieldsForAutocompletion.city} placeholder="City" />
    <SelectCountryField disabled={disabled} refetchValidationRules={refetchValidationRules} countries={countries} />
    {countryAreaChoices?.length ? (
      <SelectCountryAreasField
        disabled={disabled}
        refetchValidationRules={refetchValidationRules}
        countryAreaChoices={countryAreaChoices}
      />
    ) : (
      <InputField
        disabled={disabled}
        label="Country area"
        name={mappedAddressFieldsForAutocompletion.countryArea}
        placeholder="Enter a country area"
      />
    )}
  </>
);
