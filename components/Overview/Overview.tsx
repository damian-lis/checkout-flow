"use client";

import React, { ReactNode } from "react";

interface OverviewProps {
  children: ReactNode;
}

export const Overview: React.FC<OverviewProps> = ({ children }) => (
  <div className="mt-6 break-words text-xs text-normalGray">{children}</div>
);
