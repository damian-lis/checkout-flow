"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { checkoutComplete, paymentCreate, updateBillingAddress } from "@/app/actions";
import { AddressFields, Button, ErrorNotification, Overview, SelectField } from "@/components";
import { Section } from "@/components/Section";
import {
  AddressFieldsFragment,
  CheckoutBillingAddressUpdateMutation,
  CheckoutFieldsFragment,
  CountryCode,
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

import { CardNumberField, CvcField, ExpiryDateField } from "./CardDetailsFields";
import { AddressSchema as FormValuesSchema, createSchema } from "./schema";

const defaultPaymentCountry = "NL" as CountryCode;
const defaultBillingCountry = "US" as CountryCode;

const mappedPaymentGateways: Record<string, string> = {
  "mirumee.payments.dummy": "Mirumee Dummy Payment",
};

const selectedPaymentGatewayId = "mirumee.payments.dummy";

interface PaymentProps {
  checkoutData: CheckoutFieldsFragment;
  onlyOverview?: boolean;
  orderPaymentGateway?: string;
}

export const Payment = ({ checkoutData, orderPaymentGateway, onlyOverview = false }: PaymentProps) => {
  const router = useRouter();

  const [pending, startTransition] = useTransition();
  const [showAddressForm, setShowAddressForm] = useState(!!checkoutData.billingAddress);

  const shouldExpand = !!checkoutData.shippingAddress;
  const [isExpanded, setIsExpanded] = useState(shouldExpand && !onlyOverview);

  useEffect(() => {
    setIsExpanded(shouldExpand && !onlyOverview);
  }, [shouldExpand, onlyOverview]);

  const [generalErrorMsg, setGeneralErrorMsg] = useState("");

  const shippingAddress = useMemo(() => getAddressAutocompletionFormat(checkoutData.shippingAddress), [checkoutData]);

  const { validationRules, countryAreaChoices, refetchValidationRules } = useValidationRules(
    showAddressForm ? defaultBillingCountry : shippingAddress?.country,
    { skip: onlyOverview || !shouldExpand || !showAddressForm }
  );

  const methods = useForm<FormValuesSchema>({
    resolver: zodResolver(createSchema(validationRules)),
    mode: "onChange",
  });

  useEffect(() => {
    methods.reset(shippingAddress);
  }, [methods, shippingAddress]);

  const handleSubmit = async (values: FormValuesSchema) => {
    startTransition(async () => {
      const { streetNumber, cardNumber, expiryDate, cvc, paymentCountry, ...address } = getDefaultFormat(values);

      const updateBillingAddressData = await updateBillingAddress(
        {
          ...address,
          country: address?.country as CountryCode,
          metadata: [
            {
              key: "streetNumber",
              value: String(streetNumber),
            },
            {
              key: "countryArea",
              value: address.countryArea || "",
            },
          ],
        },
        checkoutData.id
      );

      if (!!updateBillingAddressData.errors?.length)
        return setGeneralErrorMsg(
          `Something went wrong, try again later. Error: ${updateBillingAddressData.errors[0].message}`
        );

      const checkoutBillingAddressUpdateData = updateBillingAddressData?.data?.checkoutBillingAddressUpdate;

      const errorField = checkoutBillingAddressUpdateData?.errors[0]?.field as AddressFieldDefaultFormat;
      const errorMessage = checkoutBillingAddressUpdateData?.errors[0]?.message;

      if (errorField) {
        methods.setError(mappedDefaultToAutocompletionFormat[errorField], {
          message: errorMessage || undefined,
        });
        return;
      }

      if (!checkoutData.availablePaymentGateways.some(gateway => gateway.id === selectedPaymentGatewayId))
        return setGeneralErrorMsg(`The ${mappedPaymentGateways[selectedPaymentGatewayId]} is not avaiable.`);

      const paymentCreateData = await paymentCreate(
        checkoutData.totalPrice.gross.amount,
        selectedPaymentGatewayId,
        cardNumber!.trim(),
        checkoutData.id
      );

      const updatedCheckoutData = paymentCreateData?.data?.checkoutPaymentCreate?.checkout;

      if (
        paymentCreateData.errors?.length ||
        !paymentCreateData?.data?.checkoutPaymentCreate?.payment ||
        paymentCreateData?.data?.checkoutPaymentCreate?.errors.length ||
        !updatedCheckoutData
      )
        return setGeneralErrorMsg(
          `Something went wrong, try again later. Error: ${
            paymentCreateData.errors?.length
              ? paymentCreateData.errors[0].message
              : paymentCreateData?.data?.checkoutPaymentCreate?.errors.length
              ? paymentCreateData?.data?.checkoutPaymentCreate?.errors[0].message
              : "Payment was not created."
          }`
        );

      const stringifiedCheckoutData = JSON.stringify({
        ...paymentCreateData.data.checkoutPaymentCreate.checkout,
        channel: {
          countries: [updatedCheckoutData.shippingAddress?.country, updatedCheckoutData.billingAddress?.country].filter(
            Boolean
          ),
        },
      });

      const checkoutCompleteData = await checkoutComplete(
        [{ key: "checkoutData", value: stringifiedCheckoutData }], // 'stringifiedCheckoutData' is saved as metadata for order details
        checkoutData.id
      );

      if (!!checkoutCompleteData.errors?.length || !checkoutCompleteData.data?.checkoutComplete?.order?.id) {
        return setGeneralErrorMsg(
          `Something went wrong, try again later. ${
            checkoutCompleteData.errors ? `Error: ${checkoutCompleteData.errors}` : "No order created."
          }`
        );
      }

      router.push(`/order/${checkoutCompleteData.data.checkoutComplete?.order?.id}`);
    });
  };

  return (
    <Section
      disabled={onlyOverview || !shouldExpand || pending}
      title="Payment"
      onArrowClick={() => setIsExpanded(v => !v)}
      isArrowUp={isExpanded}
      content={
        isExpanded ? (
          <div className="mt-6">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(handleSubmit)}>
                <div className="mb-5">
                  <CardNumberField disabled={pending} />
                  <div className="flex gap-5">
                    <div>
                      <ExpiryDateField disabled={pending} />
                    </div>
                    <div>
                      <CvcField disabled={pending} />
                    </div>
                  </div>
                </div>
                <SelectField
                  defaultValue={defaultPaymentCountry}
                  disabled={pending}
                  label="Country"
                  name="paymentCountry"
                  placeholder="Country"
                  options={getCountriesToDisplay(checkoutData.channel.countries)}
                />
                <label className="mb-1.5 mt-6 flex w-max cursor-pointer gap-1.5 whitespace-nowrap align-middle text-xs text-darkGray">
                  <input
                    disabled={pending}
                    checked={showAddressForm}
                    type="checkbox"
                    onChange={() => {
                      setShowAddressForm(v => !v);
                      const { cardNumber, expiryDate, cvc, paymentCountry } = methods.getValues();

                      const emptyAddress = getAddressAutocompletionFormat();

                      methods.reset({
                        cardNumber,
                        expiryDate,
                        cvc,
                        paymentCountry,
                        ...(showAddressForm ? shippingAddress : emptyAddress),
                      });
                    }}
                  />
                  Add billing address
                </label>
                {showAddressForm && (
                  <AddressFields
                    disabled={pending}
                    countries={checkoutData.channel.countries}
                    countryAreaChoices={countryAreaChoices}
                    refetchValidationRules={refetchValidationRules}
                  />
                )}
                {generalErrorMsg && (
                  <ErrorNotification message={generalErrorMsg} onClose={() => setGeneralErrorMsg("")} />
                )}
                <div className="mt-5 text-right">
                  <Button
                    fullWidth
                    loading={pending}
                    disabled={!methods.getValues()["cardNumber"] || !!Object.entries(methods.formState.errors).length}
                  >
                    Pay
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        ) : (
          <>
            {!!orderPaymentGateway && <Overview>Payed with {mappedPaymentGateways[orderPaymentGateway]}</Overview>}
            {checkoutData.billingAddress && (
              <>
                <h2 className="mt-6 text-lg font-normal">Billing Address</h2>
                <Overview>
                  {addressDisplay(checkoutData.billingAddress, getCountriesToDisplay(checkoutData.channel.countries))}
                </Overview>
              </>
            )}
          </>
        )
      }
    />
  );
};
