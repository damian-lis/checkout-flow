import { Option } from "@/components";
import { AddressFieldsFragment } from "@/generated/graphql";
import { CountryDisplay } from "@/generated/graphql";

type MappedAddressFieldsForAutocomplete = {
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

export type AddressFormFieldsType = keyof MappedAddressFieldsForAutocomplete;

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

export const mappedAddressFieldsForAutocompletion: MappedAddressFieldsForAutocomplete = {
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

export const mappedAddressFieldsFromAutocompletion = Object.entries(mappedAddressFieldsForAutocompletion).reduce<
  Record<string, string>
>((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

export const mapAddressFieldsForAutocompletion = (
  address?: AddressFieldsFragment | null
): Record<string, string | undefined> => ({
  [mappedAddressFieldsForAutocompletion.firstName]: address?.firstName,
  [mappedAddressFieldsForAutocompletion.lastName]: address?.lastName,
  [mappedAddressFieldsForAutocompletion.companyName]: address?.companyName,
  [mappedAddressFieldsForAutocompletion.postalCode]: address?.postalCode,
  [mappedAddressFieldsForAutocompletion.streetAddress1]: address?.streetAddress1,
  [mappedAddressFieldsForAutocompletion.streetNumber]: address?.metadata?.find(({ key }) => key === "streetNumber")
    ?.value,
  [mappedAddressFieldsForAutocompletion.city]: address?.city,
  [mappedAddressFieldsForAutocompletion.country]: address?.country?.code || "US",
  [mappedAddressFieldsForAutocompletion.countryArea]:
    address?.countryArea || address?.metadata?.find(({ key }) => key === "countryArea")?.value,
});

export const convertValuesToSend = (values: Record<string, string | CountryDisplay>) =>
  Object.entries(values).reduce<Record<string, string>>((acc, curr) => {
    const field = curr[0];
    const value = curr[1];

    acc[mappedAddressFieldsFromAutocompletion[field] || field] = String(value);
    return acc;
  }, {});
