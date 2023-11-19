import React from "react";

import { CheckoutDocument, CheckoutFieldsFragment } from "@/generated/graphql";
import { getClient } from "@/lib/ApolloClient";
import { ContactDetails } from "@/sections";

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
  });

  return (
    <main className="mx-auto mt-40 w-full max-w-[350px] md:max-w-[830px]">
      <h1 className="text-normalGray mb-12 w-full text-4xl font-semibold md:mb-14">Checkout</h1>
      <div className="flex flex-col-reverse items-center justify-between md:flex-row md:items-start">
        <ContactDetails initialCheckoutData={data.checkout as CheckoutFieldsFragment} />
        <div className="bg-lightGray mb-5 h-[280px] w-full max-w-full md:max-w-xs">Summary</div>
      </div>
    </main>
  );
};

export default CheckoutPage;
