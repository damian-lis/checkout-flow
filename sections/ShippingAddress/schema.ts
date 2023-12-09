import { z } from "zod";

import { AddressValidationRulesQuery } from "@/generated/graphql";

export const mappedFieldsForAutocompletion = {
  firstName: "given-name",
  lastName: "family-name",
  companyName: "organization",
  postalCode: "postal-code",
  streetAddress1: "street-address",
  streetNumber: "address-line1",
  city: "address-level2",
  country: "country",
  countryArea: "address-level1",
};

const mappedFieldsToDisplay: Record<string, string> = {
  city: "City",
  streetAddress1: "Street Address",
  countryArea: "Country Area",
};

export const createSchema = (validationRules?: AddressValidationRulesQuery) => {
  let schema = z.object({
    [mappedFieldsForAutocompletion.firstName]: z.string().min(1, "First name is required"),
    [mappedFieldsForAutocompletion.lastName]: z.string().min(1, "Last name is required"),
    [mappedFieldsForAutocompletion.companyName]: z.string().optional(),
    [mappedFieldsForAutocompletion.postalCode]: z.string().optional(),
    [mappedFieldsForAutocompletion.streetAddress1]: z.string().optional(),
    [mappedFieldsForAutocompletion.streetNumber]: z
      .string()
      .transform(value => parseInt(value, 10))
      .refine(value => !isNaN(value) && value >= 0, { message: "Incorrect number" })
      .optional(),
    [mappedFieldsForAutocompletion.city]: z.string().optional(),
    [mappedFieldsForAutocompletion.country]: z.string().min(1, "Country is required"),
    [mappedFieldsForAutocompletion.countryArea]: z.string().optional(),
  });

  const rules = validationRules?.addressValidationRules;
  if (rules) {
    rules.requiredFields.forEach(field => {
      schema = schema.extend({
        [mappedFieldsForAutocompletion[field]]: z
          .string()
          .min(1, `${mappedFieldsToDisplay[field] || field} is required`),
      }) as any; // TODO: to change

      if (field === "streetAddress1") {
        schema = schema.extend({
          [mappedFieldsForAutocompletion.streetNumber]: z
            .string()
            .min(1, "Number is required")
            .transform(value => parseInt(value, 10))
            .refine(value => !isNaN(value) && value >= 0, { message: "Incorrect number" }),
        }) as any; // TODO: to change
      }
    });
    rules.allowedFields.forEach(field => {
      if (!rules.requiredFields.includes(field)) {
        schema = schema.extend({
          [mappedFieldsForAutocompletion[field]]: z.string().optional(),
        }) as any; // TODO: to change
      }
    });
    if (rules.postalCodeMatchers.length) {
      let message = "Invalid postal code. The following are examples: ";

      rules.postalCodeExamples.forEach((example, idx, list) => {
        message += `${example}${idx !== list.length - 1 ? ", " : "."}`;
      });

      schema = schema.extend({
        [mappedFieldsForAutocompletion.postalCode]: z.string().regex(new RegExp(rules.postalCodeMatchers[0]), message),
      }) as any; // TODO: to change
    }
  }

  return schema;
};

export type FormValues = z.infer<ReturnType<typeof createSchema>>;
