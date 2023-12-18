import { Option } from "@/components";
import { AddressFieldsFragment, CountryCode } from "@/generated/graphql";
import { CountryDisplay } from "@/generated/graphql";

type MappedDefaultToAutocompletionFormat = {
  firstName: "given-name";
  lastName: "family-name";
  companyName: "organization";
  postalCode: "postal-code";
  streetAddress1: "street-address";
  streetNumber: "address-line1";
  city: "address-level2";
  country: "country";
  countryArea: "address-level1";
};

export const mappedDefaultToAutocompletionFormat: MappedDefaultToAutocompletionFormat = {
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

export type AddressFieldAutocompletionFormat =
  MappedDefaultToAutocompletionFormat[keyof MappedDefaultToAutocompletionFormat];

export type AddressFieldDefaultFormat = keyof MappedDefaultToAutocompletionFormat;

export const addressDisplay = (address: AddressFieldsFragment, countriesToDisplay?: Option[]) => {
  const { firstName, lastName, companyName, city, streetAddress1, streetNumber, countryArea, country } = {
    ...address,
    streetNumber: address?.metadata?.find(({ key }) => key === "streetNumber")?.value,
    country: address?.country?.code || "US",
    countryArea: address?.countryArea || address?.metadata?.find(({ key }) => key === "countryArea")?.value,
  };

  return (
    <>
      {firstName} {lastName} {companyName} <br />
      {city && `${city}, `} {streetAddress1} {streetNumber} {countryArea} <br />
      {countriesToDisplay?.find(({ value }) => value === country)?.label}
    </>
  );
};

export const getCountriesToDisplay = (countries?: CountryDisplay[] | null) =>
  countries?.map(({ code, country }) => ({
    label: country,
    value: code,
  }));

export const getAddressAutocompletionFormat = (address?: AddressFieldsFragment | null) => ({
  [mappedDefaultToAutocompletionFormat.firstName]: address?.firstName,
  [mappedDefaultToAutocompletionFormat.lastName]: address?.lastName,
  [mappedDefaultToAutocompletionFormat.companyName]: address?.companyName,
  [mappedDefaultToAutocompletionFormat.postalCode]: address?.postalCode,
  [mappedDefaultToAutocompletionFormat.streetAddress1]: address?.streetAddress1,
  [mappedDefaultToAutocompletionFormat.streetNumber]: address?.metadata?.find(({ key }) => key === "streetNumber")
    ?.value,
  [mappedDefaultToAutocompletionFormat.city]: address?.city,
  [mappedDefaultToAutocompletionFormat.country]: (address?.country?.code || "US") as CountryCode,
  [mappedDefaultToAutocompletionFormat.countryArea]:
    address?.countryArea || address?.metadata?.find(({ key }) => key === "countryArea")?.value,
});

const mappedAutocompletionToDefaultFormat = Object.entries(mappedDefaultToAutocompletionFormat).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<AddressFieldAutocompletionFormat, string>
);

export const getDefaultFormat = (values: Record<AddressFieldAutocompletionFormat | string, string>) =>
  Object.entries(values).reduce<Record<AddressFieldDefaultFormat | string, string | undefined>>((acc, curr) => {
    const field = curr[0] as AddressFieldAutocompletionFormat;
    const value = curr[1];

    acc[mappedAutocompletionToDefaultFormat[field] || field] = value ? String(value) : undefined;
    return acc;
  }, {});
