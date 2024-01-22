import { MockedProvider } from "@apollo/client/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { CheckoutProvider } from "@/components/CheckoutContext";
import {
  CheckoutEmailUpdateDocument,
  CheckoutFieldsFragment,
  CheckoutMetadataUpdateDocument,
} from "@/generated/graphql";

import { ContactDetails } from "./ContactDetails";

const name = "Damian Lis";
const email = "damian.lis@mirumee.com";

const mocks = [
  {
    request: {
      query: CheckoutMetadataUpdateDocument,
      variables: {
        input: [
          {
            key: "name",
            value: name,
          },
        ],
        id: "1234",
      },
    },
    result: {
      data: {
        updateMetadata: {
          item: {
            metadata: [
              {
                key: "name",
                value: name,
              },
            ],
          },
          errors: [],
        },
      },
    },
  },
  {
    request: {
      query: CheckoutEmailUpdateDocument,
      variables: {
        email,
        id: "1234",
      },
    },
    result: {
      data: {
        checkoutEmailUpdate: {
          checkout: {
            id: "1234",
            email: "dlis@lulu.com",
            metadata: [
              {
                key: "name",
                value: "Damian Lis",
              },
            ],
          },
          errors: [],
        },
      },
    },
  },
];

const mockCheckoutData = {
  email,
  id: "1234",
  metadata: [{ key: "name", value: name }],
} as CheckoutFieldsFragment;

const emptyCheckoutData = {
  id: "1234",
  metadata: [],
  email: undefined,
} as unknown as CheckoutFieldsFragment;

jest.mock("../../app/actions", () => ({
  updateEmail: jest.fn(),
  updateName: jest.fn(),
}));

describe("ContactDetails component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays the overview when provided with user data", () => {
    render(
      <MockedProvider>
        <CheckoutProvider checkoutData={mockCheckoutData}>
          <ContactDetails />;
        </CheckoutProvider>
      </MockedProvider>
    );

    expect(screen.getByText(`${name}, ${email}`)).toBeInTheDocument();
  });

  it("expands and shows form when no user data is provided", () => {
    render(
      <MockedProvider>
        <CheckoutProvider checkoutData={{ ...mockCheckoutData, email: "", metadata: [] }}>
          <ContactDetails />;
        </CheckoutProvider>
      </MockedProvider>
    );
    expect(screen.getByPlaceholderText(/Enter name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter email/i)).toBeInTheDocument();
  });

  it("handles name and email submission correctly", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CheckoutProvider checkoutData={emptyCheckoutData}>
          <ContactDetails />
        </CheckoutProvider>
      </MockedProvider>
    );

    const emailInput = screen.getByTestId("email-input");
    const nameInput = screen.getByTestId("name-input");
    const saveButton = screen.getByTestId("save-contact-details");

    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(nameInput, { target: { value: name } });
    fireEvent.submit(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Damian Lis, dlis@lulu.com/)).toBeInTheDocument();
    });
  });
});
