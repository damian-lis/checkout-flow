"use client";

import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components";
import { DEFAULT_CHANNEL } from "@/constants";
import { CheckoutCreateDocument } from "@/generated/graphql";

const Home = () => {
  const router = useRouter();
  const [createCheckout, { data, loading, error }] = useMutation(CheckoutCreateDocument);

  const checkoutId = data?.checkoutCreate?.checkout?.id;
  const checkoutCreating = !error && (!!checkoutId || loading);

  const handleCheckoutCreate = () => {
    createCheckout({
      variables: {
        channel: DEFAULT_CHANNEL,
        lines: [{ quantity: 1, variantId: "UHJvZHVjdFZhcmlhbnQ6Mzg0" }],
      },
      onCompleted: data => {
        const errorMessage = data.checkoutCreate?.errors[0]?.message;
        if (errorMessage)
          toast.error("Error while creating a checkout", {
            description: errorMessage,
          });
      },
      onError: ({ message }) => {
        toast.error("Error while creating a checkout", {
          description: message,
        });
      },
    });
  };

  useEffect(() => {
    if (!checkoutId) return;
    router.push(`/checkout/${checkoutId}`);
  }, [data, router, checkoutId]);

  // INFO: The 404 page is handled in the 'not-found.tsx' file

  return (
    <main className="flex h-screen items-center justify-center">
      <Button size="big" loading={checkoutCreating} disabled={checkoutCreating} onClick={handleCheckoutCreate}>
        Create checkout and add product
      </Button>
    </main>
  );
};

export default Home;
