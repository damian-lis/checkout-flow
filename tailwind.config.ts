import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        darkGray: "#2F2F2F",
        normalGray: "#707070",
        lightGray: "#9D9D9D",
      },
    },
  },
};

export default config;
