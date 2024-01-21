import React from "react";

import { ErrorPage } from "@/components";
import { CheckoutProvider } from "@/components/CheckoutContext";
import { CheckoutDocument } from "@/generated/graphql";
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

  // INFO: Potential errors are handled in the 'error.tsx' file

  const checkoutData = data.checkout;

  if (!checkoutData) return <ErrorPage title="Something went wrong" />;

  return (
    <main className="mx-auto mt-40 w-full max-w-[350px] md:max-w-[830px]">
      <h1 className="mb-12 w-full text-4xl font-semibold text-normalGray md:mb-14">Checkout</h1>
      <div className="flex flex-col-reverse items-center justify-between md:flex-row md:items-start">
        <CheckoutProvider checkoutData={checkoutData}>
          <div className="w-full">
            <ContactDetails />
            <ShippingAddress />
            <Payment />
          </div>
          <Summary />
        </CheckoutProvider>
      </div>
    </main>
  );
};

export default CheckoutPage;
