"use-client";
import Link from "next/link";
import React from "react";

const MainNotFoundPage = () => {
  return (
    <main className="flex h-screen flex-col items-center justify-center px-4 text-center">
      <h1>404 page not found.</h1>
      <Link className="mt-2 text-xl text-blue-600 hover:underline dark:text-blue-500" href="/">
        Go back to the initial page
      </Link>
    </main>
  );
};

export default MainNotFoundPage;
