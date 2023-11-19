import React, { ButtonHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

interface InputProps extends ButtonHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export const Input = ({ label, name, ...props }: InputProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors[name]?.message as string;

  return (
    <div className="mb-5">
      <label htmlFor={name} className="text-darkGray mb-1.5 block text-xs">
        {label}
      </label>
      <input
        autoComplete={name}
        {...props}
        {...register(name)}
        className="placeholder-normalGray border-normalGray mt-1 block w-full rounded-md border p-3 text-sm shadow-sm
        focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
      />
      {!!errorMessage && <span className="mt-2 text-xs text-red-500">{errorMessage}</span>}
    </div>
  );
};
