import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  persona,
  journeySteps,
  scholarships,
  discoveryResources,
  essayPrompt,
  essayDraft,
  essayFeedback,
  submissionChecklist,
} from "@/lib/persona";
import {
  useUser,
  initials as toInitials,
  type EducationLevel,
  type UserProfile,
} from "@/lib/userStore";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Maya's Journey · Scholar-E" },
      {
        name: "description",
        content:
          "A 17-step walkthrough of Scholar-E as Maya Rodriguez, a first-gen CS sophomore at Rice applying for scholarships.",
      },
    ],
  }),
  component: Journey,
});

function Journey() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = journeySteps[stepIdx];
  const goNext = () => setStepIdx((i) => Math.min(i + 1, journeySteps.length - 1));
  const goPrev = () => setStepIdx((i) => Math.max(i - 1, 0));

  return (
    <div className="min-h-screen flex">
      <Sidebar activeIdx={stepIdx} onSelect={setStepIdx} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar step={step} onNext={goNext} onPrev={goPrev} stepIdx={stepIdx} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-6 md:px-10 py-10">
            <StepHeader step={step} />
            <div className="mt-8">
              <StepBody slug={step.slug} />
            </div>
            <Nav stepIdx={stepIdx} onNext={goNext} onPrev={goPrev} />
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ activeIdx, onSelect }: { activeIdx: number; onSelect: (i: number) => void }) {
  const groups = useMemo(() => {
    const map = new Map<string, typeof journeySteps>();
    journeySteps.forEach((s) => {
      const arr = map.get(s.group) ?? [];
      arr.push(s);
      map.set(s.group, arr);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <aside className="hidden lg:flex w-80 shrink-0 flex-col border-r border-border bg-card/60 backdrop-blur sticky top-0 h-screen">
      <Link to="/" className="flex items-center gap-2 px-6 h-16 border-b border-border">
        <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-bold">
          S<span className="text-gold">e</span>
        </div>
        <div className="font-display font-semibold tracking-tight">Scholar-E</div>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">journey</span>
      </Link>

      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-display">
            {persona.initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{persona.name}</div>
            <div className="text-xs text-muted-foreground truncate">{persona.level}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map(([group, steps]) => (
          <div key={group}>
            <div className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{group}</div>
            <div className="space-y-0.5">
              {steps.map((s) => {
                const idx = s.id - 1;
                const isActive = idx === activeIdx;
                const isDone = idx < activeIdx;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground/80"
                    }`}
                  >
                    <span
                      className={`size-6 shrink-0 rounded-full grid place-items-center text-[11px] font-mono ${
                        isActive
                          ? "bg-gold text-gold-foreground"
                          : isDone
                          ? "bg-success/20 text-success"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {isDone ? "✓" : s.id}
                    </span>
                    <span className="truncate">{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-border text-[11px] text-muted-foreground">
        A coach, not a ghostwriter.
      </div>
    </aside>
  );
}

function TopBar({
  step,
  onNext,
  onPrev,
  stepIdx,
}: {
  step: (typeof journeySteps)[number];
  onNext: () => void;
  onPrev: () => void;
  stepIdx: number;
}) {
  const pct = ((stepIdx + 1) / journeySteps.length) * 100;
  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="px-6 md:px-10 h-16 flex items-center gap-4">
        <Link to="/" className="lg:hidden font-display font-semibold">
          Scholar-E
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground">
            Step {step.id} of {journeySteps.length} · {step.group}
          </div>
          <div className="text-sm font-medium truncate">{step.title}</div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={stepIdx === 0}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-40"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            disabled={stepIdx === journeySteps.length - 1}
            className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm hover:opacity-90 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
      <div className="h-1 bg-secondary">
        <div className="h-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StepHeader({ step }: { step: (typeof journeySteps)[number] }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <div className="font-mono text-xs text-gold uppercase tracking-widest">
          Step {String(step.id).padStart(2, "0")} · {step.group}
        </div>
        <h1 className="font-display text-4xl md:text-5xl mt-2 text-balance">{step.title}</h1>
        <div className="text-sm text-muted-foreground mt-2">Goal: {step.goal}</div>
      </div>
      <div className="hidden md:flex size-14 rounded-2xl bg-primary text-primary-foreground items-center justify-center font-display text-2xl shrink-0">
        {step.id}
      </div>
    </div>
  );
}

function Nav({ stepIdx, onNext, onPrev }: { stepIdx: number; onNext: () => void; onPrev: () => void }) {
  return (
    <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
      <button
        onClick={onPrev}
        disabled={stepIdx === 0}
        className="rounded-full border border-border bg-card px-5 py-2 text-sm hover:bg-accent disabled:opacity-40"
      >
        ← Previous
      </button>
      <div className="text-xs text-muted-foreground font-mono">
        {stepIdx + 1} / {journeySteps.length}
      </div>
      <button
        onClick={onNext}
        disabled={stepIdx === journeySteps.length - 1}
        className="rounded-full bg-primary text-primary-foreground px-6 py-2 text-sm hover:opacity-90 disabled:opacity-40"
      >
        Continue →
      </button>
    </div>
  );
}

/* --------------------------- Step body dispatcher --------------------------- */

function StepBody({ slug }: { slug: string }) {
  switch (slug) {
    case "land": return <StepLand />;
    case "onboarding": return <StepOnboarding />;
    case "profile": return <StepProfile />;
    case "discovery": return <StepDiscovery />;
    case "opportunities": return <StepOpportunities />;
    case "import": return <StepImport />;
    case "requirements": return <StepRequirements />;
    case "fit": return <StepFit />;
    case "materials": return <StepMaterials />;
    case "essay-upload": return <StepEssayUpload />;
    case "ai-evaluate": return <StepAIEvaluate />;
    case "scores": return <StepScores />;
    case "highlights": return <StepHighlights />;
    case "revise": return <StepRevise />;
    case "resubmit": return <StepResubmit />;
    case "final-check": return <StepFinalCheck />;
    case "tracker": return <StepTracker />;
    default: return null;
  }
}

/* ----------------------------- Reusable atoms ----------------------------- */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-6 ${className}`}>{children}</div>;
}

function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "gold" | "success" | "warn" | "info" | "danger" }) {
  const tones = {
    default: "bg-secondary text-secondary-foreground",
    gold: "bg-gold/20 text-foreground",
    success: "bg-success/15 text-success",
    warn: "bg-warning/20 text-foreground",
    info: "bg-info/15 text-info",
    danger: "bg-destructive/15 text-destructive",
  } as const;
  return <span className={`text-xs rounded-full px-2.5 py-1 ${tones[tone]}`}>{children}</span>;
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-border last:border-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground text-right">{value}</div>
    </div>
  );
}

/* --------------------------------- Steps --------------------------------- */

function StepLand() {
  return (
    <div className="space-y-6">
      <Card className="!p-0 overflow-hidden">
        <div className="p-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="text-xs uppercase tracking-widest opacity-70">scholar-e.app</div>
          <h2 className="font-display text-3xl md:text-4xl mt-2 text-balance">
            Win scholarships in your own voice.
          </h2>
          <p className="mt-3 text-primary-foreground/80 max-w-xl">
            A coach that helps you discover, analyze, write, and submit — without writing your essays for you.
          </p>
          <div className="mt-5 flex gap-2">
            <span className="rounded-full bg-gold text-gold-foreground px-4 py-2 text-sm font-medium">
              Get started — free
            </span>
            <span className="rounded-full border border-primary-foreground/30 px-4 py-2 text-sm">
              I'm a parent
            </span>
          </div>
        </div>
        <div className="p-6 grid sm:grid-cols-3 gap-4 text-sm">
          {["Discover", "Analyze", "Coach", "Track"].slice(0, 3).map((t, i) => (
            <div key={t} className="rounded-xl bg-secondary/60 p-4">
              <div className="font-mono text-xs text-gold">0{i + 1}</div>
              <div className="font-display text-lg mt-1">{t}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-full bg-gold text-gold-foreground grid place-items-center">👋</div>
          <div>
            <div className="font-medium">Maya lands on the homepage from a SHPE Slack link.</div>
            <p className="text-sm text-muted-foreground mt-1">
              She's heard about scholarships but doesn't know where to start. The hero copy makes one promise
              clear: <em>she'll still be the author</em>.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepOnboarding() {
  const slides = [
    {
      t: "What is a scholarship?",
      d: "Free money for school — never paid back. Awarded by foundations, employers, governments, and schools.",
    },
    {
      t: "Three types you should know",
      d: "Merit (grades, talent), need-based (income), and identity / community (heritage, major, location, status).",
    },
    {
      t: "How Scholar-E helps",
      d: "We don't write your essay. We help you find scholarships, understand requirements, and improve your drafts.",
    },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Onboarding · 3 of 3 read</div>
        <div className="mt-3 grid md:grid-cols-3 gap-4">
          {slides.map((s, i) => (
            <div key={s.t} className="rounded-xl border border-border bg-secondary/40 p-5">
              <div className="font-mono text-xs text-gold">0{i + 1}</div>
              <div className="font-display text-lg mt-2">{s.t}</div>
              <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3">
          <input type="checkbox" defaultChecked className="size-4 accent-[oklch(0.32_0.09_270)]" />
          <span className="text-sm">I understand Scholar-E is a coach, not a ghostwriter.</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <input type="checkbox" defaultChecked className="size-4 accent-[oklch(0.32_0.09_270)]" />
          <span className="text-sm">I'll keep my essays in my own voice and authorship.</span>
        </div>
      </Card>
    </div>
  );
}

function StepProfile() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <div className="size-16 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-display text-2xl">
          {persona.initials}
        </div>
        <div className="mt-4 font-display text-xl">{persona.name}</div>
        <div className="text-sm text-muted-foreground">{persona.pronouns}</div>
        <div className="mt-4 space-y-1.5">
          <Pill tone="gold">First-generation</Pill>{" "}
          <Pill tone="gold">Pell-eligible</Pill>{" "}
          <Pill>Texas resident</Pill>
        </div>
        <div className="mt-5 text-sm text-muted-foreground">
          <span className="text-foreground font-medium">87%</span> complete — strong applications need a complete profile.
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-gold" style={{ width: "87%" }} />
        </div>
      </Card>

      <Card className="md:col-span-2">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Academic profile</div>
        <div className="mt-3">
          <FieldRow label="School" value={persona.school} />
          <FieldRow label="Education level" value={persona.level} />
          <FieldRow label="Major / Minor" value={`${persona.major} / ${persona.minor}`} />
          <FieldRow label="GPA" value={persona.gpa} />
          <FieldRow label="Location" value={`${persona.location} (from ${persona.hometown})`} />
          <FieldRow label="Email" value={persona.email} />
        </div>

        <div className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">Career goal</div>
        <p className="mt-2 text-sm text-foreground/90">{persona.careerGoal}</p>

        <div className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">Experiences</div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          {[
            ["Research", persona.experiences.research],
            ["Leadership", persona.experiences.leadership],
            ["Work", persona.experiences.work],
            ["Volunteer", persona.experiences.volunteer],
          ].map(([label, arr]) => (
            <div key={label as string} className="rounded-xl bg-secondary/40 p-3">
              <div className="text-xs font-medium text-muted-foreground">{label as string}</div>
              {(arr as { title: string; when: string }[]).map((e) => (
                <div key={e.title} className="mt-2 text-sm">
                  <div className="font-medium leading-tight">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.when}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">Awards</div>
        <ul className="mt-2 text-sm space-y-1 text-foreground/90 list-disc pl-5">
          {persona.experiences.awards.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </Card>
    </div>
  );
}

function StepDiscovery() {
  const qs = [
    { q: "Education level", a: persona.level },
    { q: "Major category", a: "STEM — Computer Science" },
    { q: "Location", a: `${persona.location}` },
    { q: "First-generation?", a: "Yes" },
    { q: "Financial need?", a: "Pell-eligible" },
    { q: "Identity-based categories", a: "Hispanic / Latina, Woman in tech" },
    { q: "Career interests", a: "ML research, healthcare AI" },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Your answers</div>
        <div className="mt-3">
          {qs.map((q) => <FieldRow key={q.q} label={q.q} value={q.a} />)}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Personalized resources
          </div>
          <Pill tone="info">Rule-based engine</Pill>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Curated for first-gen Latina CS undergrads in Texas. We don't scrape — we point you to the right places.
        </p>
        <div className="mt-4 space-y-3">
          {discoveryResources.map((r) => (
            <div key={r.name} className="flex items-start gap-3 rounded-xl border border-border p-3">
              <div className="size-9 rounded-lg bg-gold/20 grid place-items-center font-display">
                {r.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.reason}</div>
                <div className="text-xs font-mono text-info mt-0.5">{r.url}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StepOpportunities() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="gold">Match ≥ 80%</Pill>
        <Pill>STEM</Pill>
        <Pill>First-gen</Pill>
        <Pill>Texas</Pill>
        <Pill>Deadline ≤ 60 days</Pill>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {scholarships.map((s) => (
          <Card key={s.id} className="!p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-lg leading-tight">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.sponsor}</div>
              </div>
              <MatchRing score={s.matchScore} />
            </div>
            <p className="text-sm text-muted-foreground mt-3">{s.blurb}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.tags.map((t) => <Pill key={t}>{t}</Pill>)}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <div className="font-display text-lg text-foreground">{s.amount}</div>
                <div className="text-xs text-muted-foreground">{s.deadline}</div>
              </div>
              <button
                className={`rounded-full px-3 py-1.5 text-xs ${
                  s.eligibilityScore === 0
                    ? "bg-destructive/15 text-destructive cursor-not-allowed"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {s.eligibilityScore === 0 ? "Not eligible" : "Analyze →"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MatchRing({ score }: { score: number }) {
  const circ = 2 * Math.PI * 18;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--destructive)";
  return (
    <div className="relative size-12">
      <svg viewBox="0 0 44 44" className="size-12 -rotate-90">
        <circle cx="22" cy="22" r="18" stroke="var(--border)" strokeWidth="4" fill="none" />
        <circle
          cx="22" cy="22" r="18"
          stroke={color}
          strokeWidth="4" fill="none" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xs font-mono">{score}</div>
    </div>
  );
}

function StepImport() {
  const [url, setUrl] = useState("https://shpe.org/scholarships/foundation-2026");
  const [parsed, setParsed] = useState(true);
  return (
    <div className="space-y-6">
      <Card>
        <label className="text-xs uppercase tracking-widest text-muted-foreground">
          Paste a scholarship link or description
        </label>
        <div className="mt-2 flex gap-2">
          <input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setParsed(false); }}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
            placeholder="https://..."
          />
          <button
            onClick={() => setParsed(true)}
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90"
          >
            Analyze
          </button>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Or paste the scholarship description text directly. Scholar-E doesn't scrape — it parses what you give it.
        </div>
      </Card>

      {parsed && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              <div className="text-sm font-medium">Parsed successfully</div>
            </div>
            <Pill tone="success">extracted in 2.4s</Pill>
          </div>
          <div className="mt-4">
            <FieldRow label="Scholarship name" value="SHPE Foundation Scholarship 2026" />
            <FieldRow label="Sponsor" value="Society of Hispanic Professional Engineers" />
            <FieldRow label="Award amount" value="$5,000" />
            <FieldRow label="Application deadline" value="April 30, 2026 (11:59 PM CT)" />
            <FieldRow label="Notification" value="June 15, 2026" />
            <FieldRow label="Renewable" value="No — single-year award" />
          </div>
        </Card>
      )}
    </div>
  );
}

function StepRequirements() {
  const reqs = [
    { c: "Eligibility", items: ["Hispanic / Latinx heritage", "U.S. citizen or DACA", "Enrolled full-time", "STEM major", "Minimum 3.0 GPA"] },
    { c: "Required materials", items: ["Resume (PDF, ≤ 2 pages)", "Unofficial transcript", "Two recommendation letters", "FAFSA Student Aid Index"] },
    { c: "Essays", items: ["Personal essay — 500 words", "Short answer — community impact, 250 words"] },
    { c: "Deadlines", items: ["Application: Apr 30, 2026", "Recommender deadline: May 7, 2026"] },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {reqs.map((r) => (
        <Card key={r.c}>
          <div className="text-xs uppercase tracking-widest text-gold">{r.c}</div>
          <ul className="mt-3 space-y-2 text-sm">
            {r.items.map((i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
      <Card className="md:col-span-2 bg-secondary/40">
        <div className="text-sm font-medium">Essay prompt</div>
        <p className="mt-2 text-foreground/90 font-display italic text-lg">"{essayPrompt}"</p>
      </Card>
    </div>
  );
}

function StepFit() {
  const dims = [
    { name: "Eligibility", score: 100, note: "You meet every required criterion." },
    { name: "Academic strength", score: 92, note: "GPA 3.87 well above 3.0 minimum." },
    { name: "Leadership evidence", score: 88, note: "Strong SHPE leadership; quantify hours." },
    { name: "Community impact", score: 90, note: "Code-with-Me nights are a standout." },
    { name: "Narrative alignment", score: 80, note: "Tie your goals more explicitly to SHPE's mission." },
  ];
  const overall = Math.round(dims.reduce((a, d) => a + d.score, 0) / dims.length);
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-1 flex flex-col items-center justify-center text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Overall fit</div>
        <div className="relative mt-3 size-44">
          <svg viewBox="0 0 100 100" className="size-44 -rotate-90">
            <circle cx="50" cy="50" r="42" stroke="var(--border)" strokeWidth="8" fill="none" />
            <circle
              cx="50" cy="50" r="42"
              stroke="var(--gold)" strokeWidth="8" fill="none" strokeLinecap="round"
              strokeDasharray={`${(overall / 100) * 2 * Math.PI * 42} 999`}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div>
              <div className="font-display text-5xl">{overall}</div>
              <div className="text-xs text-muted-foreground">/ 100</div>
            </div>
          </div>
        </div>
        <Pill tone="success">Strong fit</Pill>
        <p className="text-xs text-muted-foreground mt-3">
          You'd be a competitive applicant. Focus on tightening your narrative.
        </p>
      </Card>

      <Card className="md:col-span-2">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Dimension breakdown</div>
        <div className="mt-4 space-y-4">
          {dims.map((d) => (
            <div key={d.name}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{d.name}</span>
                <span className="font-mono text-xs">{d.score}/100</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gold transition-all" style={{ width: `${d.score}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{d.note}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm">
          <div className="font-medium">One gap to close</div>
          <p className="text-foreground/80 mt-1">
            Your second recommendation letter (Prof. Alvarez) hasn't been uploaded. Required for submission.
          </p>
        </div>
      </Card>
    </div>
  );
}

function StepMaterials() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Your document vault</div>
        <div className="mt-4 divide-y divide-border">
          {persona.documents.map((d) => (
            <div key={d.name} className="py-3 flex items-center gap-4">
              <div className={`size-10 rounded-lg grid place-items-center text-xs font-mono ${d.uploaded ? "bg-success/15 text-success" : "bg-warning/20 text-foreground"}`}>
                {d.uploaded ? "✓" : "!"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.kind} · {d.size}</div>
              </div>
              {d.uploaded ? <Pill tone="success">Uploaded</Pill> : <Pill tone="warn">Missing</Pill>}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Drag & drop or <span className="text-info underline">browse</span> — PDF, DOCX, PNG up to 10MB.
        </div>
      </Card>
    </div>
  );
}

function StepEssayUpload() {
  return (
    <div className="space-y-6">
      <Card className="bg-secondary/40">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Prompt</div>
        <p className="mt-2 font-display italic text-lg">"{essayPrompt}"</p>
      </Card>
      <Card>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">essay-shpe-foundation-v1.txt</span>
          <span>487 / 500 words · Draft v1</span>
        </div>
        <pre className="mt-4 whitespace-pre-wrap font-display text-[15px] leading-relaxed text-foreground/90">
{essayDraft}
        </pre>
      </Card>
      <Card>
        <button className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90">
          Send to AI Coach for evaluation →
        </button>
      </Card>
    </div>
  );
}

function StepAIEvaluate() {
  const stages = [
    "Reading prompt and rubric",
    "Cross-referencing your profile",
    "Scoring clarity, specificity, leadership, storytelling, impact",
    "Checking alignment with SHPE values",
    "Generating actionable highlights",
  ];
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-gold text-gold-foreground grid place-items-center font-display">AI</div>
        <div>
          <div className="font-medium">Scholar-E Coach is reviewing your essay…</div>
          <div className="text-xs text-muted-foreground">Powered by the LangGraph evaluate_draft node</div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center gap-3 text-sm">
            <div className={`size-6 rounded-full grid place-items-center text-[11px] font-mono ${i < 4 ? "bg-success/20 text-success" : "bg-secondary"}`}>
              {i < 4 ? "✓" : "…"}
            </div>
            <div className={i < 4 ? "" : "text-muted-foreground"}>{s}</div>
            {i === 4 && <div className="flex-1 ml-2 h-1 rounded-full ai-shimmer" />}
          </div>
        ))}
      </div>
      <div className="mt-6 text-xs text-muted-foreground italic">
        Reminder: we don't rewrite your essay. We point out what to improve — you make the change.
      </div>
    </Card>
  );
}

function StepScores() {
  const cats = [
    { name: "Clarity", score: 78 },
    { name: "Specificity", score: 54 },
    { name: "Leadership", score: 86 },
    { name: "Storytelling", score: 68 },
    { name: "Impact", score: 62 },
    { name: "Scholarship alignment", score: 81 },
    { name: "Grammar", score: 94 },
    { name: "Structure", score: 75 },
  ];
  const overall = Math.round(cats.reduce((a, c) => a + c.score, 0) / cats.length);
  return (
    <div className="space-y-6">
      <Card className="grid md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-1 text-center">
          <div className="font-display text-7xl text-primary">{overall}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Overall essay score</div>
          <Pill tone="warn">Promising — needs revision</Pill>
        </div>
        <div className="md:col-span-2 grid sm:grid-cols-2 gap-3">
          {cats.map((c) => (
            <div key={c.name}>
              <div className="flex items-baseline justify-between text-sm">
                <span>{c.name}</span>
                <span className="font-mono text-xs">{c.score}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${c.score}%`,
                    background: c.score >= 80 ? "var(--success)" : c.score >= 65 ? "var(--gold)" : "var(--warning)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Top three things to fix</div>
        <ol className="mt-3 space-y-3 text-sm">
          <li className="flex gap-3"><span className="font-display text-gold">1.</span> Replace 4 vague phrases with concrete sensory details.</li>
          <li className="flex gap-3"><span className="font-display text-gold">2.</span> Quantify the impact of your Code-with-Me nights.</li>
          <li className="flex gap-3"><span className="font-display text-gold">3.</span> Strengthen your closing line to reinforce contribution to SHPE.</li>
        </ol>
      </Card>
    </div>
  );
}

function StepHighlights() {
  // Render the essay with inline highlights tied to feedback.
  const segments = useMemo(() => buildHighlightedSegments(essayDraft, essayFeedback), []);
  const [active, setActive] = useState<number>(0);
  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3">
        <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center justify-between">
          <span>Essay · click a highlight</span>
          <span className="font-mono">{essayFeedback.length} notes</span>
        </div>
        <div className="mt-4 font-display text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {segments.map((seg, i) =>
            seg.fbIndex == null ? (
              <span key={i}>{seg.text}</span>
            ) : (
              <button
                key={i}
                onClick={() => setActive(seg.fbIndex!)}
                className={`rounded px-0.5 underline decoration-2 underline-offset-4 transition-colors ${
                  active === seg.fbIndex
                    ? "bg-gold/60 decoration-gold"
                    : "bg-gold/25 decoration-gold/60 hover:bg-gold/40"
                }`}
              >
                {seg.text}
              </button>
            )
          )}
        </div>
      </Card>

      <Card className="lg:col-span-2 h-fit sticky top-24">
        <FeedbackCard idx={active} />
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          {essayFeedback.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`size-6 rounded-full grid place-items-center font-mono ${
                i === active ? "bg-primary text-primary-foreground" : "bg-secondary"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function FeedbackCard({ idx }: { idx: number }) {
  const f = essayFeedback[idx];
  const tone =
    f.severity === "high" ? "danger" : f.severity === "medium" ? "warn" : "info";
  return (
    <div>
      <div className="flex items-center justify-between">
        <Pill tone={tone}>{f.category}</Pill>
        <span className="text-xs text-muted-foreground uppercase tracking-widest">
          {f.severity} priority
        </span>
      </div>
      <blockquote className="mt-3 border-l-2 border-gold pl-3 italic text-sm text-foreground/80">
        "{f.quote}"
      </blockquote>
      <div className="mt-3 text-sm">{f.note}</div>
      <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3 text-sm">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Suggested rewrite — yours to accept or ignore</div>
        <div className="italic text-foreground/90">"{f.suggestion}"</div>
      </div>
    </div>
  );
}

function buildHighlightedSegments(text: string, feedback: typeof essayFeedback) {
  type Seg = { text: string; fbIndex: number | null };
  const matches: { start: number; end: number; fbIndex: number }[] = [];
  feedback.forEach((f, i) => {
    const idx = text.indexOf(f.quote);
    if (idx !== -1) matches.push({ start: idx, end: idx + f.quote.length, fbIndex: i });
  });
  matches.sort((a, b) => a.start - b.start);
  const segs: Seg[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) segs.push({ text: text.slice(cursor, m.start), fbIndex: null });
    segs.push({ text: text.slice(m.start, m.end), fbIndex: m.fbIndex });
    cursor = m.end;
  }
  if (cursor < text.length) segs.push({ text: text.slice(cursor), fbIndex: null });
  return segs;
}

function StepRevise() {
  const revised = `Growing up in McAllen, Texas, I didn't know what an engineer was until I was fifteen. My parents work at a small restaurant; the closest thing I had to a computer was a shared family phone. Some nights I did homework on the restaurant counter between checking out tables, my AP Calc book stained with red salsa.

In tenth grade, my school got a grant for Chromebooks and I checked one out from the library every single day. I taught myself Python from free YouTube videos while my mom prepped for the next day's lunch service. The first time my script printed the right answer to a problem, I yelled loud enough that my mom came running.

When I got to Rice, I felt very behind — most of my classmates had been coding since middle school. I almost dropped CS after my first COMP 215 midterm. Then I joined SHPE. Ana, a junior, slid her own midterm across the table — a 62 — and said, "You don't quit because of one number."

Now I tutor intro CS students who feel the way I felt. I also run Code-with-Me nights for high schoolers in McAllen ISD. Three of those students applied to college this fall — two to Rice — and one told me she's majoring in CS because of those Tuesday nights.

If I receive this scholarship, I'll use it to attend SHPE National and continue my research on machine learning for early diabetes screening, a disease that affects nearly 1 in 4 adults in my hometown. SHPE was the room that kept me in engineering. I'd like the chance to keep building that room for the students coming up behind me.`;
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Draft v1 — original</div>
        <pre className="mt-3 whitespace-pre-wrap font-display text-sm leading-relaxed text-foreground/60 max-h-[480px] overflow-y-auto">
{essayDraft}
        </pre>
      </Card>
      <Card>
        <div className="text-xs uppercase tracking-widest text-gold">Draft v2 — Maya's revision</div>
        <pre className="mt-3 whitespace-pre-wrap font-display text-sm leading-relaxed text-foreground max-h-[480px] overflow-y-auto">
{revised}
        </pre>
      </Card>
      <Card className="lg:col-span-2 bg-secondary/40">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-gold text-gold-foreground grid place-items-center text-sm">✎</div>
          <div className="text-sm">
            <span className="font-medium">Maya wrote every word of v2.</span>{" "}
            <span className="text-muted-foreground">Scholar-E suggested rewrites — she rephrased them in her own voice.</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepResubmit() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-2xl">Resubmitting draft v2…</div>
            <div className="text-xs text-muted-foreground mt-1">SHPE Foundation Scholarship · 498 / 500 words</div>
          </div>
          <Pill tone="info">2nd evaluation</Pill>
        </div>
      </Card>
      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Score progression</div>
        <div className="mt-5 grid grid-cols-3 gap-4">
          <ScoreDelta label="Specificity" before={54} after={88} />
          <ScoreDelta label="Storytelling" before={68} after={90} />
          <ScoreDelta label="Impact" before={62} after={84} />
        </div>
        <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">Overall</div>
            <div className="font-display text-5xl text-success">87</div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Was <span className="line-through">75</span></div>
            <div className="text-success font-medium">+12 points</div>
          </div>
        </div>
      </Card>
      <Card className="bg-success/10 border-success/30">
        <div className="text-sm font-medium text-success">Coach says: ready to submit.</div>
        <p className="text-sm text-foreground/80 mt-1">
          Your essay clears every SHPE rubric threshold. Continue to the final submission check.
        </p>
      </Card>
    </div>
  );
}

function ScoreDelta({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-muted-foreground line-through font-mono text-sm">{before}</div>
        <div className="font-display text-2xl text-success">{after}</div>
        <div className="text-xs text-success">+{after - before}</div>
      </div>
    </div>
  );
}

function StepFinalCheck() {
  const done = submissionChecklist.filter((x) => x.done).length;
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Submission readiness</div>
            <div className="font-display text-3xl mt-1">{done} / {submissionChecklist.length} complete</div>
          </div>
          <div className="size-16 rounded-2xl bg-warning/20 grid place-items-center font-display text-2xl">!</div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-gold" style={{ width: `${(done / submissionChecklist.length) * 100}%` }} />
        </div>
      </Card>

      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Final checklist</div>
        <ul className="mt-3 divide-y divide-border">
          {submissionChecklist.map((c) => (
            <li key={c.item} className="py-3 flex items-center gap-3">
              <div className={`size-5 rounded-md grid place-items-center text-[11px] ${c.done ? "bg-success text-white" : "border-2 border-warning"}`}>
                {c.done ? "✓" : ""}
              </div>
              <div className={`text-sm flex-1 ${c.done ? "" : "text-foreground font-medium"}`}>{c.item}</div>
              {!c.done && <Pill tone="warn">action needed</Pill>}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="bg-warning/10 border-warning/30">
        <div className="text-sm font-medium">Two blockers before you submit:</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-foreground/80 space-y-1">
          <li>Email Prof. Alvarez a reminder about her recommendation letter.</li>
          <li>Confirm your mailing address in the SHPE applicant portal.</li>
        </ul>
        <button className="mt-4 rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm">
          Email Prof. Alvarez (template ready)
        </button>
      </Card>
    </div>
  );
}

function StepTracker() {
  const columns = ["Interested", "Drafting", "Submitted", "Awarded"] as const;
  const items: Record<(typeof columns)[number], typeof scholarships> = {
    Interested: scholarships.filter((s) => s.state === "Interested"),
    Drafting: scholarships.filter((s) => s.state === "Drafting" || s.state === "Applying"),
    Submitted: [],
    Awarded: [],
  };
  const totalPotential = scholarships
    .filter((s) => s.eligibilityScore > 0)
    .reduce((a) => a + 5000, 0); // rough demo number

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card><div className="text-xs text-muted-foreground uppercase tracking-widest">Active</div><div className="font-display text-3xl mt-1">4</div></Card>
        <Card><div className="text-xs text-muted-foreground uppercase tracking-widest">Potential awards</div><div className="font-display text-3xl mt-1">${totalPotential.toLocaleString()}+</div></Card>
        <Card><div className="text-xs text-muted-foreground uppercase tracking-widest">Next deadline</div><div className="font-display text-3xl mt-1">12d</div><div className="text-xs text-muted-foreground">HSF — Feb 15</div></Card>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col} className="rounded-2xl bg-secondary/40 p-3 min-h-[320px]">
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{col}</div>
              <span className="text-xs font-mono text-muted-foreground">{items[col].length}</span>
            </div>
            <div className="space-y-2">
              {items[col].map((s) => (
                <div key={s.id} className="rounded-xl bg-card border border-border p-3">
                  <div className="text-sm font-medium leading-tight">{s.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.sponsor}</div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <Pill tone="gold">{s.amount}</Pill>
                    <span className="text-muted-foreground">{s.daysLeft ? `${s.daysLeft}d left` : "—"}</span>
                  </div>
                </div>
              ))}
              {items[col].length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6">No items yet.</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Card className="bg-primary text-primary-foreground">
        <div className="font-display text-2xl">That's the full Scholar-E journey.</div>
        <p className="text-primary-foreground/80 mt-2 text-sm">
          From a confused first-gen sophomore landing on the homepage, to a competitive applicant with a draft
          v2 scoring 87/100 — all without anyone writing her essay for her.
        </p>
        <Link to="/" className="mt-4 inline-flex rounded-full bg-gold text-gold-foreground px-5 py-2 text-sm font-medium">
          ← Back to landing
        </Link>
      </Card>
    </div>
  );
}
