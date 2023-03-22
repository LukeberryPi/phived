import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "src/components";

describe("Footer", () => {
  it("should render all 3 social networks", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link");

    expect(links.map((link) => link.textContent)).toStrictEqual(["github", "twitter", "instagram"]);
  });
});
