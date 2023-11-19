import "./globals.css";

import classNames from "classnames";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "sonner";

import { ApolloWrapper } from "@/lib/ApolloWrapper";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Checkout Flow",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body
        className={classNames(outfit.className, "px-5")}
        suppressHydrationWarning={true} // here is why: https://stackoverflow.com/questions/75337953/what-causes-nextjs-warning-extra-attributes-from-the-server-data-new-gr-c-s-c
      >
        <ApolloWrapper>{children}</ApolloWrapper>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
};

export default RootLayout;
