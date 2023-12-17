import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";

import { Option } from "@/components";
import { AddressValidationRulesDocument, CountryCode } from "@/generated/graphql";

export const useValidationRules = (countryCode: CountryCode, { skip }: { skip: boolean }) => {
  const [countryAreaChoices, setCountryAreaChoices] = useState<Option[]>([]);

  const [fetchValidationRules, { data: validationRules }] = useLazyQuery(AddressValidationRulesDocument, {
    onCompleted: () => {
      const countryAreaChoices = validationRules?.addressValidationRules?.countryAreaChoices?.map(
        ({ raw, verbose }) => ({
          label: verbose!,
          value: raw!,
        })
      );
      if (!countryAreaChoices) return;
      setCountryAreaChoices(countryAreaChoices);
    },
  });

  useEffect(() => {
    if (skip || !countryCode) return;
    fetchValidationRules({
      variables: {
        countryCode,
      },
    });
  }, [fetchValidationRules, countryCode, skip]);

  return { validationRules, countryAreaChoices, refetchValidationRules: fetchValidationRules };
};
