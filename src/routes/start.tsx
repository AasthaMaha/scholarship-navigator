import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { defaultProfile, useProfile, type UserProfile } from "@/lib/profile-store";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Start with your profile · Scholar-E" },
      {
        name: "description",
        content:
          "Enter your GPA, experiences, and goals — Scholar-E will personalize the entire journey to your real profile.",
      },
    ],
  }),
  component: StartPage,
});

const IDENTITY_OPTIONS = [
  "First-generation college student",
  "Hispanic / Latino/a/x",
  "Black / African American",
  "Asian / Pacific Islander",
  "Indigenous / Native American",
  "Middle Eastern / North African",
  "Woman in STEM",
  "LGBTQ+",
  "Veteran / Military family",
  "Student with a disability",
  "DACA / undocumented",
];

const LEVELS = [
  "High school — Junior",
  "High school — Senior",
  "Undergraduate — Freshman",
  "Undergraduate — Sophomore",
  "Undergraduate — Junior",
  "Undergraduate — Senior",
  "Graduate — Master's",
  "Graduate — PhD",
];

const profileSchema = z.object({
  name: z.string().trim().min(1, "Add your name").max(80, "Keep it under 80 characters"),
  level: z.string().min(1, "Pick your education level"),
  school: z.string().trim().min(1, "Add your school").max(120),
  location: z.string().trim().min(1, "Add your location").max(120),
  major: z.string().trim().min(1, "Add your major or focus").max(120),
  gpa: z
    .string()
    .trim()
    .regex(/^(\d(\.\d{1,2})?|10(\.0{1,2})?)$/i, "Use a number like 3.87")
    .refine((v) => {
      const n = parseFloat(v);
      return n >= 0 && n <= 10;
    }, "GPA must be between 0 and 10"),
  firstGen: z.boolean(),
  pellEligible: z.boolean(),
  identity: z.array(z.string()).max(10),
  careerGoal: z.string().trim().min(1, "What are you working toward?").max(400),
  shortBio: z.string().trim().min(1, "A sentence or two helps the coach").max(600),
  experiences: z.string().trim().min(1, "Add at least one experience").max(2000),
  awards: z.string().trim().max(1000),
});

function StartPage() {
  const { profile, isCustom, save, reset } = useProfile();
  const navigate = useNavigate();
  const [form, setForm] = useState<UserProfile>(defaultProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleIdentity = (label: string) => {
    setForm((f) => ({
      ...f,
      identity: f.identity.includes(label)
        ? f.identity.filter((x) => x !== label)
        : [...f.identity, label],
    }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const flat: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const k = String(issue.path[0]);
        if (!flat[k]) flat[k] = issue.message;
      }
      setErrors(flat);
      const firstField = Object.keys(flat)[0];
      const el = firstField && document.getElementById(`f-${firstField}`);
      if (el && "scrollIntoView" in el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    setSubmitting(true);
    save({ ...form, ...result.data });
    setTimeout(() => navigate({ to: "/journey" }), 350);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-bold">
              S<span className="text-gold">e</span>
            </div>
            <span className="font-display font-semibold tracking-tight">Scholar-E</span>
          </Link>
          <div className="flex items-center gap-2">
            {isCustom && (
              <button
                type="button"
                onClick={() => {
                  reset();
                  setForm(defaultProfile);
                }}
                className="text-xs text-muted-foreground hover:text-foreground rounded-full border border-border px-3 py-1.5"
              >
                Reset to Maya's example
              </button>
            )}
            <Link to="/journey" className="text-xs rounded-full bg-secondary px-3 py-1.5">
              Skip → use current profile
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="font-mono text-xs text-gold uppercase tracking-widest">Step 0 · Setup</div>
        <h1 className="font-display text-4xl md:text-5xl mt-2 text-balance">
          Start with <span className="italic text-primary">your</span> profile.
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          The whole 17-step journey personalizes around what you enter here — your discovery resources, fit
          scores, and coach feedback. Nothing leaves your browser.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-8">
          <Section title="The basics">
            <Grid cols={2}>
              <Field label="Full name" error={errors.name}>
                <input
                  id="f-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  maxLength={80}
                  className={input(errors.name)}
                  placeholder="e.g. Jordan Park"
                />
              </Field>
              <Field label="Education level" error={errors.level}>
                <select
                  id="f-level"
                  value={form.level}
                  onChange={(e) => set("level", e.target.value)}
                  className={input(errors.level)}
                >
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="School" error={errors.school}>
                <input
                  id="f-school"
                  value={form.school}
                  onChange={(e) => set("school", e.target.value)}
                  maxLength={120}
                  className={input(errors.school)}
                  placeholder="e.g. UT Austin"
                />
              </Field>
              <Field label="Location" error={errors.location}>
                <input
                  id="f-location"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  maxLength={120}
                  className={input(errors.location)}
                  placeholder="City, State"
                />
              </Field>
              <Field label="Major / focus area" error={errors.major}>
                <input
                  id="f-major"
                  value={form.major}
                  onChange={(e) => set("major", e.target.value)}
                  maxLength={120}
                  className={input(errors.major)}
                  placeholder="e.g. Mechanical Engineering"
                />
              </Field>
              <Field label="GPA (0–4.0 or 0–10 scale)" error={errors.gpa}>
                <input
                  id="f-gpa"
                  value={form.gpa}
                  onChange={(e) => set("gpa", e.target.value)}
                  inputMode="decimal"
                  maxLength={5}
                  className={input(errors.gpa)}
                  placeholder="3.87"
                />
              </Field>
            </Grid>
          </Section>

          <Section title="Background">
            <Grid cols={2}>
              <Toggle
                label="I'm a first-generation college student"
                checked={form.firstGen}
                onChange={(v) => set("firstGen", v)}
              />
              <Toggle
                label="I have demonstrated financial need (Pell-eligible)"
                checked={form.pellEligible}
                onChange={(v) => set("pellEligible", v)}
              />
            </Grid>

            <div className="mt-5">
              <div className="text-sm font-medium mb-2">Identity categories (pick any that apply)</div>
              <div className="flex flex-wrap gap-2">
                {IDENTITY_OPTIONS.map((opt) => {
                  const on = form.identity.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleIdentity(opt)}
                      className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                        on
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-card hover:bg-accent"
                      }`}
                    >
                      {on ? "✓ " : ""}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section title="Your story">
            <Field label="Short bio (1–2 sentences)" error={errors.shortBio} hint={`${form.shortBio.length}/600`}>
              <textarea
                id="f-shortBio"
                value={form.shortBio}
                onChange={(e) => set("shortBio", e.target.value)}
                maxLength={600}
                rows={3}
                className={input(errors.shortBio)}
                placeholder="Who you are in two sentences — where you're from, what got you into your field."
              />
            </Field>
            <Field label="Career goal" error={errors.careerGoal} hint={`${form.careerGoal.length}/400`}>
              <textarea
                id="f-careerGoal"
                value={form.careerGoal}
                onChange={(e) => set("careerGoal", e.target.value)}
                maxLength={400}
                rows={2}
                className={input(errors.careerGoal)}
                placeholder="What are you working toward in 5–10 years?"
              />
            </Field>
            <Field
              label="Experiences"
              error={errors.experiences}
              hint="One per line — research, leadership, work, volunteer"
            >
              <textarea
                id="f-experiences"
                value={form.experiences}
                onChange={(e) => set("experiences", e.target.value)}
                maxLength={2000}
                rows={6}
                className={`${input(errors.experiences)} font-mono text-[13px]`}
                placeholder={
                  "Research Assistant — XYZ Lab (Jan 2025–present)\nPresident — Robotics Club (2024–25)\nBarista — Local Cafe (summers)"
                }
              />
            </Field>
            <Field label="Awards & honors" error={errors.awards} hint="One per line (optional)">
              <textarea
                id="f-awards"
                value={form.awards}
                onChange={(e) => set("awards", e.target.value)}
                maxLength={1000}
                rows={3}
                className={`${input(errors.awards)} font-mono text-[13px]`}
                placeholder={"National Merit Finalist (2024)\nDean's List (Fall 2024, Spring 2025)"}
              />
            </Field>
          </Section>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save profile & start journey →"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* ----- small form atoms ----- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{title}</div>
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">{children}</div>
    </section>
  );
}

function Grid({ cols, children }: { cols: 1 | 2; children: React.ReactNode }) {
  return <div className={`grid gap-4 ${cols === 2 ? "md:grid-cols-2" : ""}`}>{children}</div>;
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${
        checked ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent"
      }`}
    >
      <span
        className={`size-5 rounded-md grid place-items-center text-[11px] ${
          checked ? "bg-primary text-primary-foreground" : "border-2 border-border"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      <span>{label}</span>
    </button>
  );
}

function input(err?: string) {
  return `w-full rounded-lg border ${
    err ? "border-destructive" : "border-border"
  } bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`;
}
