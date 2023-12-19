import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { CheckoutFieldsFragment } from "@/generated/graphql";

import { ContactDetails } from "./ContactDetails";

const name = "Damian Lis";
const email = "damian.lis@mirumee.com";

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
    render(<ContactDetails checkoutData={mockCheckoutData} />);
    expect(screen.getByText(`${name}, ${email}`)).toBeInTheDocument();
  });

  it("expands and shows form when no user data is provided", () => {
    render(<ContactDetails checkoutData={{ ...mockCheckoutData, email: "", metadata: [] }} />);
    expect(screen.getByPlaceholderText(/Enter name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter email/i)).toBeInTheDocument();
  });

  it("handles name and email submission correctly", async () => {
    const { updateEmail, updateName } = require("../../app/actions");
    updateEmail.mockResolvedValue({ data: { checkoutEmailUpdate: { errors: [] } } });
    updateName.mockResolvedValue({ data: { updateMetadata: { errors: [] } } });

    render(<ContactDetails checkoutData={emptyCheckoutData} />);

    const emailInput = screen.getByTestId("email-input");
    const nameInput = screen.getByTestId("name-input");
    const saveButton = screen.getByTestId("save-contact-details");

    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(nameInput, { target: { value: name } });
    fireEvent.submit(saveButton);

    await waitFor(() => {
      expect(updateEmail).toHaveBeenCalledWith(email, mockCheckoutData.id);
      expect(updateName).toHaveBeenCalledWith(name, mockCheckoutData.id);
    });
  });
});
