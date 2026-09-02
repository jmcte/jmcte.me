import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HomePage from "@/app/page";
import AboutPage from "@/app/about/page";
import ProjectsPage from "@/app/projects/page";
import ResumePage from "@/app/resume/page";

describe("route pages", () => {
  it("renders homepage content", async () => {
    render(await HomePage());
    expect(
      screen.getByRole("heading", {
        name: "John McChesney TenEyck Jr."
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Executive Technology Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Career trajectory")).toBeInTheDocument();
    expect(screen.getByText("Patent record")).toBeInTheDocument();
    expect(screen.getByText("Featured public repository")).toBeInTheDocument();
    expect(screen.getByText("AI development activity")).toBeInTheDocument();
    expect(screen.getByText("3,200")).toBeInTheDocument();
    expect(screen.getByText("$1.2B")).toBeInTheDocument();
    expect(screen.getByText("$415M")).toBeInTheDocument();
    expect(screen.getByText("Aug 2007 – Jun 2026")).toBeInTheDocument();
    expect(screen.getByText("7 leadership roles; most recently Senior Vice President, CIO")).toBeInTheDocument();
    expect(screen.getByText(/Combined token usage from Claude Code, Codex, and OpenCode/i)).toBeInTheDocument();
    expect(screen.getByText(/including archived Codex sessions and Qwen models recorded by OpenCode/i)).toBeInTheDocument();
    expect(screen.getByText(/Ollama coverage:/i)).toBeInTheDocument();
    expect(screen.getByText(/Those server logs do not expose token totals/i)).toBeInTheDocument();
    const slopmeterImage = screen.getByAltText(/Combined Slopmeter usage snapshot/i);
    expect(slopmeterImage).toBeInTheDocument();
    expect(slopmeterImage.getAttribute("src")).toMatch(/heatmap-last-year\.[a-f0-9]{12}\.svg/);
    expect(screen.getByRole("link", { name: /US 12184814/i })).toHaveAttribute(
      "href",
      "https://patents.google.com/patent/US12184814B1/en"
    );
    expect(screen.queryByText("Profile JSON")).not.toBeInTheDocument();
  });

  it("renders about page content", async () => {
    render(await AboutPage());
    expect(screen.getAllByRole("heading", { name: "About" })).toHaveLength(1);
    expect(screen.getByText(/enterprise financial-services CIO and CTO with 25\+ years/i)).toBeInTheDocument();
  });

  it("renders projects page content", async () => {
    render(await ProjectsPage());
    expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByText(/Public repositories and shipped systems work/)).toBeInTheDocument();
  });

  it("renders resume page content", async () => {
    render(await ResumePage());
    expect(screen.getByRole("heading", { name: "Resume" })).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Patents")).toBeInTheDocument();
    expect(screen.getByText("Feb 2023 – Jun 2026")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /US 12184814/i })[0]).toHaveAttribute(
      "href",
      "https://patents.google.com/patent/US12184814B1/en"
    );
  });
});
