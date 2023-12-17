import classNames from "classnames";
import React from "react";

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label?: string;
  name: string;
  errorMessage?: string;
}

export const Input = ({ label, name, className, errorMessage, ...props }: InputProps) => {
  return (
    <div className={classNames("mb-5", className)}>
      {label && (
        <label htmlFor={name} className="mb-1.5 block whitespace-nowrap text-xs text-darkGray">
          {label}
        </label>
      )}
      <input
        {...props}
        className="mt-1 block w-full rounded-md border border-normalGray p-3.5  text-sm placeholder-normalGray shadow-sm
        focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
      />
      {!!errorMessage && <span className="mt-2 text-xs text-red-500">{errorMessage}</span>}
    </div>
  );
};

// To remove
