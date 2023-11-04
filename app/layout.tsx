import "./globals.css";

import type { Metadata } from "next";
import { Outfit } from "next/font/google";

import { ApolloWrapper } from "@/lib/ApolloWrapper";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Checkout Flow",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
