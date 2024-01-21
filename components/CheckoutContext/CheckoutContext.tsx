"use client";

import React, { createContext, FC, ReactNode, useState } from "react";

import { CheckoutFieldsFragment } from "@/generated/graphql";

interface CheckoutContextProps {
  checkoutData: CheckoutFieldsFragment;
  setCheckoutData: React.Dispatch<React.SetStateAction<CheckoutFieldsFragment>>;
}

interface CheckoutProviderProps {
  children: ReactNode;
  checkoutData: CheckoutFieldsFragment;
}

const CheckoutContext = createContext<CheckoutContextProps | undefined>(undefined);

const CheckoutProvider: FC<CheckoutProviderProps> = ({ children, checkoutData: data }) => {
  const [checkoutData, setCheckoutData] = useState(data);

  return <CheckoutContext.Provider value={{ checkoutData, setCheckoutData }}>{children}</CheckoutContext.Provider>;
};

export { CheckoutContext, CheckoutProvider };
