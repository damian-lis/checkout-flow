"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { AddressFields, Button, ErrorNotification, Overview, SelectField } from "@/components";
import { Section } from "@/components/Section";
import {
  AddressFieldsFragment,
  CheckoutBillingAddressUpdateDocument,
  CheckoutBillingAddressUpdateMutation,
  CheckoutCompleteDocument,
  CheckoutFieldsFragment,
  CheckoutPaymentCreateDocument,
  CountryCode,
} from "@/generated/graphql";
import { useValidationRules } from "@/hooks";
import {
  addressDisplay,
  AddressFormFieldsType,
  convertValuesToSend,
  getCountriesToDisplay,
  mapAddressFieldsForAutocompletion,
  mappedAddressFieldsForAutocompletion,
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

  const [showAddressForm, setShowAddressForm] = useState(!!checkoutData.billingAddress);
  const [redirecting, setRedirecting] = useState(false);

  const isReady = !!checkoutData.shippingAddress;
  const [isExpanded, setIsExpanded] = useState(isReady && !onlyOverview);

  useEffect(() => {
    setIsExpanded(isReady && !onlyOverview);
  }, [isReady, onlyOverview]);

  const [paymentCreate, { loading: creatingPayment }] = useMutation(CheckoutPaymentCreateDocument);
  const [checkoutComplete, { loading: completingCheckout }] = useMutation(CheckoutCompleteDocument);

  const [generalErrorMsg, setGeneralErrorMsg] = useState("");

  const [updateBillingAddress, { loading: updatingBillingAddress }] = useMutation(CheckoutBillingAddressUpdateDocument);

  const shippingAddress = useMemo(
    () => mapAddressFieldsForAutocompletion(checkoutData.shippingAddress as AddressFieldsFragment),
    [checkoutData]
  );

  const { validationRules, countryAreaChoices, refetchValidationRules } = useValidationRules(
    showAddressForm ? defaultBillingCountry : (shippingAddress?.country as CountryCode),
    { skip: onlyOverview || !isReady || !showAddressForm }
  );

  const methods = useForm<FormValuesSchema>({
    resolver: zodResolver(createSchema(validationRules)),
    mode: "onChange",
  });

  useEffect(() => {
    methods.reset(shippingAddress);
  }, [methods, shippingAddress]);

  const handleSubmit = async (values: FormValuesSchema) => {
    const { streetNumber, cardNumber, expiryDate, cvc, paymentCountry, ...address } = convertValuesToSend(values);

    const updateBillingAddressData = await updateBillingAddress({
      variables: {
        id: checkoutData.id,
        billingAddress: {
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
      },
    });

    if (!!updateBillingAddressData.errors?.length) return setGeneralErrorMsg("Something went wrong, try again later");

    const checkoutBillingAddressUpdateData = (updateBillingAddressData?.data as CheckoutBillingAddressUpdateMutation)
      ?.checkoutBillingAddressUpdate;

    const errorField = checkoutBillingAddressUpdateData?.errors[0]?.field;
    const errorMessage = checkoutBillingAddressUpdateData?.errors[0]?.message;

    if (errorField) {
      methods.setError(mappedAddressFieldsForAutocompletion[errorField as AddressFormFieldsType], {
        message: errorMessage || undefined,
      });
      return;
    }

    if (!checkoutData.availablePaymentGateways.some(gateway => gateway.id === selectedPaymentGatewayId))
      return setGeneralErrorMsg(`The ${mappedPaymentGateways[selectedPaymentGatewayId]} is not avaiable.`);

    const paymentCreateData = await paymentCreate({
      variables: {
        checkoutId: checkoutData.id,
        input: {
          amount: checkoutData.totalPrice.gross.amount,
          gateway: selectedPaymentGatewayId,
          token: cardNumber.trim(),
        },
      },
    });

    if (!!paymentCreateData.errors?.length || !paymentCreateData?.data?.checkoutPaymentCreate?.payment)
      return setGeneralErrorMsg("Something went wrong, try again later");

    await checkoutComplete({
      variables: {
        checkoutId: checkoutData.id,
        metadata: [
          { key: "checkoutData", value: JSON.stringify(paymentCreateData.data.checkoutPaymentCreate.checkout) },
        ],
      },
      onCompleted: data => {
        setRedirecting(true);
        const orderId = data.checkoutComplete?.order?.id;
        if (!orderId) {
          setRedirecting(false);
          return setGeneralErrorMsg("Something went wrong, try again later");
        }
        router.push(`/order/${data.checkoutComplete?.order?.id}`);
      },
    });
  };

  const updating = updatingBillingAddress || creatingPayment || completingCheckout || redirecting;

  return (
    <Section
      disabled={onlyOverview || !isReady || updating}
      title="Payment"
      onArrowClick={() => setIsExpanded(v => !v)}
      isArrowUp={isExpanded}
      content={
        isExpanded ? (
          <div className="mt-6">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(handleSubmit)}>
                <div className="mb-5">
                  <CardNumberField />
                  <div className="flex gap-5">
                    <div>
                      <ExpiryDateField />
                    </div>
                    <div>
                      <CvcField />
                    </div>
                  </div>
                </div>
                <SelectField
                  defaultValue={defaultPaymentCountry}
                  disabled={updating}
                  label="Country"
                  name="paymentCountry"
                  placeholder="Country"
                  options={getCountriesToDisplay(checkoutData.channel.countries)}
                />
                <label className="mb-1.5 mt-6 flex w-max cursor-pointer gap-1.5 whitespace-nowrap align-middle text-xs text-darkGray">
                  <input
                    disabled={updating}
                    checked={showAddressForm}
                    type="checkbox"
                    onChange={() => {
                      setShowAddressForm(v => !v);
                      const { cardNumber, expiryDate, cvc, paymentCountry } = methods.getValues();

                      const emptyAddress = mapAddressFieldsForAutocompletion();

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
                    disabled={updating}
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
                    loading={updating}
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
                  {addressDisplay(
                    checkoutData.billingAddress as AddressFieldsFragment,
                    getCountriesToDisplay(checkoutData.channel.countries)
                  )}
                </Overview>
              </>
            )}
          </>
        )
      }
    />
  );
};
