"use client";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import { DEFAULT_CHANNEl } from "@/constants";
import { ProductDocument } from "@/generated/graphql";

export const ClientComponent = () => {
  const { data } = useSuspenseQuery(ProductDocument, {
    variables: {
      id: "UHJvZHVjdDoxNTI=",
      channel: DEFAULT_CHANNEl,
    },
  });

  return (
    <div>
      Client Component Data: {data?.product?.id} {data?.product?.name}{" "}
    </div>
  );
};
