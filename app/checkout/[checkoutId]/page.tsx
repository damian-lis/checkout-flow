import React from "react";

import { Checkout, CheckoutDocument } from "@/generated/graphql";
import { getClient } from "@/lib/ApolloClient";
import { ContactDetails } from "@/sections";
import { ShippingAddress } from "@/sections/ShippingAddress/ShippingAddress";

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

  const checkoutData = data.checkout as Checkout; // TODO: Create a fragment

  return (
    <main className="mx-auto mt-40 w-full max-w-[350px] md:max-w-[830px]">
      <h1 className="mb-12 w-full text-4xl font-semibold text-normalGray md:mb-14">Checkout</h1>
      <div className="flex flex-col-reverse items-center justify-between md:flex-row md:items-start">
        <div className="w-full">
          <ContactDetails checkoutData={checkoutData} />
          <ShippingAddress checkoutData={checkoutData} />
        </div>
        <div className="mb-5 h-[280px] w-full max-w-full bg-lightGray md:max-w-xs">Summary</div>
      </div>
    </main>
  );
};

export default CheckoutPage;
