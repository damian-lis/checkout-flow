import { DEFAULT_CHANNEl } from "@/constants";
import { ProductDocument } from "@/generated/graphql";
import { getClient } from "@/lib/ApolloClient";

export const ServerComponent = async () => {
  const client = getClient();

  const { data } = await client.query({
    query: ProductDocument,
    variables: {
      id: "UHJvZHVjdDoxNTI=",
      channel: DEFAULT_CHANNEl,
    },
  });

  return (
    <div>
      Server Component Data: {data?.product?.id} {data?.product?.name}
    </div>
  );
};
