"use server";

import { revalidatePath } from "next/cache";

import { PRODUCT_VARIANT_ID, SALEOR_CHANNEL } from "@/constants";
import {
  AddressInput,
  CheckoutBillingAddressUpdateDocument,
  CheckoutCompleteDocument,
  CheckoutCreateDocument,
  CheckoutDeliveryMethodUpdateDocument,
  CheckoutEmailUpdateDocument,
  CheckoutMetadataUpdateDocument,
  CheckoutPaymentCreateDocument,
  CheckoutShippingAddressUpdateDocument,
  MetadataInput,
} from "@/generated/graphql";
import { getClient } from "@/lib/ApolloClient";

// INFO: I've not found a way to revalidate the `/checkout/${checkoutId}` path without triggering the checkout query that fetches data from the server.
// With the current implementation after executing a server action that has 'revalidatePath' the checkout query fetches data additionaly
// that is not ideal and harms a little UX (delay getting checkout data).
// The problem is realted to 'ApolloWrapper' that has own caching rules and doesn't respect NextJS 13 caching strategy.
// Updating the Apollo cache manually by writting query doesn't work as well.

export const updateEmail = async (email: string, checkoutId: string) => {
  const client = getClient();

  const { data, errors } = await client.mutate({
    mutation: CheckoutEmailUpdateDocument,
    variables: {
      email,
      id: checkoutId,
    },
  });

  revalidatePath(`/checkout/${checkoutId}`);

  return { data, errors };
};

export const updateName = async (name: string, checkoutId: string) => {
  const client = getClient();

  const { data, errors } = await client.mutate({
    mutation: CheckoutMetadataUpdateDocument,
    variables: {
      input: [
        {
          key: "name",
          value: name,
        },
      ],
      id: checkoutId,
    },
  });

  revalidatePath(`/checkout/${checkoutId}`);

  return {
    data,
    errors,
  };
};

export const updateShippingAddress = async (shippingAddress: AddressInput, checkoutId: string) => {
  const client = getClient();

  const { data, errors } = await client.mutate({
    mutation: CheckoutShippingAddressUpdateDocument,
    variables: {
      id: checkoutId,
      shippingAddress,
    },
  });

  revalidatePath(`/checkout/${checkoutId}`);

  return {
    data,
    errors,
  };
};

export const updateDeliveryMethod = async (deliveryMethodId: string, checkoutId: string) => {
  const client = getClient();

  const { data, errors } = await client.mutate({
    mutation: CheckoutDeliveryMethodUpdateDocument,
    variables: {
      id: checkoutId,
      deliveryMethodId,
    },
  });

  revalidatePath(`/checkout/${checkoutId}`);

  return {
    data,
    errors,
  };
};

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
