import type { CodegenConfig } from "@graphql-codegen/cli";

import { API_URL } from "./constants";

const config: CodegenConfig = {
  overwrite: true,
  schema: API_URL,
  documents: "graphql/**/*.graphql",
  generates: {
    "generated/": {
      preset: "client",
      plugins: [
        "typescript",
        "typescript-operations",
        // ... any other plugins you are using
      ],
      config: {
        dedupeFragments: true, // Add this line to enable deduplication of fragments
      },
    },
  },
};

export default config;
