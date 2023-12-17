import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ErrorNotification } from "./ErrorNotification";

describe("ErrorNotification component", () => {
  it("renders with provided message", () => {
    const testMessage = "An error occurred!";
    render(<ErrorNotification message={testMessage} />);

    expect(screen.getByRole("alert")).toHaveTextContent(testMessage);
  });

  it("calls 'onClose' when close icon is clicked", () => {
    const onClose = jest.fn();
    render(<ErrorNotification message="Error" onClose={onClose} />);

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
