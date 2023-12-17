"use client";

import { LazyQueryExecFunction } from "@apollo/client";
import React from "react";
import { useFormContext } from "react-hook-form";

import { AddressValidationRulesQuery, CountryCode, CountryDisplay } from "@/generated/graphql";
import { getCountriesToDisplay, mappedFieldsForAutocompletion } from "@/utils/address";

import { InputField, Option, SelectField } from ".";

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
}: AddressFieldsProps) => {
  const { getValues, setValue, trigger } = useFormContext();

  return (
    <>
      <InputField
        className="mt-5"
        disabled={disabled}
        label="Fist name"
        name={mappedFieldsForAutocompletion.firstName}
        placeholder="First name"
      />
      <InputField
        disabled={disabled}
        label="Last name"
        name={mappedFieldsForAutocompletion.lastName}
        placeholder="Last name"
      />
      <InputField
        disabled={disabled}
        label="Company name"
        name={mappedFieldsForAutocompletion.companyName}
        placeholder="Company name"
      />
      <InputField
        disabled={disabled}
        label="Zip / postal codel"
        name={mappedFieldsForAutocompletion.postalCode}
        placeholder="Zip / postal code"
      />
      <div className="flex gap-3.5">
        <div className="flex-grow">
          <InputField
            disabled={disabled}
            label="Address (street + house number)"
            name={mappedFieldsForAutocompletion.streetAddress1}
            placeholder="Enter a street"
          />
        </div>
        <div className="mt-[18px] w-[86px]">
          <InputField
            disabled={disabled}
            type="number"
            name={mappedFieldsForAutocompletion.streetNumber}
            placeholder="number"
          />
        </div>
      </div>
      <InputField disabled={disabled} label="City" name={mappedFieldsForAutocompletion.city} placeholder="City" />
      <SelectField
        disabled={disabled}
        label="Country"
        name="country"
        placeholder="Country"
        options={getCountriesToDisplay(countries)}
        onChange={async ({ target: { value } }) => {
          setValue(mappedFieldsForAutocompletion.country, value);
          setValue(mappedFieldsForAutocompletion.countryArea, "");

          await refetchValidationRules({
            variables: {
              countryCode: value as CountryCode,
            },
          });
          trigger();
        }}
      />
      {countryAreaChoices?.length ? (
        <SelectField
          disabled={disabled}
          label="Country area"
          name={mappedFieldsForAutocompletion.countryArea}
          placeholder="Select a country area"
          options={countryAreaChoices}
          onChange={async ({ target: { value } }) => {
            const selectedCountryCode = getValues()[mappedFieldsForAutocompletion.country] as CountryCode;
            setValue(mappedFieldsForAutocompletion.countryArea, value);

            await refetchValidationRules({
              variables: {
                countryCode: selectedCountryCode,
                countryArea: value,
              },
            });
            trigger();
          }}
        />
      ) : (
        <InputField
          disabled={disabled}
          label="Country area"
          name={mappedFieldsForAutocompletion.countryArea}
          placeholder="Enter a country area"
        />
      )}
    </>
  );
};
