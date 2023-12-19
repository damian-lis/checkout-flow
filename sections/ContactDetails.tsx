"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState, useTransition } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { updateEmail, updateName } from "@/app/actions";
import { Section } from "@/components/Section";
import { CheckoutFieldsFragment } from "@/generated/graphql";

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
  const [pending, startTransition] = useTransition();

  const userName = checkoutData?.metadata.find(({ key }) => key === "name")?.value;
  const userEmail = checkoutData?.email ?? undefined;

  const shouldExpand = !userName && !userEmail && !onlyOverview;
  const [isExpanded, setIsExpanded] = useState(shouldExpand);

  const [generalErrorMsg, setGeneralErrorMsg] = useState("");

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (checkoutData) {
      methods.reset({
        ...methods.getValues(),
        email: userEmail,
        name: userName,
      });
    }
  }, [checkoutData, methods, userName, userEmail]);

  useEffect(() => {
    setIsExpanded(shouldExpand);
  }, [shouldExpand]);

  const onSubmit: SubmitHandler<FormValues> = async ({ name, email }) => {
    startTransition(async () => {
      if (userEmail !== email) {
        const { data, errors } = await updateEmail(email, checkoutData.id);

        if (!!errors?.length) return setGeneralErrorMsg("Something went wrong, try again later");

        const errorField = data?.checkoutEmailUpdate?.errors[0]?.field;
        const errorMessage = data?.checkoutEmailUpdate?.errors[0]?.message;

        if (errorField === "email") {
          methods.setError(errorField, {
            message: errorMessage || undefined,
          });
          return;
        }
      }

      if (userName !== name) {
        const { data, errors } = await updateName(name, checkoutData.id);

        if (!!errors?.length) return setGeneralErrorMsg("Something went wrong, try again later");

        const errorField = data?.updateMetadata?.errors[0]?.field;
        const errorMessage = data?.updateMetadata?.errors[0]?.message;

        if (errorField === "name") {
          methods.setError(errorField, {
            message: errorMessage || undefined,
          });
          return;
        }
      }
      setIsExpanded(false);
    });
  };

  const { handleSubmit } = methods;

  return (
    <Section
      disabled={onlyOverview || !userEmail || pending}
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
                <InputField disabled={pending} label="Enter name" name="name" placeholder="Enter name" />
                <InputField disabled={pending} label="Enter email" name="email" placeholder="Enter email" />
                {!!generalErrorMsg && (
                  <ErrorNotification message={generalErrorMsg} onClose={() => setGeneralErrorMsg("")} />
                )}
                <div className="mt-5 text-right">
                  <Button
                    loading={pending}
                    disabled={
                      !methods.formState.isDirty || !!Object.entries(methods.formState.errors).length || pending
                    }
                  >
                    Save and continue
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        ) : (
          userName &&
          userEmail && (
            <Overview>
              {userName}, {userEmail}
            </Overview>
          )
        )
      }
    />
  );
};
