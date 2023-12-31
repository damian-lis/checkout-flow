import React from "react";

import { CheckoutDocument, CheckoutFieldsFragment } from "@/generated/graphql";
import { getClient } from "@/lib/ApolloClient";
import { ContactDetails, Payment, ShippingAddress, Summary } from "@/sections";

interface CheckoutPageProps {
  params: {
    checkoutId: string;
  };
}

const CheckoutPage = async ({ params: { checkoutId } }: CheckoutPageProps) => {
  const client = getClient();

  const { data } = await client.query({
    query: CheckoutDocument,
    variables: {
      id: checkoutId,
    },
    context: {
      fetchOptions: {
        next: { revalidate: 0 },
      },
    },
  });

  const checkoutData = data.checkout as CheckoutFieldsFragment;

  return (
    <main className="mx-auto mt-40 w-full max-w-[350px] md:max-w-[830px]">
      <h1 className="mb-12 w-full text-4xl font-semibold text-normalGray md:mb-14">Checkout</h1>
      <div className="flex flex-col-reverse items-center justify-between md:flex-row md:items-start">
        <div className="w-full">
          <ContactDetails checkoutData={checkoutData} />
          <ShippingAddress checkoutData={checkoutData} />
          <Payment checkoutData={checkoutData} />
        </div>
        <Summary checkoutData={checkoutData} />
      </div>
    </main>
  );
};

export default CheckoutPage;
