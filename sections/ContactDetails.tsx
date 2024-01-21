"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useContext, useEffect, useState, useTransition } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { CheckoutContext } from "@/components/CheckoutContext/CheckoutContext";
import { Section } from "@/components/Section";
import { CheckoutEmailUpdateDocument, CheckoutMetadataUpdateDocument } from "@/generated/graphql";

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
  onlyOverview?: boolean;
}

export const ContactDetails = ({ onlyOverview }: ContactDetailsProps) => {
  const { checkoutData, setCheckoutData } = useContext(CheckoutContext)!; //  I've added '!' since the 'checkoutData' object is available here for sure (see checking in the page component)
  const [updateName] = useMutation(CheckoutMetadataUpdateDocument);
  const [updateEmail] = useMutation(CheckoutEmailUpdateDocument);

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
      const { data: nameData, errors: nameErrors } = await updateName({
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

      if (!!nameErrors?.length) return setGeneralErrorMsg("Something went wrong, try again later");

      const nameErrorField = nameData?.updateMetadata?.errors[0]?.field;
      const nameErrorMessage = nameData?.updateMetadata?.errors[0]?.message;

      if (nameErrorField === "name") {
        methods.setError(nameErrorField, {
          message: nameErrorMessage || undefined,
        });
        return;
      }
      const { data: emailData, errors: emailErrors } = await updateEmail({
        variables: {
          email,
          id: checkoutData.id,
        },
      });

      if (!!emailErrors?.length) return setGeneralErrorMsg("Something went wrong, try again later");

      const emailErrorField = emailData?.checkoutEmailUpdate?.errors[0]?.field;
      const emailErrorMessage = emailData?.checkoutEmailUpdate?.errors[0]?.message;

      if (emailErrorField === "email") {
        methods.setError(emailErrorField, {
          message: emailErrorMessage || undefined,
        });
        return;
      }
      setCheckoutData(emailData?.checkoutEmailUpdate?.checkout!);
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
