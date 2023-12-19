"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components";

import { checkoutCreate } from "./actions";

const Home = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleCheckoutCreate = async () => {
    startTransition(async () => {
      const { data, errors } = await checkoutCreate();

      if (errors?.length) {
        toast.error("Error while creating a checkout", {
          description: errors[0].message,
        });
        return;
      }

      const errorMessage = data?.checkoutCreate?.errors[0]?.message;

      if (errorMessage || !data?.checkoutCreate?.checkout?.id) {
        toast.error("Error while creating a checkout", {
          description: errorMessage,
        });

        return;
      }

      router.push(`/checkout/${data?.checkoutCreate?.checkout?.id}`);
    });
  };

  return (
    <main className="flex h-screen items-center justify-center">
      <Button size="big" loading={pending} disabled={pending} onClick={handleCheckoutCreate}>
        Create checkout and add product
      </Button>
    </main>
  );
};

export default Home;
