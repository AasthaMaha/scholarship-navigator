import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
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
  type EssayDraft,
} from "@/lib/userStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Your Journey · Scholar-E" },
      {
        name: "description",
        content:
          "Walk through Scholar-E as yourself — from discovery to submission, with AI coaching on your own essay.",
      },
    ],
  }),
  component: Journey,
});

function Journey() {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/auth" });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen grid place-items-center p-8 text-center">
        <div>
          <h1 className="font-display text-2xl">Sign in to start your journey</h1>
          <p className="text-sm text-muted-foreground mt-2">Redirecting you to create your account…</p>
          <Link to="/auth" className="mt-4 inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm">
            Go to sign in →
          </Link>
        </div>
      </div>
    );
  }

  const step = journeySteps[stepIdx];
  const goNext = () => setStepIdx((i) => Math.min(i + 1, journeySteps.length - 1));
  const goPrev = () => setStepIdx((i) => Math.max(i - 1, 0));

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen flex">
        <Sidebar activeIdx={stepIdx} onSelect={setStepIdx} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar step={step} onNext={goNext} onPrev={goPrev} stepIdx={stepIdx} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-6 md:px-10 py-10">
              <StepHeader step={step} />
              <div className="mt-8">
                <StepBody slug={step.slug} goNext={goNext} />
              </div>
              <Nav stepIdx={stepIdx} onNext={goNext} onPrev={goPrev} />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
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
        <SidebarUser />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map(([group, steps]) => (
          <div key={group}>
            <div className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{group}</div>
            <div className="space-y-0.5">
              {steps.map((s) => {
                const idx = journeySteps.findIndex((x) => x.id === s.id);
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

function StepBody({ slug, goNext }: { slug: string; goNext: () => void }) {
  switch (slug) {
    case "land": return <StepLand />;
    case "profile": return <StepProfile />;
    case "discovery": return <StepDiscovery />;
    case "opportunities": return <StepOpportunities onAnalyze={goNext} />;
    case "import": return <StepImport />;
    case "requirements": return <StepRequirementsAndFit />;
    case "essay-outline": return <StepEssayOutline />;
    case "essay-upload": return <StepEssayUpload />;
    case "scores": return <StepScores />;
    case "highlights": return <StepHighlights />;
    case "revise": return <StepRevise />;
    case "resubmit": return <StepResubmit />;
    case "final-check": return <StepFinalCheck />;
    case "tracker": return <StepTracker />;
    default: return null;
  }
}

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

/* ---------------- Step 1: Land + Onboarding combined ---------------- */

function StepLand() {
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
          {["Discover", "Analyze", "Coach"].map((t, i) => (
            <div key={t} className="rounded-xl bg-secondary/60 p-4">
              <div className="font-mono text-xs text-gold">0{i + 1}</div>
              <div className="font-display text-lg mt-1">{t}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Quick onboarding — 3 things to know</div>
        <div className="mt-3 grid md:grid-cols-3 gap-4">
          {slides.map((s, i) => (
            <div key={s.t} className="rounded-xl border border-border bg-secondary/40 p-5">
              <div className="font-mono text-xs text-gold">0{i + 1}</div>
              <div className="font-display text-lg mt-2">{s.t}</div>
              <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="size-4 accent-[oklch(0.32_0.09_270)]" />
            <span className="text-sm">I understand Scholar-E is a coach, not a ghostwriter.</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="size-4 accent-[oklch(0.32_0.09_270)]" />
            <span className="text-sm">I'll keep my essays in my own voice and authorship.</span>
          </label>
        </div>
      </Card>
    </div>
  );
}

function SidebarUser() {
  const { user } = useUser();
  const subtitle =
    user?.educationLevel
      ? eduLevelLabel(user.educationLevel)
      : "Complete your profile →";
  return (
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-display">
        {toInitials(user?.name)}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{user?.name || "Your account"}</div>
        <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
      </div>
    </div>
  );
}

function eduLevelLabel(l: EducationLevel) {
  return {
    high_school: "High school student",
    undergrad: "Undergraduate",
    grad: "Graduate student",
    phd: "PhD student",
  }[l];
}

/* -------------------- Glossary tooltip + ext checkbox groups -------------------- */

const GLOSSARY: Record<string, string> = {
  "Pell Grant eligible": "A U.S. federal grant for undergraduates with significant financial need — based on your FAFSA. Doesn't have to be repaid.",
  "FAFSA completed": "Free Application for Federal Student Aid — determines federal aid, work-study, and many state/institutional awards.",
  "First-generation college student": "Typically: neither parent/guardian completed a 4-year college degree.",
  "Low-income background": "Household income below standard federal/state thresholds; often Pell-eligible.",
  "Student with disability": "A documented physical, learning, or mental-health disability eligible for accommodations.",
  "Foster care experience": "You spent time in the U.S. foster-care system (often qualifies for dedicated awards).",
  "Student with dependents": "You have children or other dependents you financially support.",
  "U.S. citizen": "Born in the U.S. or naturalized — broadest eligibility for federal/state aid.",
  "Permanent resident": "Holds a Green Card (Lawful Permanent Resident) — eligible for most federal aid.",
  "International student": "Non-U.S. citizen on a student visa — eligibility narrows to private/institutional awards.",
  "DACA / undocumented student": "Deferred Action for Childhood Arrivals or undocumented — many private and state awards still apply.",
  "Full-time student": "Generally enrolled in 12+ credits/semester (undergrad) or as defined by your school.",
  "Part-time student": "Below the full-time credit threshold.",
  Veteran: "Served in the U.S. armed forces; eligible for GI Bill and veteran-specific awards.",
  "Military dependent": "Spouse or child of an active-duty, retired, or deceased service member.",
};

function GlossaryCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const gloss = GLOSSARY[label];
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[oklch(0.32_0.09_270)]"
      />
      {gloss ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="border-b border-dotted border-muted-foreground/50 cursor-help">{label}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs leading-relaxed">
            {gloss}
          </TooltipContent>
        </Tooltip>
      ) : (
        <span>{label}</span>
      )}
    </label>
  );
}

const EXTENDED_CONTEXT_GROUPS: { group: string; options: string[] }[] = [
  { group: "Financial Need", options: ["Pell Grant eligible", "FAFSA completed", "Low-income background"] },
  { group: "Student Background", options: ["First-generation college student", "Student with disability", "Foster care experience", "Student with dependents"] },
  { group: "Citizenship / Residency Status", options: ["U.S. citizen", "Permanent resident", "International student", "DACA / undocumented student"] },
  { group: "Enrollment Status", options: ["Full-time student", "Part-time student"] },
  { group: "Military Affiliation", options: ["Veteran", "Military dependent"] },
];

/* ---------------- Step 2: Profile (with materials before story prompts) ---------------- */

function StepProfile() {
  const { user, updateProfile } = useUser();
  const level = user?.educationLevel;
  const [showExtended, setShowExtended] = useState(false);

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    updateProfile({ [key]: value } as Partial<UserProfile>);
  }
  function setBranch<T extends "highSchool" | "undergrad" | "graduate">(
    branch: T,
    patch: Record<string, unknown>,
  ) {
    updateProfile({
      [branch]: { ...((user?.[branch] as object | undefined) ?? {}), ...patch },
    } as Partial<UserProfile>);
  }
  function setOptional(patch: Record<string, unknown>) {
    updateProfile({ optional: { ...(user?.optional ?? {}), ...patch } });
  }
  function setPrompts(patch: Record<string, unknown>) {
    updateProfile({ prompts: { ...(user?.prompts ?? {}), ...patch } });
  }
  function setExt(key: string, v: boolean) {
    updateProfile({ extendedContext: { ...(user?.extendedContext ?? {}), [key]: v } });
  }

  // documents
  const docs = user?.documents ?? [];
  function addDoc(kind: string, file: File) {
    updateProfile({ documents: [...docs, { name: file.name, kind }] });
  }
  function removeDoc(name: string) {
    updateProfile({ documents: docs.filter((d) => d.name !== name) });
  }

  const raceOptions = [
    "American Indian or Alaska Native (Not Hispanic or Latino) (United States of America)",
    "Asian (Not Hispanic or Latino) (United States of America)",
    "Black or African American (Not Hispanic or Latino) (United States of America)",
    "Native Hawaiian or Other Pacific Islander (Not Hispanic or Latino) (United States of America)",
    "Not Specified (United States of America)",
    "Two or More Races (Not Hispanic or Latino) (United States of America)",
    "White (Not Hispanic or Latino) (United States of America)",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-display text-xl">
            {toInitials(user?.name)}
          </div>
          <div>
            <div className="font-display text-xl">{user?.name}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionLabel>About you</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <Input label="Pronouns" value={user?.pronouns ?? ""} onChange={(v) => set("pronouns", v)} placeholder="she/her, he/him, they/them…" />
          <Input label="Location" value={user?.location ?? ""} onChange={(v) => set("location", v)} placeholder="City, State" />
          <Input label="Nationality" value={user?.nationality ?? ""} onChange={(v) => set("nationality", v)} placeholder="e.g. American, Mexican, Nigerian…" />
          <Select
            label="Are you of Hispanic or Latino descent?"
            value={user?.hispanicLatino ?? ""}
            onChange={(v) => set("hispanicLatino", v)}
            options={["Yes", "No"]}
          />
          <Select
            label="Please select your Race / Ethnicity"
            value={user?.raceEthnicity ?? ""}
            onChange={(v) => set("raceEthnicity", v)}
            options={raceOptions}
            className="sm:col-span-2"
          />
          <Input
            label="Career goal (1-2 sentences)"
            value={user?.careerGoal ?? ""}
            onChange={(v) => set("careerGoal", v)}
            placeholder="What do you want to do after school?"
            className="sm:col-span-2"
          />
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <GlossaryCheck label="First-generation college student" checked={!!user?.firstGen} onChange={(v) => set("firstGen", v)} />
          <GlossaryCheck label="Pell Grant eligible" checked={!!user?.pellEligible} onChange={(v) => set("pellEligible", v)} />
        </div>

        <button
          onClick={() => setShowExtended((s) => !s)}
          className="mt-5 text-xs underline text-muted-foreground hover:text-foreground"
        >
          {showExtended ? "− Hide" : "+ Add more personalized context"}
        </button>

        {showExtended && (
          <div className="mt-4 space-y-5">
            {EXTENDED_CONTEXT_GROUPS.map((grp) => (
              <div key={grp.group}>
                <div className="text-[11px] uppercase tracking-widest text-gold">{grp.group}</div>
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  {grp.options.map((opt) => (
                    <GlossaryCheck
                      key={opt}
                      label={opt}
                      checked={!!user?.extendedContext?.[opt]}
                      onChange={(v) => setExt(opt, v)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel>Education level</SectionLabel>
        <p className="text-xs text-muted-foreground mt-1">
          We use this to ask only the questions that apply to you.
        </p>
        <select
          value={level ?? ""}
          onChange={(e) => set("educationLevel", (e.target.value || undefined) as EducationLevel | undefined)}
          className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
        >
          <option value="">Select your education level…</option>
          <option value="high_school">High school</option>
          <option value="undergrad">Undergraduate</option>
          <option value="grad">Graduate student</option>
          <option value="phd">PhD student</option>
        </select>
      </Card>

      {level === "high_school" && <HighSchoolForm setBranch={setBranch} value={user?.highSchool ?? {}} />}
      {level === "undergrad" && <UndergradForm setBranch={setBranch} value={user?.undergrad ?? {}} />}
      {(level === "grad" || level === "phd") && <GradForm setBranch={setBranch} value={user?.graduate ?? {}} level={level} />}

      <Card>
        <SectionLabel>Optional context</SectionLabel>
        <p className="text-xs text-muted-foreground mt-1">
          All optional — add whatever helps scholarships see who you are.
        </p>
        <div className="mt-4 space-y-3">
          <FileField
            label="Resume (optional)"
            fileName={user?.optional?.resumeFileName}
            onFile={(name) => setOptional({ resumeFileName: name })}
          />
          <Textarea label="Society / club involvement" value={user?.optional?.societyInvolvement ?? ""} onChange={(v) => setOptional({ societyInvolvement: v })} placeholder="Clubs, organizations, leadership roles…" />
          <Textarea label="Sports" value={user?.optional?.sports ?? ""} onChange={(v) => setOptional({ sports: v })} placeholder="Teams, varsity/club, captaincy…" />
          <Textarea label="Articles published" value={user?.optional?.articlesPublished ?? ""} onChange={(v) => setOptional({ articlesPublished: v })} placeholder="Titles, outlets, links…" />
          <Textarea label="Projects" value={user?.optional?.projects ?? ""} onChange={(v) => setOptional({ projects: v })} placeholder="Personal, school, or research projects…" />
        </div>
      </Card>

      {/* Materials/document vault moved here, before Story Prompts */}
      <Card>
        <SectionLabel>Upload materials</SectionLabel>
        <p className="text-xs text-muted-foreground mt-1">
          Build your document vault so each application can reuse them.
        </p>
        {docs.length > 0 && (
          <div className="mt-4 divide-y divide-border">
            {docs.map((d) => (
              <div key={d.name} className="py-3 flex items-center gap-4">
                <div className="size-10 rounded-lg bg-success/15 text-success grid place-items-center text-xs font-mono">✓</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.kind}</div>
                </div>
                <button
                  onClick={() => removeDoc(d.name)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          {["Resume", "Transcript", "Recommendation letter", "Other"].map((k) => (
            <label key={k} className="rounded-xl border-2 border-dashed border-border p-4 text-sm cursor-pointer hover:bg-accent">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Upload</div>
              <div className="font-medium mt-1">{k}</div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) addDoc(k, f);
                }}
                className="mt-2 text-xs"
              />
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>Story prompts (optional)</SectionLabel>
        <p className="text-xs text-muted-foreground mt-1">
          Short reflections you can reuse across scholarship essays.
        </p>
        <div className="mt-4 space-y-3">
          <Textarea label="Name a time you overcame a challenge." value={user?.prompts?.challenge ?? ""} onChange={(v) => setPrompts({ challenge: v })} />
          <Textarea label="Leadership — describe a time you had to lead." value={user?.prompts?.leadership ?? ""} onChange={(v) => setPrompts({ leadership: v })} />
          <Textarea label="Name a time you worked with a team." value={user?.prompts?.teamwork ?? ""} onChange={(v) => setPrompts({ teamwork: v })} />
        </div>
      </Card>
    </div>
  );
}

/* form atoms */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs uppercase tracking-widest text-muted-foreground">{children}</div>;
}
function Input({
  label, value, onChange, placeholder, className = "", type = "text",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string; type?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}
function Textarea({
  label, value, onChange, placeholder, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed"
      />
    </label>
  );
}
function Select({
  label, value, onChange, options, className = "",
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
function FileField({ label, fileName, onFile }: { label: string; fileName?: string; onFile: (name: string) => void }) {
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-3 rounded-lg border-2 border-dashed border-border p-4">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f.name);
          }}
          className="text-sm"
        />
        {fileName && <span className="text-xs text-success">✓ {fileName}</span>}
      </div>
    </div>
  );
}
function CheckGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  function toggle(o: string) {
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  }
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
                on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-accent"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HighSchoolForm({ value, setBranch }: { value: Record<string, unknown>; setBranch: (b: "highSchool", p: Record<string, unknown>) => void }) {
  const v = value as Record<string, string | string[] | undefined>;
  const needsOptions = ["Finding scholarships", "Essay review", "College list", "FAFSA", "Recommendation strategy", "Deadlines"];
  return (
    <Card>
      <SectionLabel>High school details</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <Select label="Current grade" value={(v.currentGrade as string) ?? ""} onChange={(x) => setBranch("highSchool", { currentGrade: x })} options={["9th", "10th", "11th", "12th"]} />
        <Select label="Graduation month" value={(v.gradMonth as string) ?? ""} onChange={(x) => setBranch("highSchool", { gradMonth: x })} options={["January","February","March","April","May","June","July","August","September","October","November","December"]} />
        <Input label="Graduation year" value={(v.gradYear as string) ?? ""} onChange={(x) => setBranch("highSchool", { gradYear: x })} placeholder="2027" />
        <Input label="High school GPA" value={(v.gpa as string) ?? ""} onChange={(x) => setBranch("highSchool", { gpa: x })} placeholder="3.85" />
        <Select label="GPA weighting" value={(v.gpaWeighting as string) ?? ""} onChange={(x) => setBranch("highSchool", { gpaWeighting: x })} options={["Weighted", "Unweighted"]} />
        <Select label="SAT / ACT status" value={(v.testStatus as string) ?? ""} onChange={(x) => setBranch("highSchool", { testStatus: x })} options={["Taken", "Planning to take", "Test-optional"]} />
        <Input label="Intended college start year (optional)" value={(v.intendedStartYear as string) ?? ""} onChange={(x) => setBranch("highSchool", { intendedStartYear: x })} placeholder="2027" />
        <Input label="Intended college major (optional)" value={(v.intendedMajor as string) ?? ""} onChange={(x) => setBranch("highSchool", { intendedMajor: x })} placeholder="Biology, CS, Undecided…" />
      </div>
      <div className="mt-3 space-y-3">
        <Textarea label="AP / IB / dual-credit courses" value={(v.apIb as string) ?? ""} onChange={(x) => setBranch("highSchool", { apIb: x })} />
        <Select label="Parent / guardian education level" value={(v.parentEducation as string) ?? ""} onChange={(x) => setBranch("highSchool", { parentEducation: x })} options={["Did not finish high school", "High school", "Some college", "Associate's", "Bachelor's", "Graduate degree"]} />
        <Textarea label="Extracurriculars" value={(v.extracurricular as string) ?? ""} onChange={(x) => setBranch("highSchool", { extracurricular: x })} />
        <Textarea label="Activities, work, family duties, athletics" value={(v.activities as string) ?? ""} onChange={(x) => setBranch("highSchool", { activities: x })} />
        <Textarea label="Volunteer service" value={(v.volunteer as string) ?? ""} onChange={(x) => setBranch("highSchool", { volunteer: x })} />
        <CheckGroup
          label="I need help with"
          options={needsOptions}
          value={(v.needsHelpWith as string[]) ?? []}
          onChange={(x) => setBranch("highSchool", { needsHelpWith: x })}
        />
      </div>
    </Card>
  );
}

function UndergradForm({ value, setBranch }: { value: Record<string, unknown>; setBranch: (b: "undergrad", p: Record<string, unknown>) => void }) {
  const v = value as Record<string, string | string[] | undefined>;
  const needsOptions = ["Departmental scholarships", "Transfer scholarships", "Merit aid", "Need-based aid", "Emergency grants", "Internship funding", "Study abroad funding"];
  return (
    <Card>
      <SectionLabel>Undergraduate details</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <Input label="Institution name" value={(v.institution as string) ?? ""} onChange={(x) => setBranch("undergrad", { institution: x })} placeholder="e.g. Rice University" />
        <Select label="College type" value={(v.collegeType as string) ?? ""} onChange={(x) => setBranch("undergrad", { collegeType: x })} options={["2-year", "4-year", "Transfer student"]} />
        <Select label="Current year" value={(v.currentYear as string) ?? ""} onChange={(x) => setBranch("undergrad", { currentYear: x })} options={["Freshman", "Sophomore", "Junior", "Senior", "Super senior"]} />
        <Select label="Enrollment status" value={(v.enrollment as string) ?? ""} onChange={(x) => setBranch("undergrad", { enrollment: x })} options={["Full-time", "Part-time"]} />
        <Input label="Major" value={(v.major as string) ?? ""} onChange={(x) => setBranch("undergrad", { major: x })} />
        <Input label="Minor" value={(v.minor as string) ?? ""} onChange={(x) => setBranch("undergrad", { minor: x })} />
        <Input label="College GPA" value={(v.gpa as string) ?? ""} onChange={(x) => setBranch("undergrad", { gpa: x })} placeholder="3.85" />
        <Input label="Credits completed" value={(v.creditsCompleted as string) ?? ""} onChange={(x) => setBranch("undergrad", { creditsCompleted: x })} placeholder="48" />
      </div>
      <div className="mt-3 space-y-3">
        <Textarea label="Transfer history (if any)" value={(v.transferHistory as string) ?? ""} onChange={(x) => setBranch("undergrad", { transferHistory: x })} />
        <Textarea label="Internships / research / lab experience" value={(v.experience as string) ?? ""} onChange={(x) => setBranch("undergrad", { experience: x })} />
        <Textarea label="Student organizations & leadership" value={(v.orgsLeadership as string) ?? ""} onChange={(x) => setBranch("undergrad", { orgsLeadership: x })} />
        <Textarea label="Scholarship history" value={(v.scholarshipHistory as string) ?? ""} onChange={(x) => setBranch("undergrad", { scholarshipHistory: x })} />
        <CheckGroup
          label="I need help with"
          options={needsOptions}
          value={(v.needsHelpWith as string[]) ?? []}
          onChange={(x) => setBranch("undergrad", { needsHelpWith: x })}
        />
      </div>
    </Card>
  );
}

function GradForm({ value, setBranch, level }: { value: Record<string, unknown>; setBranch: (b: "graduate", p: Record<string, unknown>) => void; level: EducationLevel }) {
  const v = value as Record<string, string | string[] | undefined>;
  const needsOptions = ["Fellowships", "Assistantships", "Conference grants", "Dissertation funding", "Research grants", "Professional association awards"];
  return (
    <Card>
      <SectionLabel>{level === "phd" ? "PhD" : "Graduate"} details</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <Select label="Graduate level" value={(v.graduateLevel as string) ?? (level === "phd" ? "PhD" : "")} onChange={(x) => setBranch("graduate", { graduateLevel: x })} options={["Master's", "PhD", "MBA", "JD", "MD", "Other"]} />
        <Input label="Program name" value={(v.program as string) ?? ""} onChange={(x) => setBranch("graduate", { program: x })} />
        <Input label="Institution" value={(v.institution as string) ?? ""} onChange={(x) => setBranch("graduate", { institution: x })} />
        <Input label="Department" value={(v.department as string) ?? ""} onChange={(x) => setBranch("graduate", { department: x })} />
        <Input label="Research area / concentration" value={(v.researchArea as string) ?? ""} onChange={(x) => setBranch("graduate", { researchArea: x })} className="sm:col-span-2" />
        <Select label="Assistantship / fellowship status" value={(v.assistantshipStatus as string) ?? ""} onChange={(x) => setBranch("graduate", { assistantshipStatus: x })} options={["TA", "RA", "Fellowship", "Self-funded", "Other"]} />
        <Input label="Professional licenses / exams (if relevant)" value={(v.licenses as string) ?? ""} onChange={(x) => setBranch("graduate", { licenses: x })} />
      </div>
      <div className="mt-3 space-y-3">
        <Textarea label="Research output (publications, presentations, posters, thesis/dissertation stage)" value={(v.researchOutput as string) ?? ""} onChange={(x) => setBranch("graduate", { researchOutput: x })} />
        <Textarea label="Conference travel or research expense needs" value={(v.travelNeeds as string) ?? ""} onChange={(x) => setBranch("graduate", { travelNeeds: x })} />
        <CheckGroup
          label="I need help with"
          options={needsOptions}
          value={(v.needsHelpWith as string[]) ?? []}
          onChange={(x) => setBranch("graduate", { needsHelpWith: x })}
        />
      </div>
    </Card>
  );
}

/* ---------------- Step 3: Discovery (shortened) ---------------- */

function StepDiscovery() {
  const { user } = useUser();
  const ug = user?.undergrad;
  const hs = user?.highSchool;
  const gr = user?.graduate;
  const major = ug?.major ?? hs?.intendedMajor ?? gr?.researchArea;
  const qs: { q: string; a: string }[] = [];
  if (user?.educationLevel) qs.push({ q: "Education level", a: eduLevelLabel(user.educationLevel) });
  if (major) qs.push({ q: "Major / focus", a: major });
  if (user?.location) qs.push({ q: "Location", a: user.location });
  if (user?.nationality) qs.push({ q: "Nationality", a: user.nationality });
  if (user?.raceEthnicity) qs.push({ q: "Race / ethnicity", a: user.raceEthnicity });
  if (user?.hispanicLatino) qs.push({ q: "Hispanic / Latino?", a: user.hispanicLatino });
  if (user?.firstGen) qs.push({ q: "First-generation?", a: "Yes" });
  if (user?.pellEligible) qs.push({ q: "Financial need?", a: "Pell-eligible" });
  if (user?.careerGoal) qs.push({ q: "Career interests", a: user.careerGoal });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="self-start">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Your answers</div>
        {qs.length === 0 ? (
          <div className="mt-3 text-sm text-muted-foreground">No profile data yet — fill out your profile first.</div>
        ) : (
          <div className="mt-3">
            {qs.map((q) => <FieldRow key={q.q} label={q.q} value={q.a} />)}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Personalized resources
          </div>
          <Pill tone="info">Rule-based engine</Pill>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Curated based on your profile. We don't scrape — we point you to the right places.
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

/* ---------------- Step 4: Opportunities (sort + nav) ---------------- */

function parseAmount(amount: string): number {
  // grabs the largest dollar number in the string
  const nums = amount.replace(/,/g, "").match(/\d+/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
}

function StepOpportunities({ onAnalyze }: { onAnalyze: () => void }) {
  const [sort, setSort] = useState<"match" | "amount-desc" | "amount-asc">("match");
  const sorted = useMemo(() => {
    const arr = [...scholarships];
    if (sort === "amount-desc") arr.sort((a, b) => parseAmount(b.amount) - parseAmount(a.amount));
    else if (sort === "amount-asc") arr.sort((a, b) => parseAmount(a.amount) - parseAmount(b.amount));
    else arr.sort((a, b) => b.matchScore - a.matchScore);
    return arr;
  }, [sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            Based on your profile keywords:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="gold">Match ≥ 80%</Pill>
            <Pill>STEM</Pill>
            <Pill>First-gen</Pill>
            <Pill>Texas</Pill>
            <Pill>Deadline ≤ 60 days</Pill>
          </div>
        </div>
        <label className="text-xs flex items-center gap-2 text-muted-foreground">
          Sort by:
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
          >
            <option value="match">Best match</option>
            <option value="amount-desc">Award amount (high → low)</option>
            <option value="amount-asc">Award amount (low → high)</option>
          </select>
        </label>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {sorted.map((s) => (
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
                onClick={() => s.eligibilityScore !== 0 && onAnalyze()}
                disabled={s.eligibilityScore === 0}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  s.eligibilityScore === 0
                    ? "bg-destructive/15 text-destructive cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:opacity-90"
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

/* ---------------- Step 5: Import ---------------- */

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

/* ---------------- Step 6: Requirements + Fit combined ---------------- */

function StepRequirementsAndFit() {
  const reqs = [
    { c: "Eligibility", items: ["Hispanic / Latinx heritage", "U.S. citizen or DACA", "Enrolled full-time", "STEM major", "Minimum 3.0 GPA"] },
    { c: "Required materials", items: ["Resume (PDF, ≤ 2 pages)", "Unofficial transcript", "Two recommendation letters", "FAFSA Student Aid Index"] },
    { c: "Essays", items: ["Personal essay — 500 words", "Short answer — community impact, 250 words"] },
    { c: "Deadlines", items: ["Application: Apr 30, 2026", "Recommender deadline: May 7, 2026"] },
  ];
  const dims = [
    { name: "Eligibility", score: 100, note: "You meet every required criterion." },
    { name: "Academic strength", score: 92, note: "Your GPA is well above the minimum." },
    { name: "Leadership evidence", score: 88, note: "Strong record; quantify hours where possible." },
    { name: "Community impact", score: 90, note: "Your community work is a standout." },
    { name: "Narrative alignment", score: 80, note: "Tie your goals more explicitly to the sponsor's mission." },
  ];
  const overall = Math.round(dims.reduce((a, d) => a + d.score, 0) / dims.length);

  return (
    <div className="space-y-6">
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
      </div>

      <Card className="bg-secondary/40">
        <div className="text-sm font-medium">Essay prompt</div>
        <p className="mt-2 text-foreground/90 font-display italic text-lg">"{essayPrompt}"</p>
      </Card>

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
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Step 7: Personalized Outline ---------------- */

function StepEssayOutline() {
  const { user } = useUser();
  const focus =
    user?.undergrad?.major ?? user?.highSchool?.intendedMajor ?? user?.graduate?.researchArea ?? "your field";
  const leadership = user?.prompts?.leadership || user?.optional?.societyInvolvement || "a leadership moment from your profile";
  const challenge = user?.prompts?.challenge || "a specific challenge you've overcome";

  const outline = [
    {
      h: "Hook (60–80 words)",
      d: `Open with a vivid scene from ${challenge}. Use one sensory detail (sound, smell, image) — avoid generalities.`,
    },
    {
      h: "Bridge to identity (80–100 words)",
      d: `Connect that moment to who you are and why ${focus} matters to you. One concrete fact from your profile beats three abstract claims.`,
    },
    {
      h: "Leadership / impact (120–150 words)",
      d: `Anchor on ${leadership}. Quantify: how many people, hours, dollars, or outcomes? Name one person whose story changed because of you.`,
    },
    {
      h: "Sponsor alignment (80–100 words)",
      d: `Tie your goals to the sponsor's mission. Name a specific program, value, or initiative — show you read their site.`,
    },
    {
      h: "Closer (40–60 words)",
      d: `End on a forward-looking sentence — what you'll build, contribute, or pay forward. Avoid "Thank you for your consideration."`,
    },
  ];
  return (
    <div className="space-y-6">
      <Card className="bg-secondary/40">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Essay prompt</div>
        <p className="mt-2 font-display italic text-lg">"{essayPrompt}"</p>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-gold text-gold-foreground grid place-items-center">✎</div>
          <div>
            <div className="font-medium">Personalized outline based on your profile</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use this as a scaffold — every sentence is still yours to write.
            </p>
          </div>
        </div>
        <ol className="mt-5 space-y-4">
          {outline.map((o, i) => (
            <li key={o.h} className="rounded-xl border border-border p-4">
              <div className="flex items-baseline justify-between">
                <div className="font-display text-lg">{i + 1}. {o.h}</div>
              </div>
              <p className="text-sm text-muted-foreground mt-1.5">{o.d}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="bg-primary/5 border-primary/30">
        <div className="text-sm">
          <span className="font-medium">Ready?</span>{" "}
          <span className="text-muted-foreground">Continue to the next step to upload or paste your draft.</span>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Step 8: Essay Upload (paste OR PDF) ---------------- */

function StepEssayUpload() {
  const { user, updateProfile } = useUser();
  const draft = user?.essayDraft ?? "";
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);

  async function handlePdf(file: File) {
    setPdfStatus(`Extracting text from ${file.name}…`);
    try {
      const w = window as unknown as {
        pdfjsLib?: {
          GlobalWorkerOptions?: { workerSrc?: string };
          getDocument: (opts: { data: ArrayBuffer }) => { promise: Promise<PdfDoc> };
        };
      };
      type PdfDoc = {
        numPages: number;
        getPage: (n: number) => Promise<{
          getTextContent: () => Promise<{ items: { str?: string }[] }>;
        }>;
      };

      if (!w.pdfjsLib) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs";
          s.type = "module";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Failed to load PDF parser"));
          document.head.appendChild(s);
        });
      }
      if (!w.pdfjsLib) throw new Error("PDF parser unavailable");
      if (w.pdfjsLib.GlobalWorkerOptions) {
        w.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";
      }

      const buf = await file.arrayBuffer();
      const pdf: PdfDoc = await w.pdfjsLib.getDocument({ data: buf }).promise;
      let full = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const tc = await page.getTextContent();
        full += tc.items.map((i) => i.str ?? "").join(" ") + "\n\n";
      }
      updateProfile({ essayDraft: full.trim() });
      setPdfStatus(`Imported ${pdf.numPages} pages from ${file.name}.`);
    } catch (e) {
      setPdfStatus(`Could not parse PDF: ${(e as Error).message}`);
    }
  }


  function saveAsDraft() {
    const prev = user?.drafts ?? [];
    const nextVersion = (prev[prev.length - 1]?.version ?? 0) + 1;
    const score = mockScoreForDraft(draft);
    const newDraft: EssayDraft = {
      id: crypto.randomUUID(),
      version: nextVersion,
      content: draft,
      wordCount,
      score,
      savedAt: new Date().toISOString(),
    };
    updateProfile({ drafts: [...prev, newDraft] });
  }

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/40">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Essay prompt</div>
        <p className="mt-2 font-display italic text-lg">"{essayPrompt}"</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Paste your draft below — or upload a PDF and we'll pull the text out for you.
        </p>
      </Card>

      <Card>
        <SectionLabel>Upload a PDF (optional)</SectionLabel>
        <div className="mt-2 flex items-center gap-3 rounded-lg border-2 border-dashed border-border p-4">
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePdf(f);
            }}
            className="text-sm"
          />
          {pdfStatus && <span className="text-xs text-muted-foreground">{pdfStatus}</span>}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">your-essay-draft.txt</span>
          <span>{wordCount} words · Draft v{(user?.drafts?.length ?? 0) + 1}</span>
        </div>
        <textarea
          value={draft}
          onChange={(e) => updateProfile({ essayDraft: e.target.value })}
          rows={16}
          placeholder="Paste or write your essay here…"
          className="mt-3 w-full rounded-lg border border-border bg-background p-4 font-display text-[15px] leading-relaxed"
        />
      </Card>

      <Card>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={saveAsDraft}
            disabled={wordCount < 30}
            className="rounded-full bg-card border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-40"
          >
            Save as new draft
          </button>
          <button
            disabled={wordCount < 30}
            className="flex-1 rounded-full bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 disabled:opacity-40"
          >
            {wordCount < 30 ? "Write at least a paragraph to send to the coach" : "Send to AI Coach for evaluation →"}
          </button>
        </div>
      </Card>
    </div>
  );
}

function mockScoreForDraft(text: string): number {
  // crude deterministic mock — longer + more varied draft = higher score
  const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
  const variety = new Set(text.toLowerCase().match(/\w+/g) ?? []).size;
  const base = Math.min(95, 40 + Math.round(wc / 12) + Math.round(variety / 8));
  return Math.max(45, Math.min(95, base));
}

/* ---------------- Step 9: Application Evaluation (combined eval + scores) ---------------- */

const SCORE_DESCRIPTIONS: Record<string, string> = {
  Clarity: "How easily a reader can follow your argument and identify each sentence's purpose.",
  Specificity: "Concrete sensory details, names, numbers, and moments instead of vague generalities.",
  Leadership: "Evidence you initiated something, organized people, or carried responsibility — not just participated.",
  Storytelling: "Pacing, scene-building, and emotional arc — does the essay carry the reader through a change?",
  Impact: "Quantified outcomes (people helped, dollars raised, lives changed) and what the reader can verify.",
  "Scholarship alignment": "How clearly your goals and identity match the sponsor's stated mission and values.",
  Grammar: "Sentence-level correctness, punctuation, and consistent verb tense.",
  Structure: "Paragraph order, transitions, and a strong opener / closer.",
};

function StepScores() {
  const cats: { name: keyof typeof SCORE_DESCRIPTIONS; score: number }[] = [
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
  const [open, setOpen] = useState<string | null>(null);
  const stages = [
    "Reading prompt and rubric",
    "Cross-referencing your profile",
    "Scoring clarity, specificity, leadership, storytelling, impact",
    "Checking alignment with sponsor values",
    "Generating actionable highlights",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gold text-gold-foreground grid place-items-center font-display">AI</div>
          <div>
            <div className="font-medium">Scholar-E Coach evaluated your essay</div>
            <div className="text-xs text-muted-foreground">All five evaluation stages complete.</div>
          </div>
        </div>
        <div className="mt-4 grid sm:grid-cols-5 gap-2 text-xs">
          {stages.map((s) => (
            <div key={s} className="rounded-lg bg-success/10 text-success p-2 flex items-center gap-1.5">
              <span className="font-mono">✓</span>
              <span className="truncate">{s}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="grid md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-1 text-center">
          <div className="font-display text-7xl text-primary">{overall}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Overall essay score</div>
          <Pill tone="warn">Promising — needs revision</Pill>
        </div>
        <div className="md:col-span-2 grid sm:grid-cols-2 gap-3">
          {cats.map((c) => {
            const isOpen = open === c.name;
            return (
              <button
                key={c.name}
                onClick={() => setOpen(isOpen ? null : c.name)}
                className="text-left rounded-xl border border-border hover:bg-accent transition-colors p-3"
              >
                <div className="flex items-baseline justify-between text-sm">
                  <span className="border-b border-dotted border-muted-foreground/50">{c.name}</span>
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
                {isOpen && (
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {SCORE_DESCRIPTIONS[c.name]}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Top three things to fix</div>
        <ol className="mt-3 space-y-3 text-sm">
          <li className="flex gap-3"><span className="font-display text-gold">1.</span> Replace 4 vague phrases with concrete sensory details.</li>
          <li className="flex gap-3"><span className="font-display text-gold">2.</span> Quantify the impact of your community work.</li>
          <li className="flex gap-3"><span className="font-display text-gold">3.</span> Strengthen your closing line to reinforce contribution to the sponsor.</li>
        </ol>
      </Card>
    </div>
  );
}

/* ---------------- Step 10: Highlights (accept/decline) ---------------- */

function StepHighlights() {
  const segments = useMemo(() => buildHighlightedSegments(essayDraft, essayFeedback), []);
  const [active, setActive] = useState<number>(0);
  const [decisions, setDecisions] = useState<Record<number, "accepted" | "declined">>({});

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
                    : decisions[seg.fbIndex!] === "accepted"
                    ? "bg-success/30 decoration-success"
                    : decisions[seg.fbIndex!] === "declined"
                    ? "bg-muted decoration-muted-foreground line-through"
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
        <FeedbackCard
          idx={active}
          decision={decisions[active]}
          onAccept={() => setDecisions((d) => ({ ...d, [active]: "accepted" }))}
          onDecline={() => setDecisions((d) => ({ ...d, [active]: "declined" }))}
        />
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

function FeedbackCard({
  idx,
  decision,
  onAccept,
  onDecline,
}: {
  idx: number;
  decision?: "accepted" | "declined";
  onAccept: () => void;
  onDecline: () => void;
}) {
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
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Suggested rewrite
        </div>
        <div className="italic text-foreground/90">"{f.suggestion}"</div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={onAccept}
            className={`rounded-full px-3 py-1.5 text-xs ${
              decision === "accepted"
                ? "bg-success text-white"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {decision === "accepted" ? "✓ Accepted" : "Accept"}
          </button>
          <button
            onClick={onDecline}
            className={`rounded-full px-3 py-1.5 text-xs border ${
              decision === "declined"
                ? "bg-destructive/15 text-destructive border-destructive/30"
                : "border-border hover:bg-accent"
            }`}
          >
            {decision === "declined" ? "Declined" : "Decline"}
          </button>
        </div>
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

/* ---------------- Step 11: Revise — multiple drafts ---------------- */

function StepRevise() {
  const { user, updateProfile } = useUser();
  const drafts = user?.drafts ?? [];
  const current = user?.essayDraft ?? "";
  const [openId, setOpenId] = useState<string | null>(null);
  const opened = drafts.find((d) => d.id === openId);

  function addDraft() {
    if (!current.trim()) return;
    const nextVersion = (drafts[drafts.length - 1]?.version ?? 0) + 1;
    const score = mockScoreForDraft(current);
    const wc = current.trim() ? current.trim().split(/\s+/).length : 0;
    const next: EssayDraft = {
      id: crypto.randomUUID(),
      version: nextVersion,
      content: current,
      wordCount: wc,
      score,
      savedAt: new Date().toISOString(),
    };
    updateProfile({ drafts: [...drafts, next] });
  }

  function deleteDraft(id: string) {
    updateProfile({ drafts: drafts.filter((d) => d.id !== id) });
    if (openId === id) setOpenId(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <SectionLabel>Your drafts</SectionLabel>
            <p className="text-xs text-muted-foreground mt-1">
              {drafts.length} saved · click any version to read it and see its score.
            </p>
          </div>
          <button
            onClick={addDraft}
            disabled={!current.trim()}
            className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90 disabled:opacity-40"
          >
            + Save current as new draft
          </button>
        </div>

        {drafts.length === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">
            No drafts saved yet — write something in Step 8 and save it as a draft.
          </div>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {drafts.map((d) => {
              const isOpen = openId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setOpenId(isOpen ? null : d.id)}
                  className={`text-left rounded-xl border p-4 transition-colors ${
                    isOpen ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display text-lg">Draft v{d.version}</div>
                    <Pill tone={d.score && d.score >= 80 ? "success" : "warn"}>
                      Score {d.score ?? "—"}
                    </Pill>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {d.wordCount} words · saved {new Date(d.savedAt).toLocaleString()}
                  </div>
                  <p className="text-xs text-foreground/70 mt-2 line-clamp-2">{d.content.slice(0, 160)}…</p>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <SectionLabel>
            {opened ? `Draft v${opened.version}` : "Current working draft"}
          </SectionLabel>
          {opened && (
            <button
              onClick={() => deleteDraft(opened.id)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Delete draft
            </button>
          )}
        </div>
        <pre className="mt-3 whitespace-pre-wrap font-display text-sm leading-relaxed text-foreground max-h-[480px] overflow-y-auto">
{opened ? opened.content : current || "(Your current draft is empty.)"}
        </pre>
        {opened && (
          <div className="mt-3 text-xs text-muted-foreground">
            Score: <span className="font-mono">{opened.score}</span> · {opened.wordCount} words
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Step 12: Resubmit — with improvement tips ---------------- */

function StepResubmit() {
  const tips = [
    "Replace any remaining vague phrases (e.g. 'I really liked it') with one concrete sensory detail.",
    "Quantify outcomes — number of people helped, dollars raised, hours invested.",
    "Name at least one specific person, place, or program from the sponsor's mission.",
    "Tighten the closing line so it commits to what you'll contribute, not just thank-you.",
    "Read your essay aloud once — cut any sentence that doesn't earn its space.",
  ];
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-2xl">Resubmitting your latest draft…</div>
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

      <Card>
        <div className="text-xs uppercase tracking-widest text-gold">Ways to improve your score further</div>
        <ul className="mt-3 space-y-3 text-sm">
          {tips.map((t, i) => (
            <li key={t} className="flex gap-3">
              <span className="font-display text-gold shrink-0">{i + 1}.</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="bg-success/10 border-success/30">
        <div className="text-sm font-medium text-success">Coach says: ready to submit.</div>
        <p className="text-sm text-foreground/80 mt-1">
          Your essay clears every rubric threshold. Continue to the final submission check.
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

/* ---------------- Step 13: Final Check ---------------- */

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
          <li>Email your second recommender a reminder about their letter.</li>
          <li>Confirm your mailing address in the sponsor's applicant portal.</li>
        </ul>
        <button className="mt-4 rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm">
          Email recommender (template ready)
        </button>
      </Card>
    </div>
  );
}

/* ---------------- Step 14: Tracker ---------------- */

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
    .reduce((a) => a + 5000, 0);

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
          From landing on the homepage to a polished, sponsor-aligned submission — all without anyone writing your essay for you.
        </p>
        <Link to="/" className="mt-4 inline-flex rounded-full bg-gold text-gold-foreground px-5 py-2 text-sm font-medium">
          ← Back to landing
        </Link>
      </Card>
    </div>
  );
}
