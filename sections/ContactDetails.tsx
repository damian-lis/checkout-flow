"use client";
import { useLazyQuery, useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import classNames from "classnames";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import {
  CheckoutDocument,
  CheckoutEmailUpdateDocument,
  CheckoutFieldsFragment,
  CheckoutMetadataUpdateDocument,
} from "@/generated/graphql";

import { Button, Input } from "../components";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters long"),
  name: z.string().max(255, "Name must be at most 255 characters long").min(1, "Name is required"),
});

type FormValues = z.infer<typeof schema>;

interface ContactDetailsProps {
  initialCheckoutData: CheckoutFieldsFragment;
}

export const ContactDetails = ({ initialCheckoutData }: ContactDetailsProps) => {
  const { checkoutId } = useParams<{ checkoutId: string }>();
  const [checkoutData, setCheckoutData] = useState(initialCheckoutData);

  const [fetchCheckout, { loading: fetchingCheckout }] = useLazyQuery(CheckoutDocument);
  const [updateCheckoutEmail, { loading: updatingEmail }] = useMutation(CheckoutEmailUpdateDocument);
  const [updateCheckoutMetadata, { loading: updatingName }] = useMutation(CheckoutMetadataUpdateDocument);

  const initialUserName = checkoutData?.metadata.find(({ key }) => key === "name")?.value;
  const initialUserEmail = checkoutData?.email ?? undefined;

  const [isOpen, setIsOpen] = useState(!initialUserName && !initialUserEmail);

  useEffect(() => {
    setIsOpen(!initialUserName && !initialUserEmail);
  }, [initialUserName, initialUserEmail]);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { handleSubmit } = methods;
  const checkout = checkoutData;
  const loading = updatingEmail || updatingName || fetchingCheckout;

  useEffect(() => {
    if (checkout) {
      methods.reset({
        ...methods.getValues(),
        email: initialUserEmail,
        name: initialUserName,
      });
    }
  }, [checkout, methods, initialUserName, initialUserEmail]);

  const onSubmit: SubmitHandler<FormValues> = async ({ name, email }) => {
    if (initialUserEmail !== email) {
      const { data: updatedEmailData } = await updateCheckoutEmail({
        variables: {
          email: email,
          id: checkoutId,
        },
      });

      const errorField = updatedEmailData?.checkoutEmailUpdate?.errors[0]?.field;
      const errorMessage = updatedEmailData?.checkoutEmailUpdate?.errors[0]?.message;

      if (errorField === "email") {
        methods.setError(errorField, {
          message: errorMessage || undefined,
        });
        return;
      }
    }

    if (initialUserName !== name) {
      const { data: updatedMetadata } = await updateCheckoutMetadata({
        variables: {
          input: [
            {
              key: "name",
              value: name,
            },
          ],
          id: checkoutId,
        },
      });

      const errorField = updatedMetadata?.updateMetadata?.errors[0]?.field;
      const errorMessage = updatedMetadata?.updateMetadata?.errors[0]?.message;

      if (errorField === "name") {
        methods.setError(errorField, {
          message: errorMessage || undefined,
        });
        return;
      }
    }

    const { data } = await fetchCheckout({
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "network-only",
      variables: {
        id: checkoutId as string,
      },
    });

    setCheckoutData(data?.checkout as CheckoutFieldsFragment);
    setIsOpen(false);
  };

  return (
    <div className="border-normalGray relative w-full max-w-sm rounded-md border p-6">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="mb-3 text-lg font-normal">Contact details</h2>
          {(!!initialUserName || !!initialUserEmail) && !loading && (
            <Image
              className={classNames(`absolute right-6 top-6 cursor-pointer`, {
                "rotate-0": isOpen,
                "rotate-180": !isOpen,
              })}
              src="/arrow.svg"
              alt="arrow"
              width="12"
              height="12"
              onClick={() => {
                setIsOpen(val => !val);
                methods.reset();
              }}
            />
          )}
          {isOpen ? (
            <>
              <Input disabled={loading} label="Enter name" name="name" placeholder="Enter name" />
              <Input disabled={loading} label="Enter email" name="email" placeholder="Enter email" />
              <div className="text-right">
                <Button
                  loading={loading}
                  disabled={!methods.formState.isDirty || !!Object.entries(methods.formState.errors).length || loading}
                >
                  Save and continue
                </Button>
              </div>
            </>
          ) : (
            <div className="text-normalGray mt-5 break-words text-xs">
              {initialUserName}, {initialUserEmail}
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
};
