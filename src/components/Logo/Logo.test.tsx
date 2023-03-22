import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "src/components";

describe("Logo", () => {
  it("should render the logo with redirection to the homepage", () => {
    render(<Logo />);

    const logoLink = screen.getByRole("link");

    expect(logoLink).toHaveAttribute("href", "/s");
    expect(logoLink).toHaveTextContent("phived");
  });
});
