import type { Metadata } from "next";
import { loadResume } from "@/lib/content";
import { Section } from "@/components/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Resume",
  description: "Professional experience and education for jmcte.me."
};

function formatCareerDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatDateRange(startAt: string, endAt?: string) {
  return `${formatCareerDate(startAt)} – ${endAt ? formatCareerDate(endAt) : "Present"}`;
}

function formatPatentDate(issuedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${issuedAt}T00:00:00Z`));
}

export default async function ResumePage() {
  const resume = await loadResume();

  return (
    <div className="space-y-10">
      <Section heading="Resume" description="Selected leadership and technical roles from a 25+ year career." />

      <section data-site-loader-item className="space-y-4">
        <h3 className="text-xl font-semibold">Experience</h3>
        <div className="space-y-4">
          {resume.experience.map((entry) => (
            <Card key={`${entry.org}-${entry.title}`} className="space-y-3 p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <h4 className="text-lg font-semibold">{entry.title}</h4>
                <span className="text-sm text-muted-foreground">{formatDateRange(entry.startAt, entry.endAt)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{entry.org}</p>
              <ul className="ml-5 list-disc space-y-1">
                {entry.bullets.map((bullet) => (
                  <li key={bullet} className="text-sm text-muted-foreground">
                    {bullet}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section data-site-loader-item className="space-y-4">
        <h3 className="text-xl font-semibold">Patents</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {resume.patents.map((patent) => (
            <Card key={patent.patentNumber} className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <a
                  href={patent.url}
                  target="_blank"
                  rel="noreferrer"
                  className="max-w-xl text-lg font-semibold text-foreground underline-offset-4 transition hover:text-primary hover:underline"
                >
                  {patent.title}
                </a>
                <a href={patent.url} target="_blank" rel="noreferrer">
                  <Badge variant="outline">US {patent.patentNumber}</Badge>
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Issued {formatPatentDate(patent.issuedAt)}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section data-site-loader-item className="space-y-4">
        <h3 className="text-xl font-semibold">Education</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {resume.education.map((education) => (
            <Card key={education.school} className="space-y-2 p-5">
              <h4 className="text-lg font-semibold">{education.school}</h4>
              <p className="text-sm text-muted-foreground">{education.degree}</p>
              {education.notes ? <p className="text-sm text-muted-foreground">{education.notes}</p> : null}
            </Card>
          ))}
        </div>
      </section>

      <section data-site-loader-item className="space-y-4">
        <h3 className="text-xl font-semibold">Skills</h3>
        <div className="space-y-3">
          <div className="space-x-2">
            {resume.skills.technical.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
          <div className="space-x-2">
            {resume.skills.tools.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
          <div className="space-x-2">
            {resume.skills.soft.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
