"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { Section } from "@/components/Section";
import {
  CheckoutEmailUpdateDocument,
  CheckoutFieldsFragment,
  CheckoutMetadataUpdateDocument,
} from "@/generated/graphql";

import { Button, ErrorNotification, InputField, Overview } from "../components";

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
  checkoutData: CheckoutFieldsFragment;
  onlyOverview?: boolean;
}

export const ContactDetails = ({ checkoutData, onlyOverview }: ContactDetailsProps) => {
  const router = useRouter();

  const [updateCheckoutEmail, { loading: updatingEmail }] = useMutation(CheckoutEmailUpdateDocument);
  const [updateCheckoutMetadata, { loading: updatingName }] = useMutation(CheckoutMetadataUpdateDocument);

  const initialUserName = checkoutData?.metadata.find(({ key }) => key === "name")?.value;
  const initialUserEmail = checkoutData?.email ?? undefined;

  const isReady = !initialUserName && !initialUserEmail && !onlyOverview;
  const [isExpanded, setIsExpanded] = useState(isReady);

  const [generalErrorMsg, setGeneralErrorMsg] = useState("");

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (checkoutData) {
      methods.reset({
        ...methods.getValues(),
        email: initialUserEmail,
        name: initialUserName,
      });
    }
  }, [checkoutData, methods, initialUserName, initialUserEmail]);

  useEffect(() => {
    setIsExpanded(isReady);
  }, [isReady]);

  const onSubmit: SubmitHandler<FormValues> = async ({ name, email }) => {
    if (initialUserEmail !== email) {
      const { data: updatedEmailData, errors: emailDataGqlErrors } = await updateCheckoutEmail({
        variables: {
          email: email,
          id: checkoutData.id,
        },
      });

      const errorField = updatedEmailData?.checkoutEmailUpdate?.errors[0]?.field;
      const errorMessage = updatedEmailData?.checkoutEmailUpdate?.errors[0]?.message;

      if (!!emailDataGqlErrors?.length) return setGeneralErrorMsg("Something went wrong, try again later");

      if (errorField === "email") {
        methods.setError(errorField, {
          message: errorMessage || undefined,
        });
        return;
      }
    }

    if (initialUserName !== name) {
      const { data: updatedMetadata, errors: metadataGqlErrors } = await updateCheckoutMetadata({
        variables: {
          input: [
            {
              key: "name",
              value: name,
            },
          ],
          id: checkoutData.id,
        },
      });

      if (!!metadataGqlErrors?.length) return setGeneralErrorMsg("Something went wrong, try again later");

      const errorField = updatedMetadata?.updateMetadata?.errors[0]?.field;
      const errorMessage = updatedMetadata?.updateMetadata?.errors[0]?.message;

      if (errorField === "name") {
        methods.setError(errorField, {
          message: errorMessage || undefined,
        });
        return;
      }
    }

    setIsExpanded(false);
    router.refresh();
  };

  const { handleSubmit } = methods;
  const updating = updatingEmail || updatingName;
  const isSectionCompleted = !!checkoutData.email;

  return (
    <Section
      disabled={onlyOverview || !initialUserEmail || updating}
      title="Contact details"
      onArrowClick={() => {
        methods.reset();
        setIsExpanded(v => !v);
      }}
      isArrowUp={isExpanded}
      content={
        isExpanded ? (
          <div className="mt-6">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <InputField disabled={updating} label="Enter name" name="name" placeholder="Enter name" />
                <InputField disabled={updating} label="Enter email" name="email" placeholder="Enter email" />
                {!!generalErrorMsg && (
                  <ErrorNotification message={generalErrorMsg} onClose={() => setGeneralErrorMsg("")} />
                )}
                <div className="mt-5 text-right">
                  <Button
                    loading={updating}
                    disabled={
                      !methods.formState.isDirty || !!Object.entries(methods.formState.errors).length || updating
                    }
                  >
                    Save and continue
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        ) : (
          isSectionCompleted && (
            <Overview>
              {initialUserName}, {initialUserEmail}
            </Overview>
          )
        )
      }
    />
  );
};
