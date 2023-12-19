"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { updateDeliveryMethod, updateShippingAddress } from "@/app/actions";
import { Button, ErrorNotification, Overview } from "@/components";
import { AddressFields } from "@/components/AddressFields";
import { Section } from "@/components/Section";
import {
  AddressFieldsFragment,
  CheckoutFieldsFragment,
  CheckoutShippingAddressUpdate,
  CheckoutShippingAddressUpdateMutation,
} from "@/generated/graphql";
import { useValidationRules } from "@/hooks";
import {
  addressDisplay,
  AddressFieldDefaultFormat,
  getAddressAutocompletionFormat,
  getCountriesToDisplay,
  getDefaultFormat,
  mappedDefaultToAutocompletionFormat,
} from "@/utils";

import { AddressSchema, createSchema } from "./schema";

interface ShippingAddressProps {
  checkoutData: CheckoutFieldsFragment;
  onlyOverview?: boolean;
}

export const ShippingAddress = ({ checkoutData, onlyOverview = false }: ShippingAddressProps) => {
  const [updating, setUpdating] = useState(false);

  const shouldExpand = !!checkoutData.email && !checkoutData.shippingAddress;
  const [isExpanded, setIsExpanded] = useState(shouldExpand && !onlyOverview);

  const [generalErrorMsg, setGeneralErrorMsg] = useState("");

  const shippingAddress = useMemo(
    () => getAddressAutocompletionFormat(checkoutData.shippingAddress as AddressFieldsFragment),
    [checkoutData]
  );

  const { validationRules, countryAreaChoices, refetchValidationRules } = useValidationRules(shippingAddress.country, {
    skip: onlyOverview || !checkoutData.email,
  });

  const methods = useForm<AddressSchema>({
    resolver: zodResolver(createSchema(validationRules)),
    mode: "onChange",
  });

  useEffect(() => {
    methods.reset({ ...shippingAddress, country: shippingAddress.country });
  }, [methods, shippingAddress, shippingAddress.country]);

  useEffect(() => {
    setIsExpanded(shouldExpand);
  }, [shouldExpand]);

  const handleSubmit = async (address: AddressSchema) => {
    const { streetNumber, ...restAddress } = getDefaultFormat(address);

    setUpdating(true);
    const updateShippingAddressData = await updateShippingAddress(
      {
        ...restAddress,
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
      checkoutData.id
    );
    setUpdating(false);

    if (!!updateShippingAddressData.errors?.length) return setGeneralErrorMsg("Something went wrong, try again later");

    const data = (updateShippingAddressData?.data as CheckoutShippingAddressUpdateMutation)
      ?.checkoutShippingAddressUpdate;

    const errorField = data?.errors[0]?.field as AddressFieldDefaultFormat;
    const errorMessage = data?.errors[0]?.message;

    if (errorField) {
      methods.setError(mappedDefaultToAutocompletionFormat[errorField], {
        message: errorMessage || undefined,
      });
      return;
    }

    const { shippingMethods, id } = (data as CheckoutShippingAddressUpdate)?.checkout || {};
    if (!shippingMethods?.length || !id) return;

    setUpdating(true);
    const { errors: updateDeliveryMethodGqlErrors } = await updateDeliveryMethod(shippingMethods[0].id, id);
    setUpdating(false);

    if (updateDeliveryMethodGqlErrors?.length) return setGeneralErrorMsg("Something went wrong, try again later");

    setIsExpanded(false);
  };

  return (
    <Section
      disabled={onlyOverview || !checkoutData.email || updating}
      title="Shipping Address"
      onArrowClick={() => setIsExpanded(v => !v)}
      isArrowUp={isExpanded}
      content={
        <>
          {isExpanded ? (
            <div className="mt-6">
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(handleSubmit)}>
                  <AddressFields
                    disabled={updating}
                    countries={checkoutData.channel.countries}
                    countryAreaChoices={countryAreaChoices}
                    refetchValidationRules={refetchValidationRules}
                  />
                  {generalErrorMsg && (
                    <ErrorNotification message={generalErrorMsg} onClose={() => setGeneralErrorMsg("")} />
                  )}
                  <div className="mt-5 text-right">
                    <Button
                      fullWidth
                      loading={updating}
                      disabled={!methods.formState.isDirty || !!Object.entries(methods.formState.errors).length}
                    >
                      Continue to payment
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </div>
          ) : (
            checkoutData.shippingAddress && (
              <Overview>
                {addressDisplay(
                  checkoutData.shippingAddress as AddressFieldsFragment,
                  getCountriesToDisplay(checkoutData.channel.countries)
                )}
              </Overview>
            )
          )}
        </>
      }
    />
  );
};
