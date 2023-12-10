import classNames from "classnames";
import getSymbolFromCurrency from "currency-symbol-map";
import Image from "next/image";
import React from "react";

import { Checkout, Money } from "@/generated/graphql";

import { SummaryForMobile } from "./SummaryForMobile";

interface SummaryProps {
  checkoutData: Checkout;
}

export const Summary = ({ checkoutData }: SummaryProps) => {
  const quantity = checkoutData.lines[0].quantity;
  const productPrice = checkoutData.lines[0].totalPrice.net;
  const productName = checkoutData.lines[0].variant.product.attributes[0].attribute?.name;
  const thumbnailUrl = checkoutData.lines[0].variant.media?.[0].url;
  const firstShippingMethodPrice = checkoutData.shippingMethods?.[0].price;
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
          {firstShippingMethodPrice?.amount ? (
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
          <div className="mb-5 text-lg font-bold">Summary</div>
          {sharedContent}
        </div>
      </div>
      <SummaryForMobile sharedContent={sharedContent} quantity={quantity} totalPrice={totalPrice} />
    </>
  );
};

export const displayMoney = (data: Money) => (
  <>
    {getSymbolFromCurrency(data.currency)}
    {data.amount}
  </>
);
