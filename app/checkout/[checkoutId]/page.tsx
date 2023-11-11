import React from "react";

import { CheckoutDocument } from "@/generated/graphql";
import { getClient } from "@/lib/ApolloClient";

interface CheckoutPageProps {
  params: { checkoutId: string };
}

const CheckoutPage = async ({ params }: CheckoutPageProps) => {
  const client = getClient();

  const { data } = await client.query({
    query: CheckoutDocument,
    variables: {
      token: params.checkoutId,
    },
  });

  return <main className="break-words">{JSON.stringify(data.checkout)}</main>;
};

export default CheckoutPage;
