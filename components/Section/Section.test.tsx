import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { Section } from "./Section";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ className, onClick }: { className?: string; onClick?: React.MouseEventHandler<HTMLDivElement> }) => (
    <div className={className} onClick={onClick}>
      Image
    </div>
  ),
}));

describe("Section component", () => {
  it("renders with provided title and content", () => {
    render(<Section title="title" content={<p>Test Content</p>} onArrowClick={() => {}} isArrowUp={false} />);

    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("clicks arrow and calls 'onArrowClick' when not disabled", () => {
    const onArrowClick = jest.fn();
    render(<Section title="Test" onArrowClick={onArrowClick} content={undefined} isArrowUp={false} />);

    fireEvent.click(screen.getByText("Image"));

    expect(onArrowClick).toHaveBeenCalledTimes(1);
  });

  it("checks if arrow is rotated when 'isArrowUp' is true", () => {
    render(<Section title="Test" onArrowClick={() => {}} content={undefined} isArrowUp={true} />);
    const imageDiv = screen.getByText("Image");

    expect(imageDiv).toHaveClass("rotate-180");
  });

  it("checks if arrow is hidden when disabled is true", () => {
    render(<Section title="Test" onArrowClick={() => {}} content={undefined} isArrowUp={false} disabled={true} />);

    expect(screen.queryByText("Image")).not.toBeInTheDocument();
  });
});
