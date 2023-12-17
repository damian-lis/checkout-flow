"use client";

import classNames from "classnames";
import Image from "next/image";
import React from "react";

interface SectionProps {
  title: string;
  onArrowClick: () => void;
  content: React.ReactNode;
  isArrowUp: boolean;
  className?: string;
  disabled?: boolean;
}

export const Section = ({ title, onArrowClick, content, isArrowUp, className, disabled }: SectionProps) => (
  <div className={classNames("relative mb-5 w-full max-w-sm rounded-md border border-normalGray p-6", className)}>
    <h2 className="text-lg font-normal">{title}</h2>
    <Image
      className={classNames("absolute right-6 top-6 rotate-0 cursor-pointer", {
        "rotate-180": isArrowUp,
        hidden: disabled,
      })}
      src="/arrow.svg"
      alt="arrow"
      width="12"
      height="12"
      onClick={() => {
        if (disabled) return;
        onArrowClick();
      }}
    />
    {content}
  </div>
);
