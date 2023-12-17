import React from "react";

import { CheckoutFieldsFragment, OrderDocument } from "@/generated/graphql";
import { getClient } from "@/lib/ApolloClient";
import { ContactDetails, Payment, ShippingAddress, Summary } from "@/sections";

interface CheckoutPageProps {
  params: {
    orderId: string;
  };
}

const CheckoutPage = async ({ params: { orderId } }: CheckoutPageProps) => {
  const client = getClient();

  const { data } = await client.query({
    query: OrderDocument,
    variables: {
      id: orderId,
    },
  });

  // INFO: Potential errors are handled in the 'error.tsx' file

  const stringifiedCheckoutData = data.order?.metadata?.find(m => m?.key === "checkoutData")?.value;
  const checkoutData: CheckoutFieldsFragment = stringifiedCheckoutData ? JSON.parse(stringifiedCheckoutData) : {};

  return (
    <main className="mx-auto mt-40 w-full max-w-[350px] md:max-w-[830px]">
      <h1 className="mb-12 w-full text-4xl font-semibold text-normalGray md:mb-14">Order succeded</h1>
      <div className="flex flex-col-reverse items-center justify-between md:flex-row md:items-start">
        <div className="w-full">
          <ContactDetails checkoutData={checkoutData} onlyOverview />
          <ShippingAddress checkoutData={checkoutData} onlyOverview />
          <Payment checkoutData={checkoutData} orderPaymentGateway={data.order?.payments[0].gateway!} onlyOverview />
        </div>
        <Summary checkoutData={checkoutData} orderNumber={data.order?.number!} orderCreatedDate={data.order?.created} />
      </div>
    </main>
  );
};

export default CheckoutPage;
