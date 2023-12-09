"use client";

import { useLazyQuery, useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import {
  AddressValidationRulesDocument,
  AddressValidationRulesQueryVariables,
  Checkout,
  CheckoutShippingAddressUpdateDocument,
  CountryCode,
} from "@/generated/graphql";

import { Button, Input, Option, Select } from "../../components";
import { createSchema, FormValues, mappedFieldsForAutocompletion } from "./schema";

interface ShippingAddressProps {
  checkoutData: Checkout;
}

export const ShippingAddress = ({ checkoutData }: ShippingAddressProps) => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const [updateShippingAddress, { loading: updatingShippingAddress }] = useMutation(
    CheckoutShippingAddressUpdateDocument,
    {
      onCompleted: data => {
        const errorField = mappedFieldsForAutocompletion[data?.checkoutShippingAddressUpdate?.errors[0]?.field]; // TODO: to change;
        const errorMessage = data?.checkoutShippingAddressUpdate?.errors[0]?.message || undefined;

        if (errorField) {
          methods.setError(errorField, {
            message: errorMessage,
          });
          return;
        }

        setIsOpen(false);
        router.refresh();
      },
    }
  );

  const [countryAreaChoicesToDisplay, setCountryAreaChoicesToDisplay] = useState<Option[]>([]);

  const [fetchValidationRules, { data: validationRules }] = useLazyQuery(AddressValidationRulesDocument, {
    onCompleted: () => {
      const countryAreaChoices = validationRules?.addressValidationRules?.countryAreaChoices?.map(
        ({ raw, verbose }) => ({
          label: verbose!,
          value: raw!,
        })
      );
      if (!countryAreaChoices) return;
      setCountryAreaChoicesToDisplay(countryAreaChoices);
    },
  });

  const shippingAddress = useMemo(
    () => ({
      [mappedFieldsForAutocompletion.firstName]: checkoutData.shippingAddress?.firstName,
      [mappedFieldsForAutocompletion.lastName]: checkoutData.shippingAddress?.lastName,
      [mappedFieldsForAutocompletion.companyName]: checkoutData.shippingAddress?.companyName,
      [mappedFieldsForAutocompletion.postalCode]: checkoutData.shippingAddress?.postalCode,
      [mappedFieldsForAutocompletion.streetAddress1]: checkoutData.shippingAddress?.streetAddress1,
      [mappedFieldsForAutocompletion.streetNumber]: checkoutData.shippingAddress?.metadata?.find(
        ({ key }) => key === "streetNumber"
      )?.value,
      [mappedFieldsForAutocompletion.city]: checkoutData.shippingAddress?.city,
      [mappedFieldsForAutocompletion.country]: checkoutData.shippingAddress?.country?.code || "US",
      [mappedFieldsForAutocompletion.countryArea]:
        checkoutData.shippingAddress?.countryArea ||
        checkoutData.shippingAddress?.metadata?.find(({ key }) => key === "countryArea")?.value,
    }),
    [checkoutData]
  ) as any; // TODO to change

  const methods = useForm<FormValues>({
    resolver: zodResolver(createSchema(validationRules)),
    mode: "onChange",
    defaultValues: shippingAddress,
  });

  useEffect(() => {
    fetchValidationRules({
      variables: {
        countryCode: shippingAddress[mappedFieldsForAutocompletion.country] as CountryCode,
      },
    });
  }, [fetchValidationRules, shippingAddress]);

  useEffect(() => {
    methods.reset({
      ...shippingAddress,
    });
  }, [methods, shippingAddress]);

  const countriesToDisplay = useMemo(
    () =>
      checkoutData?.channel?.countries?.map(({ code, country }) => ({
        label: country,
        value: code,
      })),
    [checkoutData]
  );

  const isContactDetailsSectionCompleted = !!checkoutData.email;
  const isShippingAddressSectionCompleted = !!checkoutData.shippingAddress;

  useEffect(() => {
    setIsOpen(isContactDetailsSectionCompleted && !isShippingAddressSectionCompleted);
  }, [isContactDetailsSectionCompleted, isShippingAddressSectionCompleted]);

  const onSubmit = (address: FormValues) => {
    const { streetNumber, ...restAddress } = convertAddressToSend(address);
    updateShippingAddress({
      variables: {
        id: checkoutData.id,
        shippingAddress: {
          ...restAddress,
          country: restAddress.country as CountryCode,
          metadata: [
            {
              key: "streetNumber",
              value: String(streetNumber),
            },
            {
              key: "countryArea",
              value: restAddress.countryArea || "",
            },
          ],
        },
      },
    });
  };

  const handleCountryOrCountryAreaChange = async (value: string | CountryCode, withCountryArea?: boolean) => {
    let variables: AddressValidationRulesQueryVariables;

    if (withCountryArea) {
      const selectedCountryCode = methods.getValues()[mappedFieldsForAutocompletion.country] as CountryCode;
      methods.setValue(mappedFieldsForAutocompletion.countryArea, value);
      variables = {
        countryCode: selectedCountryCode,
        countryArea: value,
      };
    } else {
      methods.setValue(mappedFieldsForAutocompletion.country, value);
      methods.setValue(mappedFieldsForAutocompletion.countryArea, "");
      variables = {
        countryCode: value as CountryCode,
      };
    }

    await fetchValidationRules({
      variables,
    });
    methods.trigger();
  };

  return (
    <div className="relative mt-5 w-full max-w-sm rounded-md border border-normalGray p-6">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <h2 className="text-lg font-normal">Shipping Address</h2>
          <Image
            className={classNames(`absolute right-6 top-6 cursor-pointer`, {
              "rotate-0": isOpen,
              "rotate-180": !isOpen,
              hidden: !isContactDetailsSectionCompleted || updatingShippingAddress,
            })}
            src="/arrow.svg"
            alt="arrow"
            width="12"
            height="12"
            onClick={() => {
              setIsOpen(val => !val);
              methods.reset();
            }}
          />
          {isOpen ? (
            <>
              <Input
                className="mt-3"
                disabled={updatingShippingAddress}
                label="Fist name"
                name={mappedFieldsForAutocompletion.firstName}
                placeholder="First name"
              />
              <Input
                disabled={updatingShippingAddress}
                label="Last name"
                name={mappedFieldsForAutocompletion.lastName}
                placeholder="Last name"
              />
              <Input
                disabled={updatingShippingAddress}
                label="Company name"
                name={mappedFieldsForAutocompletion.companyName}
                placeholder="Company name"
              />
              <Input
                disabled={updatingShippingAddress}
                label="Zip / postal codel"
                name={mappedFieldsForAutocompletion.postalCode}
                placeholder="Zip / postal code"
              />
              <div className="flex gap-3.5">
                <div className="flex-grow">
                  <Input
                    disabled={updatingShippingAddress}
                    label="Address (street + house number)"
                    name={mappedFieldsForAutocompletion.streetAddress1}
                    placeholder="Enter a street"
                  />
                </div>
                <div className="mt-[18px] w-[86px]">
                  <Input
                    disabled={updatingShippingAddress}
                    type="number"
                    name={mappedFieldsForAutocompletion.streetNumber}
                    placeholder="number"
                  />
                </div>
              </div>
              <Input
                disabled={updatingShippingAddress}
                label="City"
                name={mappedFieldsForAutocompletion.city}
                placeholder="City"
              />
              <Select
                disabled={updatingShippingAddress}
                label="Country"
                name="country"
                placeholder="Country"
                options={countriesToDisplay}
                onChange={event => handleCountryOrCountryAreaChange(event.target.value)}
              />
              {countryAreaChoicesToDisplay?.length ? (
                <Select
                  disabled={updatingShippingAddress}
                  label="Country area"
                  name={mappedFieldsForAutocompletion.countryArea}
                  placeholder="Select a country area"
                  options={countryAreaChoicesToDisplay}
                  onChange={event => handleCountryOrCountryAreaChange(event.target.value, true)}
                />
              ) : (
                <Input
                  disabled={updatingShippingAddress}
                  label="Country area"
                  name={mappedFieldsForAutocompletion.countryArea}
                  placeholder="Enter a country area"
                />
              )}
              <div className="text-right">
                <Button
                  fullWidth
                  loading={updatingShippingAddress}
                  disabled={
                    !methods.formState.isDirty ||
                    !!Object.entries(methods.formState.errors).length ||
                    updatingShippingAddress
                  }
                >
                  Continue to paymemt
                </Button>
              </div>
            </>
          ) : checkoutData.shippingAddress ? (
            <div className="mt-5 break-words text-xs text-normalGray">
              {shippingAddress[mappedFieldsForAutocompletion.firstName]}{" "}
              {shippingAddress[mappedFieldsForAutocompletion.lastName]}{" "}
              {shippingAddress[mappedFieldsForAutocompletion.companyName]} <br />
              {shippingAddress[mappedFieldsForAutocompletion.city] &&
                `${shippingAddress[mappedFieldsForAutocompletion.city]}, `}{" "}
              {shippingAddress[mappedFieldsForAutocompletion.streetAddress1]}{" "}
              {shippingAddress[mappedFieldsForAutocompletion.streetNumber]}{" "}
              {shippingAddress[mappedFieldsForAutocompletion.countryArea]} <br />
              {
                countriesToDisplay?.find(
                  ({ value }) => value === shippingAddress[mappedFieldsForAutocompletion.country]
                )?.label
              }
            </div>
          ) : null}
        </form>
      </FormProvider>
    </div>
  );
};

type InvertedMappedFields = {
  [K in keyof typeof mappedFieldsForAutocompletion as (typeof mappedFieldsForAutocompletion)[K]]: K;
};

export const mappedFieldsFromAutocompletion = Object.entries(mappedFieldsForAutocompletion).reduce(
  (acc, [key, value]) => {
    acc[value] = key; // TODO to change
    return acc;
  },
  {} as InvertedMappedFields
);

type MappedFieldsFromAutocompletion = typeof mappedFieldsFromAutocompletion;
type AutocompletionFieldKeys = keyof MappedFieldsFromAutocompletion;

type FormValuesToSend = {
  [K in MappedFieldsFromAutocompletion[AutocompletionFieldKeys]]: K extends "streetNumber" ? number : string;
};

const convertAddressToSend = (address: FormValues) =>
  Object.entries(address).reduce((acc, curr) => {
    const field = curr[0] as AutocompletionFieldKeys;
    const value = curr[1];

    acc[mappedFieldsFromAutocompletion[field]] = value; // TODO to change
    return acc;
  }, {} as FormValuesToSend);
