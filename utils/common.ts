import { CountryDisplay } from "@/generated/graphql";

import { mappedFieldsFromAutocompletion } from ".";

export const convertValuesToSend = (values: Record<string, string | CountryDisplay>) =>
  Object.entries(values).reduce<Record<string, string>>((acc, curr) => {
    const field = curr[0];
    const value = curr[1];

    acc[mappedFieldsFromAutocompletion[field] || field] = String(value);
    return acc;
  }, {});
