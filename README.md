# Checkout-Flow Application

## Introduction

`checkout-flow` is an application for the simplified checkout process. It allows users to create a checkout with a single product, enter information such as contact details, shipping address, billing address, and payment details, and then generate an order based on this checkout data. The live version of the app you can check [here](https://checkout-flow.vercel.app).

## Key Technologies

This project incorporates several leading technologies:

- **NextJS 13**: A React framework for server-side rendering and static web applications.
- **React Hook Form**: Manages form state and validations within React applications.
- **Zod**: Offers TypeScript-first schema validation with static type inference.
- **GraphQL**: A query language for APIs, used here with a type system defined for your data.
- **TailwindCSS**: A utility-first CSS framework for rapidly building custom designs, providing low-level utility classes to build complex designs with ease.

## Environment Setup

Before running the application, you need to set up the environment variables. An example file `.env.example` is provided in the project, including Saleor commerce technology related variables:

- `NEXT_PUBLIC_SALEOR_INSTANCE_URI`: The URI of your Saleor instance (e.g., `https://damian-lis.eu.saleor.cloud`). This is used to connect the front-end application with the Saleor backend.
- `NEXT_PUBLIC_PRODUCT_VARIANT_ID`: The default product variant ID (e.g., `UHJvZHVjdFZhcmlhbnQ6Mzg0`). This identifies a specific variant of a product in your Saleor instance.
- `NEXT_PUBLIC_SALEOR_CHANNEL`: The Saleor channel to be used (e.g., `default-channel`). Channels help in managing different sales avenues like online store, physical store, etc., within Saleor.

Copy `.env.example` to a new file named `.env` and update the values according to your environment (you can use the example environment variables if you want).

## Installation

To set up the project:

```bash
git clone <repository-url>
cd <repository-name>
npm install
```

## Development

To run the application in development mode, use the following command:

```bash
npm run dev
```

## Production build

To create a production build of the application, run:

```bash
npm run build
```

To start the application in production mode:

```bash
npm start
```

## Testing

Unit tests are written using Jest. To run the tests, use the following command:

```bash
npm run test
```

For a watch mode that reruns tests on file changes:

```bash
npm run test:watch
```

## Code Quality

The project uses ESLint for static code analysis. Run the linter using:

```bash
npm run lint
```

To automatically fix linting issues you can use:

```bash
npm run autofix
```

Husky is used to set up Git hooks. The prepare script is configured to run on npm install and sets up a pre-commit hook that lints the code.

## GraphQL Code Generation

The `codegen` script generates types and hooks for GraphQL operations using the graphql-codegen tool. It's configured in the codegen.ts file and runs automatically before dev and build scripts.
