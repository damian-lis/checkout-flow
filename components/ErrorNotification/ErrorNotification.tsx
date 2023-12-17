"use client";

import React from "react";

interface ErrorNotificationProps {
  message: string;
  onClose?: () => void;
}

export const ErrorNotification = ({ message, onClose }: ErrorNotificationProps) => (
  <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-sm text-red-700" role="alert">
    {message}
    <button
      onClick={() => onClose?.()}
      className="absolute right-0 top-1/2 -translate-x-1/2 -translate-y-1/2 transform "
    >
      <svg
        className="h-5 w-5 cursor-pointer fill-current text-red-700"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  </div>
);
