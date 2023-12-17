"use client";

import classNames from "classnames";
import Image from "next/image";
import React, { SelectHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

export type Option = { label: string; value: string };

export type SelectFieldProps = {
  label?: string;
  name: string;
  options?: Option[];
} & SelectHTMLAttributes<HTMLSelectElement>;

export const SelectField = ({ label, name, options, onChange, placeholder, ...props }: SelectFieldProps) => {
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext();

  const errorMessage = errors[name]?.message;
  const selectedValue = getValues()[name];

  return (
    <div className="relative mb-5">
      {label && (
        <label htmlFor={name} className="mb-1.5 block text-xs text-darkGray">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          defaultValue=""
          autoComplete={name}
          {...props}
          {...register(name)}
          onChange={
            onChange ||
            (event => {
              setValue(name, event.target.value);
            })
          }
          className={classNames(
            "mt-1 block w-full appearance-none rounded-md border border-normalGray p-3.5 text-sm placeholder-normalGray shadow-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600",
            {
              "text-normalGray": !selectedValue,
            }
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options?.map((item, idx) => (
            <option value={item.value} key={item.value + idx}>
              {item.label}
            </option>
          ))}
        </select>
        <Image
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transform"
          src="/select-arrow.svg"
          alt="arrow"
          width="12"
          height="12"
        />
      </div>
      {errorMessage && typeof errorMessage === "string" && (
        <span className="mt-2 text-xs text-red-500">{errorMessage}</span>
      )}
    </div>
  );
};
