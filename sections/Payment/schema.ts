import { z } from "zod";

import { AddressValidationRulesQuery } from "@/generated/graphql";
import { AddressFormFieldsType, mappedAddressFieldsForAutocompletion } from "@/utils";

const mappedFieldsToDisplay: Record<string, string> = {
  city: "City",
  streetAddress1: "Street Address",
  countryArea: "Country Area",
};

export const createSchema = (validationRules?: AddressValidationRulesQuery) => {
  let schema = z.object({
    cardNumber: z.string().optional(), // a validation is in CardDetailsFields.tsx
    expiryDate: z.string().optional(), // a validation is in CardDetailsFields.tsx
    cvc: z.string().optional(), // a validation is in CardDetailsFields.tsx
    paymentCountry: z.string().optional(),
    [mappedAddressFieldsForAutocompletion.firstName]: z.string().optional(),
    [mappedAddressFieldsForAutocompletion.lastName]: z.string().optional(),
    [mappedAddressFieldsForAutocompletion.companyName]: z.string().optional(),
    [mappedAddressFieldsForAutocompletion.postalCode]: z.string().optional(),
    [mappedAddressFieldsForAutocompletion.streetAddress1]: z.string().optional(),
    [mappedAddressFieldsForAutocompletion.streetNumber]: z
      .string()
      .transform(value => parseInt(value, 10))
      .refine(value => !isNaN(value) && value >= 0, { message: "Incorrect number" })
      .optional(),
    [mappedAddressFieldsForAutocompletion.city]: z.string().optional(),
    [mappedAddressFieldsForAutocompletion.country]: z.string().min(1, "Country is required"),
    [mappedAddressFieldsForAutocompletion.countryArea]: z.string().optional(),
  });

  const rules = validationRules?.addressValidationRules;
  if (rules) {
    schema = schema.extend({
      [mappedAddressFieldsForAutocompletion.firstName]: z.string().min(1, "First name is required"),
      [mappedAddressFieldsForAutocompletion.lastName]: z.string().min(1, "Last name is required"),
    }) as any;

    rules.requiredFields.forEach(field => {
      schema = schema.extend({
        [mappedAddressFieldsForAutocompletion[field as AddressFormFieldsType]]: z
          .string()
          .min(1, `${mappedFieldsToDisplay[field] || field} is required`),
      }) as any;

      if (field === "streetAddress1") {
        schema = schema.extend({
          [mappedAddressFieldsForAutocompletion.streetNumber]: z
            .string()
            .min(1, "Number is required")
            .transform(value => parseInt(value, 10))
            .refine(value => !isNaN(value) && value >= 0, { message: "Incorrect number" }),
        }) as any;
      }
    });
    rules.allowedFields.forEach(field => {
      if (!rules.requiredFields.includes(field)) {
        schema = schema.extend({
          [mappedAddressFieldsForAutocompletion[field as AddressFormFieldsType]]: z.string().optional(),
        }) as any;
      }
    });
    if (rules.postalCodeMatchers.length) {
      let message = "Invalid postal code. The following are examples: ";

      rules.postalCodeExamples.forEach((example, idx, list) => {
        message += `${example}${idx !== list.length - 1 ? ", " : "."}`;
      });

      schema = schema.extend({
        [mappedAddressFieldsForAutocompletion.postalCode]: z
          .string()
          .regex(new RegExp(rules.postalCodeMatchers[0]), message),
      }) as any;
    }
  }

  return schema;
};

export type AddressSchema = Omit<z.infer<ReturnType<typeof createSchema>>, "address-line1"> & {
  "address-line1"?: string;
};
