"use client";

import classNames from "classnames";
import Image from "next/image";
import React, { useState } from "react";

import { Money } from "@/generated/graphql";

import { displayMoney } from ".";

interface SummaryForMobileProps {
  sharedContent: React.ReactNode;
  quantity: number;
  totalPrice: Money;
}

export const SummaryForMobile = ({ sharedContent, quantity, totalPrice }: SummaryForMobileProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={classNames("relative mb-5 block w-full max-w-full rounded-md border border-normalGray p-6 md:hidden")}
    >
      <Image
        className={classNames("absolute right-6 top-6 cursor-pointer md:hidden", {
          "rotate-0": isOpen,
          "rotate-180": !isOpen,
        })}
        src="/arrow.svg"
        alt="arrow"
        width="12"
        height="12"
        onClick={() => {
          setIsOpen(val => !val);
        }}
      />
      <div className="w-full max-w-full md:max-w-xs">
        <div className="mb-5 text-lg font-normal">Summary</div>
        {isOpen ? (
          sharedContent
        ) : (
          <div className="mt-5 break-words text-xs text-normalGray">
            {quantity} {quantity > 1 ? "products:" : "product:"}
            {displayMoney(totalPrice)}
          </div>
        )}
      </div>
    </div>
  );
};
