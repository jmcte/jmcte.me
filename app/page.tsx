import type { Metadata } from "next";
import { loadProfile, loadProjects, loadResume } from "@/lib/content";
import { HomeShowcase } from "@/components/home/home-showcase";
import { PersonStructuredData, ProjectsStructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  title: {
    absolute: "John McChesney TenEyck Jr. | JMCTE"
  },
  description:
    "Enterprise financial-services CIO and CTO portfolio for John McChesney TenEyck Jr."
};

export default async function HomePage() {
  const [profile, projectsPayload, resume] = await Promise.all([
    loadProfile(),
    loadProjects(),
    loadResume()
  ]);

  return (
    <>
      <PersonStructuredData profile={profile} />
      <ProjectsStructuredData projects={projectsPayload} />
      <HomeShowcase profile={profile} projects={projectsPayload} resume={resume} />
    </>
  );
}
