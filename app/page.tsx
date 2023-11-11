"use client";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components";
import { DEFAULT_CHANNEL } from "@/constants";
import { CheckoutCreateDocument } from "@/generated/graphql";

export default function Home() {
  const [createCheckout, { data, loading, error }] = useMutation(CheckoutCreateDocument);
  const router = useRouter();

  const checkoutToken = data?.checkoutCreate?.checkout?.token;
  const checkoutCreating = !error && (!!checkoutToken || loading);

  const handleCheckoutCreate = () => {
    createCheckout({
      variables: {
        email: "damian.lis@mirumee.com",
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
    if (!checkoutToken) return;
    router.push(`/checkout/${checkoutToken}`);
  }, [data, router, checkoutToken]);

  return (
    <main className="flex h-screen items-center justify-center px-4">
      <Button loading={checkoutCreating} disabled={checkoutCreating} onClick={handleCheckoutCreate}>
        Create checkout and add product
      </Button>
    </main>
  );
}
