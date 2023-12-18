import { ChangeEvent, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { usePaymentInputs } from "react-payment-inputs";

export const CardNumberField = ({ disabled }: { disabled: boolean }) => {
  const { meta, getCardNumberProps } = usePaymentInputs();

  const {
    setValue,
    clearErrors,
    control,
    formState: { errors },
    setError,
  } = useFormContext();

  const cardNumberValue = useWatch({
    control,
    name: "cardNumber",
  });

  useEffect(() => {
    if (meta.erroredInputs.cardNumber) {
      setError("cardNumber", { message: meta.erroredInputs.cardNumber });
    } else {
      clearErrors("cardNumber");
    }
  }, [clearErrors, setError, meta.erroredInputs.cardNumber]);

  const cardNumberError = meta.touchedInputs["cardNumber"] && (errors["cardNumber"]?.message as string);

  return (
    <>
      <label htmlFor="cardNumber" className="mb-1.5 mt-5 block whitespace-nowrap text-xs text-darkGray">
        Card number
      </label>
      <input
        disabled={disabled}
        className="mt-1 block w-full rounded-md border border-normalGray p-3.5  text-sm placeholder-normalGray shadow-sm
        focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
        {...getCardNumberProps({
          onChange: (e: ChangeEvent<HTMLInputElement>) => setValue("cardNumber", e.target.value),
        })}
        value={cardNumberValue}
      />
      {!!cardNumberError && <span className="mt-2 text-xs text-red-500">{cardNumberError}</span>}
    </>
  );
};

export const ExpiryDateField = ({ disabled }: { disabled: boolean }) => {
  const { meta, getExpiryDateProps } = usePaymentInputs();

  const {
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useFormContext();

  const expiryDateValue = useWatch({
    control,
    name: "expiryDate",
  });

  useEffect(() => {
    if (meta.erroredInputs.expiryDate) {
      setError("expiryDate", { message: meta.erroredInputs.expiryDate });
    } else {
      clearErrors("expiryDate");
    }
  }, [clearErrors, setError, meta.erroredInputs.expiryDate]);

  const expiryDateError = meta.touchedInputs["expiryDate"] && (errors["expiryDate"]?.message as string);

  return (
    <>
      <label htmlFor="expiryDate" className="mb-1.5 mt-5  block whitespace-nowrap text-xs text-darkGray">
        Expiration date*
      </label>
      <input
        disabled={disabled}
        className="mt-1 block w-full rounded-md border border-normalGray p-3.5  text-sm placeholder-normalGray shadow-sm
        focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
        {...getExpiryDateProps({
          onChange: (e: ChangeEvent<HTMLInputElement>) => setValue("expiryDate", e.target.value),
        })}
        value={expiryDateValue}
      />
      {!!expiryDateError && <span className="mt-2 text-xs text-red-500">{expiryDateError}</span>}
    </>
  );
};

export const CvcField = ({ disabled }: { disabled: boolean }) => {
  const { meta, getCVCProps } = usePaymentInputs();

  const {
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useFormContext();

  const cvcValue = useWatch({
    control,
    name: "cvc",
  });

  useEffect(() => {
    if (meta.erroredInputs.cvc) {
      setError("cvc", { message: meta.erroredInputs.cvc });
    } else {
      clearErrors("cvc");
    }
  }, [clearErrors, setError, meta.erroredInputs.cvc]);

  const cvcError = meta.touchedInputs["cvc"] && (errors["cvc"]?.message as string);
  return (
    <>
      <label htmlFor="cvc" className="mb-1.5 mt-5 block whitespace-nowrap text-xs text-darkGray">
        CVC*
      </label>
      <input
        disabled={disabled}
        className="mt-1 block w-full rounded-md border border-normalGray p-3.5  text-sm placeholder-normalGray shadow-sm
        focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
        {...getCVCProps({ onChange: (e: ChangeEvent<HTMLInputElement>) => setValue("cvc", e.target.value) })}
        value={cvcValue}
      />
      {!!cvcError && <span className="mt-2 text-xs text-red-500">{cvcError}</span>}
    </>
  );
};
