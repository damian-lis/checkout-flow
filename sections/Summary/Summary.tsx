"use client";

import classNames from "classnames";
import getSymbolFromCurrency from "currency-symbol-map";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import React, { useContext, useState } from "react";

import { Overview } from "@/components";
import { CheckoutContext } from "@/components/CheckoutContext";
import { Section } from "@/components/Section";
import { Money } from "@/generated/graphql";

interface SummaryProps {
  orderNumber?: string;
  orderCreatedDate?: string;
}

export const Summary = ({ orderNumber, orderCreatedDate }: SummaryProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { checkoutData } = useContext(CheckoutContext)!; // I've added '!' since the 'checkoutData' object is available here for sure (see checking in the page component)

  const quantity = checkoutData.lines[0].quantity;
  const productPrice = checkoutData.lines[0].totalPrice.net;
  const productName = checkoutData.lines[0].variant.product.attributes[0].attribute?.name;
  const thumbnailUrl = checkoutData.lines[0].variant.media?.[0].url;
  const firstShippingMethodPrice = checkoutData.shippingMethods?.[0]?.price;
  const tax = checkoutData.totalPrice.tax;
  const totalPrice = checkoutData.totalPrice.gross;

  const sharedContent = (
    <>
      <div className="mb-5 flex justify-between">
        <Image
          className="rounded-md border border-black"
          src={thumbnailUrl || ""}
          width={104}
          height={104}
          alt="product thumbnail"
        />
        <div className="text-lg font-normal">{displayMoney(productPrice)}</div>
      </div>
      <div className="mb-5 text-lg font-normal">
        <div>{productName}</div>
      </div>
      <hr className="border-darkGray" />
      <div className="mb-5 mt-5 flex justify-between text-lg font-normal">
        <div>Shipping</div>
        <div>
          {firstShippingMethodPrice ? (
            <>{displayMoney(firstShippingMethodPrice)}</>
          ) : (
            <span className="text-lightGray">To be determined</span>
          )}
        </div>
      </div>
      {!!tax.amount && (
        <div className="mb-5 flex justify-between text-lg font-normal">
          <div>Incl VAT</div>
          <div>{displayMoney(tax)}</div>
        </div>
      )}
      <hr className="border-darkGray" />
      <div className="mt-5 flex justify-between text-lg font-normal">
        <div className="self-end">Total</div>
        <div className="text-4xl">{displayMoney(totalPrice)}</div>
      </div>
    </>
  );

  return (
    <>
      <div className={classNames("mb-5 hidden w-full max-w-xs md:block")}>
        <div className="w-full max-w-full md:max-w-xs">
          {!!orderCreatedDate && !!orderNumber ? (
            <>
              <div className="mb-1 text-lg font-bold">Order #{orderNumber}</div>
              <div className="mb-5 text-lg text-lightGray">{format(parseISO(orderCreatedDate), "dd MMMM yyyy")}</div>
            </>
          ) : (
            <div className="mb-5 text-lg font-bold">Summary</div>
          )}
          {sharedContent}
        </div>
      </div>
      <Section
        className="md:hidden"
        title="Summary"
        isArrowUp={isOpen}
        onArrowClick={() => setIsOpen(v => !v)}
        content={
          isOpen ? (
            sharedContent
          ) : (
            <Overview>
              {quantity} {quantity > 1 ? "products:" : "product:"}
              {displayMoney(totalPrice)}
            </Overview>
          )
        }
      />
    </>
  );
};

const displayMoney = (data: Money) => (
  <>
    {getSymbolFromCurrency(data.currency)} {data.amount}
  </>
);
