"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useContext, useEffect, useMemo, useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button, ErrorNotification, Overview } from "@/components";
import { AddressFields } from "@/components/AddressFields";
import { CheckoutContext } from "@/components/CheckoutContext";
import { Section } from "@/components/Section";
import { CheckoutDeliveryMethodUpdateDocument, CheckoutShippingAddressUpdateDocument } from "@/generated/graphql";
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
  onlyOverview?: boolean;
}

export const ShippingAddress = ({ onlyOverview = false }: ShippingAddressProps) => {
  const [pending, startTransition] = useTransition();
  const { checkoutData, setCheckoutData } = useContext(CheckoutContext)!; //  I've added '!' since the 'checkoutData' object is available here for sure (see checking in the page component)
  const [updateShippingAddress] = useMutation(CheckoutShippingAddressUpdateDocument);
  const [updateDeliveryMethod] = useMutation(CheckoutDeliveryMethodUpdateDocument);

  const shouldExpand = !!checkoutData.email && !checkoutData.shippingAddress;
  const [isExpanded, setIsExpanded] = useState(shouldExpand && !onlyOverview);

  const [generalErrorMsg, setGeneralErrorMsg] = useState("");

  const shippingAddress = useMemo(() => getAddressAutocompletionFormat(checkoutData.shippingAddress), [checkoutData]);

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
    startTransition(async () => {
      const { streetNumber, ...restAddress } = getDefaultFormat(address);

      const updateShippingAddressData = await updateShippingAddress({
        variables: {
          shippingAddress: {
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
          id: checkoutData.id,
        },
      });

      if (!!updateShippingAddressData.errors?.length)
        return setGeneralErrorMsg(
          `Something went wrong, try again later. Error: ${updateShippingAddressData.errors[0].message}`
        );

      const data = updateShippingAddressData?.data?.checkoutShippingAddressUpdate;

      const errorField = data?.errors[0]?.field as AddressFieldDefaultFormat;
      const errorMessage = data?.errors[0]?.message;

      if (errorField && errorMessage) {
        methods.setError(mappedDefaultToAutocompletionFormat[errorField], {
          message: errorMessage,
        });
        return;
      }

      const { shippingMethods, id } = data?.checkout || {};
      if (!shippingMethods?.length || !id) return setGeneralErrorMsg("No shipping methods to choose.");

      const { errors: updateDeliveryMethodGqlErrors, data: updateDeliveryMethodData } = await updateDeliveryMethod({
        variables: {
          deliveryMethodId: shippingMethods[0].id,
          id,
        },
      });

      if (
        updateDeliveryMethodGqlErrors?.length ||
        updateDeliveryMethodData?.checkoutDeliveryMethodUpdate?.errors?.length
      )
        return setGeneralErrorMsg(
          `Something went wrong, try again later. Error: ${
            updateDeliveryMethodGqlErrors?.[0].message ||
            updateDeliveryMethodData?.checkoutDeliveryMethodUpdate?.errors[0].message
          }`
        );

      setCheckoutData(updateDeliveryMethodData?.checkoutDeliveryMethodUpdate?.checkout!);
      setIsExpanded(false);
    });
  };

  return (
    <Section
      disabled={onlyOverview || !checkoutData.email || pending}
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
                    disabled={pending}
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
                      loading={pending}
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
                {addressDisplay(checkoutData.shippingAddress, getCountriesToDisplay(checkoutData.channel.countries))}
              </Overview>
            )
          )}
        </>
      }
    />
  );
};
