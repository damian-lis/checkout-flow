"use server";

import { PRODUCT_VARIANT_ID, SALEOR_CHANNEL } from "@/constants";
import {
  AddressInput,
  CheckoutBillingAddressUpdateDocument,
  CheckoutCompleteDocument,
  CheckoutCreateDocument,
  CheckoutPaymentCreateDocument,
  MetadataInput,
} from "@/generated/graphql";
import { getClient } from "@/lib/ApolloClient";

export const updateBillingAddress = async (billingAddress: AddressInput, checkoutId: string) => {
  const client = getClient();

  const { data, errors } = await client.mutate({
    mutation: CheckoutBillingAddressUpdateDocument,
    variables: {
      id: checkoutId,
      billingAddress,
    },
  });

  return {
    data,
    errors,
  };
};

export const paymentCreate = async (amount: number, gateway: string, token: string, checkoutId: string) => {
  const client = getClient();

  const { data, errors } = await client.mutate({
    mutation: CheckoutPaymentCreateDocument,
    variables: {
      checkoutId: checkoutId,
      input: {
        amount,
        gateway,
        token,
      },
    },
  });

  return {
    data,
    errors,
  };
};

export const checkoutComplete = async (metadata: MetadataInput[], checkoutId: string) => {
  const client = getClient();

  const { data, errors } = await client.mutate({
    mutation: CheckoutCompleteDocument,
    variables: {
      checkoutId: checkoutId,
      metadata,
    },
  });

  return {
    data,
    errors,
  };
};

export const checkoutCreate = async () => {
  const client = getClient();

  if (!PRODUCT_VARIANT_ID)
    return {
      data: null,
      error: "No product variant id provided",
    };

  if (!SALEOR_CHANNEL)
    return {
      data: null,
      error: "No saleor channel provided",
    };

  const { data, errors } = await client.mutate({
    mutation: CheckoutCreateDocument,
    variables: {
      channel: SALEOR_CHANNEL,
      lines: [{ quantity: 1, variantId: PRODUCT_VARIANT_ID }],
    },
    context: {
      fetchOptions: {
        next: { revalidate: 0 },
      },
    },
  });

  return {
    data,
    errors,
  };
};
