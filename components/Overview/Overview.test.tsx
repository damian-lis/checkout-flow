import { render, screen } from "@testing-library/react";
import React from "react";

import { Overview } from "./Overview";

describe("Overview component", () => {
  it("renders its children correctly", () => {
    render(
      <Overview>
        <p>Text</p>
      </Overview>
    );

    expect(screen.getByText("Text")).toBeInTheDocument();
  });
});
