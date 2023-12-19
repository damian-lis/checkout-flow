"use server";

import { revalidatePath } from "next/cache";

import { DEFAULT_CHANNEL } from "@/constants";
import {
  AddressInput,
  CheckoutBillingAddressUpdateDocument,
  CheckoutCompleteDocument,
  CheckoutCreateDocument,
  CheckoutDeliveryMethodUpdateDocument,
  CheckoutDocument,
  CheckoutEmailUpdateDocument,
  CheckoutMetadataUpdateDocument,
  CheckoutPaymentCreateDocument,
  CheckoutShippingAddressUpdateDocument,
  MetadataInput,
} from "@/generated/graphql";
import { getClient } from "@/lib/ApolloClient";

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

  const { data, errors } = await client.mutate({
    mutation: CheckoutCreateDocument,
    variables: {
      channel: DEFAULT_CHANNEL,
      lines: [{ quantity: 1, variantId: "UHJvZHVjdFZhcmlhbnQ6Mzg0" }],
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
