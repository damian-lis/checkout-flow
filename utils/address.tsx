import { Option } from "@/components";
import { AddressFieldsFragment } from "@/generated/graphql";
import { CountryDisplay } from "@/generated/graphql";

type MappedFormFieldsToAutocomplete = {
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

export type AddressFormFieldsType = keyof MappedFormFieldsToAutocomplete;

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

export const mappedFieldsForAutocompletion: MappedFormFieldsToAutocomplete = {
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

export const mappedFieldsFromAutocompletion = Object.entries(mappedFieldsForAutocompletion).reduce<
  Record<string, string>
>((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

export const mapAddressForAutocompletion = (
  address?: AddressFieldsFragment | null
): Record<string, string | undefined> => ({
  [mappedFieldsForAutocompletion.firstName]: address?.firstName,
  [mappedFieldsForAutocompletion.lastName]: address?.lastName,
  [mappedFieldsForAutocompletion.companyName]: address?.companyName,
  [mappedFieldsForAutocompletion.postalCode]: address?.postalCode,
  [mappedFieldsForAutocompletion.streetAddress1]: address?.streetAddress1,
  [mappedFieldsForAutocompletion.streetNumber]: address?.metadata?.find(({ key }) => key === "streetNumber")?.value,
  [mappedFieldsForAutocompletion.city]: address?.city,
  [mappedFieldsForAutocompletion.country]: address?.country?.code || "US",
  [mappedFieldsForAutocompletion.countryArea]:
    address?.countryArea || address?.metadata?.find(({ key }) => key === "countryArea")?.value,
});
