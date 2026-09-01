import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import type { ProfilePayload, ResumePayload } from "@/lib/types";
import type { ProjectsPayload } from "@/lib/types";

function isoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value);
}

describe("machine-readable payloads", () => {
  const root = process.cwd();

  it("exports profile payload contract", () => {
    const profile: ProfilePayload = JSON.parse(readFileSync(join(root, "public", "profile.json"), "utf8"));
    expect(profile.name).toBe("John McChesney TenEyck Jr.");
    expect(isoDate(profile.updatedAt)).toBe(true);
    expect(Array.isArray(profile.socials)).toBe(true);
    expect(profile.socials.length).toBeGreaterThan(0);
    expect(profile.socials.find((social) => social.label === "LinkedIn")?.url).toBe(
      "https://www.linkedin.com/in/johnmteneyckjr"
    );
    expect(profile.bio).toContain("3,200-person global workforce");
  });

  it("exports projects payload contract", () => {
    const projectsPayload: ProjectsPayload = JSON.parse(
      readFileSync(join(root, "public", "projects.json"), "utf8")
    );
    expect(Array.isArray(projectsPayload.projects)).toBe(true);
    expect(projectsPayload.projects.length).toBeGreaterThan(0);
    expect(isoDate(projectsPayload.generatedAt)).toBe(true);
    expect(typeof projectsPayload.projects[0].id).toBe("string");
  });

  it("exports resume payload contract", () => {
    const resumePayload: ResumePayload = JSON.parse(readFileSync(join(root, "public", "resume.json"), "utf8"));
    expect(Array.isArray(resumePayload.experience)).toBe(true);
    expect(Array.isArray(resumePayload.education)).toBe(true);
    expect(Array.isArray(resumePayload.skills.technical)).toBe(true);
    expect(Array.isArray(resumePayload.patents)).toBe(true);
    expect(resumePayload.patents.length).toBeGreaterThan(0);
    expect(resumePayload.patents[0]?.patentNumber).toBe("12184814");
    expect(resumePayload.patents.every((patent) => patent.url.startsWith("https://patents.google.com/patent/US"))).toBe(true);
    expect(isoDate(resumePayload.updatedAt)).toBe(true);
    expect(resumePayload.experience[0]?.endAt).toBe("2026-06-08");
    expect(resumePayload.experience[0]?.bullets.join(" ")).toContain("$415M");
    expect(resumePayload.experience[1]?.bullets.join(" ")).toContain("Noblr");
    expect(resumePayload.links.find((link) => link.label === "LinkedIn")?.url).toBe(
      "https://www.linkedin.com/in/johnmteneyckjr"
    );
  });

  it("exposes robots, sitemap, and security metadata", () => {
    const robots = readFileSync(join(root, "public", "robots.txt"), "utf8");
    const sitemap = readFileSync(join(root, "public", "sitemap.xml"), "utf8");
    const security = readFileSync(join(root, "public", ".well-known/security.txt"), "utf8");
    expect(robots).toContain("Sitemap: https://jmcte.me/sitemap.xml");
    expect(sitemap).toContain("<urlset");
    expect(security).toContain("Contact: https://jmcte.me/contact");
  });
});
