import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import slopmeterSnapshot from "@/content/slopmeter.json";
import type {
  PatentItem,
  ProfilePayload,
  ProjectsPayload,
  ResumePayload,
  ResumeSectionItem
} from "@/lib/types";
import {
  ArrowUpRightIcon,
  FileTextIcon,
  FolderKanbanIcon,
  GithubIcon,
  LockIcon,
  ShieldCheckIcon,
  UserIcon
} from "@/components/icons/animated";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type HomeShowcaseProps = {
  profile: ProfilePayload;
  projects: ProjectsPayload;
  resume: ResumePayload;
};

type TrajectoryStop = {
  org: string;
  role: string;
  dates: string;
};

type Lane = {
  title: string;
  summary: string;
  icon: typeof ShieldCheckIcon;
};

const signalMetrics = [
  {
    value: "3,200",
    label: "Employees + partners led"
  },
  {
    value: "$1.2B",
    label: "Direct budget accountability"
  },
  {
    value: "$415M",
    label: "Departmental budget reduction"
  }
];

const operatingLanes: Lane[] = [
  {
    title: "Enterprise technology strategy",
    summary: "Business-aligned investment and architecture across P&C, banking, life, investment, and retirement.",
    icon: ShieldCheckIcon
  },
  {
    title: "Operational resilience",
    summary: "Infrastructure, cloud, recoverability, reliability, and modernization at regulated-enterprise scale.",
    icon: FolderKanbanIcon
  },
  {
    title: "Board and regulatory governance",
    summary: "Technology economics, material risk, OCC and Federal Reserve engagement, and disciplined execution.",
    icon: FileTextIcon
  },
  {
    title: "M&A, investment and innovation",
    summary: "Technology diligence, integration strategy, venture review, AI, and patented platform innovation.",
    icon: LockIcon
  }
];

function revealStyle(index: number): CSSProperties {
  return {
    "--site-loader-index": index
  } as CSSProperties;
}

function formatSnapshotDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatProviderList(providers: string[]) {
  return new Intl.ListFormat("en-US", {
    style: "long",
    type: "conjunction"
  }).format(providers);
}

function formatPatentDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}

function yearFromDate(date: string) {
  return new Date(date).getUTCFullYear();
}

function formatCareerDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}

function normalizeTrajectoryOrganization(org: string) {
  const organization = org.split(" (")[0];
  return organization === "Honeywell International" ? "Honeywell" : organization;
}

function buildTrajectory(experience: ResumeSectionItem[]): TrajectoryStop[] {
  const groupedStops = new Map<
    string,
    {
      org: string;
      role: string;
      roleCount: number;
      startAt: string;
      endAt?: string;
    }
  >();

  for (const entry of experience) {
    const org = normalizeTrajectoryOrganization(entry.org);
    const role = entry.title.split(" - ")[0].split(" – ")[0].trim();
    const existing = groupedStops.get(org);

    if (!existing) {
      groupedStops.set(org, {
        org,
        role,
        roleCount: 1,
        startAt: entry.startAt,
        endAt: entry.endAt
      });
      continue;
    }

    existing.roleCount += 1;
    existing.startAt = existing.startAt < entry.startAt ? existing.startAt : entry.startAt;
    existing.endAt =
      existing.endAt === undefined || entry.endAt === undefined
        ? undefined
        : existing.endAt > entry.endAt
          ? existing.endAt
          : entry.endAt;
  }

  return [...groupedStops.values()]
    .sort((left, right) => left.startAt.localeCompare(right.startAt))
    .map((stop) => ({
      org: stop.org,
      role:
        stop.roleCount > 1
          ? `${stop.roleCount} leadership roles; most recently ${stop.role}`
          : stop.role,
      dates: `${formatCareerDate(stop.startAt)} – ${stop.endAt ? formatCareerDate(stop.endAt) : "Present"}`
    }));
}

export function HomeShowcase({ profile, projects, resume }: HomeShowcaseProps) {
  const featuredProject = projects.projects.find((project) => project.featured) ?? projects.projects[0];
  const githubProfile = profile.socials.find((social) => social.label === "GitHub");
  const trajectory = buildTrajectory(resume.experience);
  const publicSkillSet = profile.skills.slice(0, 8);
  const recentPatents = resume.patents.slice(0, 6);
  const patentFamilies = new Set(resume.patents.map((patent) => patent.title)).size;
  const patentActiveWindow =
    resume.patents.length > 0
      ? `${yearFromDate(resume.patents[resume.patents.length - 1].issuedAt)}-${yearFromDate(resume.patents[0].issuedAt)}`
      : null;
  const slopmeterWindow = `${formatSnapshotDate(slopmeterSnapshot.startDate)} - ${formatSnapshotDate(slopmeterSnapshot.endDate)}`;
  const slopmeterProviders = formatProviderList(slopmeterSnapshot.providers);
  const slopmeterAlt = `Combined Slopmeter usage snapshot for ${slopmeterProviders} from ${formatSnapshotDate(slopmeterSnapshot.startDate)} through ${formatSnapshotDate(slopmeterSnapshot.endDate)}.`;
  const ollamaCoverage = slopmeterSnapshot.coverage.ollama;
  const ollamaWindow =
    ollamaCoverage.startDate && ollamaCoverage.endDate
      ? `${formatSnapshotDate(ollamaCoverage.startDate)} - ${formatSnapshotDate(ollamaCoverage.endDate)}`
      : "No retained request history";

  return (
    <div className="space-y-8 sm:space-y-10">
      <section
        data-site-loader-item
        style={revealStyle(0)}
        className="grid min-h-[calc(100svh-7rem)] gap-6 xl:grid-cols-[1.2fr_0.8fr]"
      >
        <Card className="home-hero-panel overflow-hidden p-7 sm:p-8 xl:p-10">
          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="solid" className="bg-primary/90 text-primary-foreground">
                  Executive Technology Portfolio
                </Badge>
                <Badge className="border-white/20 bg-white/10 text-white">CIO / CTO</Badge>
                <Badge className="border-white/20 bg-white/10 text-white">Financial Services</Badge>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl leading-[0.95] font-semibold tracking-tight text-white sm:text-6xl xl:text-7xl">
                  {profile.name}
                </h1>
                <p className="max-w-2xl text-lg text-white/78 sm:text-xl">{profile.title}</p>
                <p className="max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
                  {profile.bio}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/50 sm:text-sm">
                  {profile.location}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-95"
                >
                  See projects
                  <ArrowUpRightIcon size={16} className="shrink-0" aria-hidden />
                </Link>
                <Link
                  href="/resume"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  <FileTextIcon size={16} className="shrink-0" aria-hidden />
                  Resume
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  <UserIcon size={16} className="shrink-0" aria-hidden />
                  Background
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {signalMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/14 bg-slate-950/35 px-4 py-4 backdrop-blur-sm"
                  >
                    <p className="text-2xl font-semibold text-white sm:text-3xl">{metric.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/52">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="overflow-hidden p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                  Leadership map
                </p>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Architecture, operations, resilience, and modernization.
                </p>
              </div>
              <ShieldCheckIcon
                size={20}
                className="text-primary/70 transition-transform duration-300 group-hover:scale-105"
                aria-hidden
              />
            </div>

            <div className="home-radar-shell relative mt-6 aspect-square rounded-lg border border-white/10 bg-slate-950/70">
              <div className="home-radar-grid absolute inset-0 rounded-lg" aria-hidden />
              <div className="absolute inset-[14%] rounded-full border border-white/12" aria-hidden />
              <div className="absolute inset-[28%] rounded-full border border-white/12" aria-hidden />
              <div className="absolute inset-[42%] rounded-full border border-white/12" aria-hidden />
              <div
                className="absolute inset-y-[14%] left-1/2 w-px -translate-x-1/2 bg-white/12"
                aria-hidden
              />
              <div
                className="absolute top-1/2 right-[14%] left-[14%] h-px -translate-y-1/2 bg-white/12"
                aria-hidden
              />
              <div className="absolute inset-[10%] rounded-full home-radar-sweep opacity-80" aria-hidden />
              <span
                className="home-signal-dot"
                style={
                  {
                    "--dot-x": "24%",
                    "--dot-y": "34%",
                    "--dot-delay": "0s"
                  } as CSSProperties
                }
                aria-hidden
              />
              <span
                className="home-signal-dot"
                style={
                  {
                    "--dot-x": "68%",
                    "--dot-y": "26%",
                    "--dot-delay": "0.5s"
                  } as CSSProperties
                }
                aria-hidden
              />
              <span
                className="home-signal-dot"
                style={
                  {
                    "--dot-x": "56%",
                    "--dot-y": "62%",
                    "--dot-delay": "1s"
                  } as CSSProperties
                }
                aria-hidden
              />
              <span
                className="home-signal-dot"
                style={
                  {
                    "--dot-x": "34%",
                    "--dot-y": "72%",
                    "--dot-delay": "1.5s"
                  } as CSSProperties
                }
                aria-hidden
              />

              <div className="absolute right-5 bottom-5 left-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/72 p-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">
                    Scope
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">Global regulated enterprise</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/72 p-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">
                    Mode
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    Disciplined execution under pressure
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="muted" className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
              Professional channels
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {githubProfile ? (
                <a
                  href={githubProfile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-border/70 bg-card/80 p-4 transition hover:border-primary/40 hover:bg-card"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">GitHub</p>
                      <p className="mt-1 text-sm text-muted-foreground">{githubProfile.handle}</p>
                    </div>
                    <GithubIcon
                      size={18}
                      className="text-muted-foreground group-hover:text-primary"
                      aria-hidden
                    />
                  </div>
                </a>
              ) : null}
              <Link
                href="/contact"
                className="group rounded-2xl border border-border/70 bg-card/80 p-4 transition hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Access policy</p>
                    <p className="mt-1 text-sm text-muted-foreground">Executive conversations</p>
                  </div>
                  <LockIcon
                    size={18}
                    className="text-muted-foreground group-hover:text-primary"
                    aria-hidden
                  />
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <section
        data-site-loader-item
        style={revealStyle(1)}
        className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <Card className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                Operating lanes
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Enterprise-scale leadership with delivery discipline.
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {operatingLanes.map((lane) => {
              const Icon = lane.icon;

              return (
                <article
                  key={lane.title}
                  className="rounded-lg border border-border/70 bg-card/70 p-5"
                >
                  <Icon size={18} className="text-primary" aria-hidden />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{lane.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{lane.summary}</p>
                </article>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
            Career trajectory
          </p>
          <div className="mt-6 space-y-4">
            {trajectory.map((stop, index) => (
              <div
                key={stop.org}
                className="grid gap-3 rounded-lg border border-border/70 bg-card/65 px-5 py-4 sm:grid-cols-[auto_minmax(0,1fr)_12rem]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">{stop.org}</p>
                  <p className="text-sm text-muted-foreground">{stop.role}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-primary/75 sm:justify-self-end sm:whitespace-nowrap sm:text-right">
                  {stop.dates}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section
        data-site-loader-item
        style={revealStyle(2)}
        className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]"
      >
        <Card variant="muted" className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                Patent record
              </p>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
                Issued work across service routing, estimation, and platform operations.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                Publicly listed grants cover machine-learning service routing, image-based
                estimation, dynamic resource allocation, and rapid data access.
              </p>
            </div>
            <Badge className="border-primary/20 bg-primary/10 text-primary-foreground/90">
              Selected grants
            </Badge>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/70 bg-card/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/70">
                Listed grants
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{resume.patents.length}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/70">
                Title families
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{patentFamilies}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/70">
                Active years
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{patentActiveWindow}</p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-5 py-3 text-sm font-semibold transition hover:border-primary/40 hover:bg-card"
            >
              Review full patent section
              <ArrowUpRightIcon size={16} className="shrink-0" aria-hidden />
            </Link>
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
            Recent grants
          </p>
          <div className="mt-6 space-y-4">
            {recentPatents.map((patent: PatentItem) => (
              <a
                key={patent.patentNumber}
                href={patent.url}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-lg border border-border/70 bg-card/65 px-5 py-4 transition hover:border-primary/40 hover:bg-card/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-foreground transition group-hover:text-primary">
                      {patent.title}
                    </p>
                    <p className="text-sm text-muted-foreground">US {patent.patentNumber}</p>
                  </div>
                  <Badge className="border-border/70 bg-background/50 text-foreground">
                    {formatPatentDate(patent.issuedAt)}
                  </Badge>
                </div>
              </a>
            ))}
          </div>
        </Card>
      </section>

      <section
        data-site-loader-item
        style={revealStyle(3)}
        className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <Card variant="accent" className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                Selected work
              </p>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
                Featured public repository
              </h2>
            </div>
            <FolderKanbanIcon size={20} className="text-primary" aria-hidden />
          </div>

          {featuredProject ? (
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-3xl font-semibold text-foreground">{featuredProject.title}</p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {featuredProject.summary}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {featuredProject.stack.map((entry) => (
                  <Badge
                    key={entry}
                    className="border-primary/20 bg-background/40 text-foreground"
                  >
                    {entry}
                  </Badge>
                ))}
              </div>

              {featuredProject.url ? (
                <a
                  href={featuredProject.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/70 px-5 py-3 text-sm font-semibold transition hover:border-primary/55 hover:bg-background"
                >
                  View public repo
                  <ArrowUpRightIcon size={16} className="shrink-0" aria-hidden />
                </a>
              ) : null}
            </div>
          ) : null}
        </Card>

        <div className="grid gap-6">
          <Card className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
              Capability mix
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {publicSkillSet.map((skill) => (
                <Badge key={skill} className="border-border/70 bg-card/80 text-foreground">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          <Card variant="muted" className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
              Explore
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href="/projects"
                className="group rounded-2xl border border-border/70 bg-card/80 p-4 transition hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Projects</p>
                    <p className="mt-1 text-sm text-muted-foreground">Curated public casework</p>
                  </div>
                  <FolderKanbanIcon
                    size={18}
                    className="text-muted-foreground group-hover:text-primary"
                    aria-hidden
                  />
                </div>
              </Link>
              <Link
                href="/resume"
                className="group rounded-2xl border border-border/70 bg-card/80 p-4 transition hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Resume</p>
                    <p className="mt-1 text-sm text-muted-foreground">Role history and scope</p>
                  </div>
                  <FileTextIcon
                    size={18}
                    className="text-muted-foreground group-hover:text-primary"
                    aria-hidden
                  />
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <section
        data-site-loader-item
        style={revealStyle(4)}
        className="grid gap-6"
      >
        <Card className="overflow-hidden p-4 sm:p-5">
          <div className="rounded-lg border border-white/10 bg-slate-950/92 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                  AI development activity
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Combined token usage from {slopmeterProviders}, including archived Codex sessions and
                  Qwen models recorded by OpenCode, for {slopmeterWindow}.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Image
                src={slopmeterSnapshot.image}
                alt={slopmeterAlt}
                width={4000}
                height={1699}
                loading="eager"
                className="h-auto min-w-[42rem] rounded-lg border border-white/5 sm:min-w-0 sm:w-full"
              />
            </div>

            <p className="px-2 pt-3 text-xs leading-relaxed text-muted-foreground">
              Ollama coverage: {ollamaCoverage.requestCount.toLocaleString("en-US")} successful local
              inference requests in retained logs ({ollamaWindow}). Those server logs do not expose token
              totals, so request counts are reported separately and are not added to the chart.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
