import React from "react";

import { ErrorPage } from "@/components";
import { CheckoutProvider } from "@/components/CheckoutContext";
import { CheckoutFieldsFragment, OrderDocument } from "@/generated/graphql";
import { getClient } from "@/lib/ApolloClient";
import { ContactDetails, Payment, ShippingAddress, Summary } from "@/sections";

interface CheckoutPageProps {
  params: {
    orderId: string;
  };
}

const OrderPage = async ({ params: { orderId } }: CheckoutPageProps) => {
  const client = getClient();

  const { data } = await client.query({
    query: OrderDocument,
    variables: {
      id: orderId,
    },
  });

  // INFO: Potential errors are handled in the 'error.tsx' file

  const stringifiedCheckoutData = data.order?.metadata?.find(m => m?.key === "checkoutData")?.value;
  const checkoutData = stringifiedCheckoutData
    ? (JSON.parse(stringifiedCheckoutData) as CheckoutFieldsFragment)
    : undefined;

  if (!checkoutData) return <ErrorPage title="Something went wrong" />;

  return (
    <main className="mx-auto mt-40 w-full max-w-[350px] md:max-w-[830px]">
      <h1 className="mb-12 w-full text-4xl font-semibold text-normalGray md:mb-14">Checkout</h1>
      <div className="flex flex-col-reverse items-center justify-between md:flex-row md:items-start">
        <CheckoutProvider checkoutData={checkoutData}>
          <div className="w-full">
            <ContactDetails onlyOverview />
            <ShippingAddress onlyOverview />
            <Payment onlyOverview orderPaymentGateway={data.order?.payments[0].gateway!} />
          </div>
          <Summary orderNumber={data.order?.number!} orderCreatedDate={data.order?.created} />
        </CheckoutProvider>
      </div>
    </main>
  );
};

export default OrderPage;
