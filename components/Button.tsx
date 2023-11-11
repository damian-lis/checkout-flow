"use client";
import classNames from "classnames";
import React from "react";

import { Spinner } from "./Spinner";

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  loading: boolean;
}

export const Button: React.FC<ButtonProps> = ({ loading, children, onClick, disabled }) => (
  <button
    className={classNames(
      "relative rounded-md bg-black px-4 py-2 text-[18px] font-normal text-white sm:rounded-xl sm:px-20 sm:py-4 sm:text-3xl",
      {
        "cursor-default bg-opacity-60 hover:bg-opacity-60": loading,
      }
    )}
    onClick={onClick}
    disabled={disabled}
  >
    {loading && <Spinner />}
    {children}
  </button>
);
