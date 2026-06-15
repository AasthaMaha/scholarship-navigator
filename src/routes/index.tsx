import { createFileRoute, Link } from "@tanstack/react-router";
import { persona } from "@/lib/persona";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scholar-E — Your AI Scholarship Coach" },
      {
        name: "description",
        content:
          "Scholar-E guides students to discover scholarships, analyze fit, and strengthen essays — without writing them for you.",
      },
      { property: "og:title", content: "Scholar-E — Your AI Scholarship Coach" },
      {
        property: "og:description",
        content: "Discover scholarships, analyze fit, and strengthen essays with an AI coach that helps you sound more like you.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Persona />
        <Pillars />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border/60 backdrop-blur sticky top-0 z-30 bg-background/70">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="font-display font-semibold text-lg tracking-tight">Scholar-E</span>
          <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground border border-border rounded px-1.5 py-0.5">
            SEIP MVP
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#pillars" className="hover:text-foreground">What we deliver</a>
          <a href="#persona" className="hover:text-foreground">Meet Maya</a>
        </nav>
        <Link
          to="/journey"
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Start the journey →
        </Link>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-bold">
      S<span className="text-gold">e</span>
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 grid lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-gold" />
          A coach, not a ghostwriter
        </div>
        <h1 className="mt-5 font-display text-5xl md:text-7xl font-semibold leading-[1.02] text-balance">
          Win scholarships<br />
          <span className="italic text-primary">in your own voice.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl text-balance">
          Scholar-E walks you through 17 steps — from discovery to submission — analyzing fit, highlighting weak
          sentences, and tracking every deadline. You stay the author.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/journey"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium shadow-sm hover:opacity-90"
          >
            Walk through Maya's journey →
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:bg-accent"
          >
            See how it works
          </a>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
          {[
            { k: "17", v: "guided steps" },
            { k: "0", v: "essays written for you" },
            { k: "1", v: "voice — yours" },
          ].map((s) => (
            <div key={s.v}>
              <div className="font-display text-3xl text-primary">{s.k}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5">
        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-br from-gold/30 via-transparent to-primary/20 blur-2xl rounded-3xl" />
      <div className="relative rounded-2xl border border-border bg-card/95 backdrop-blur p-5 shadow-xl">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">essay-shpe-foundation.txt</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success" /> Live feedback
          </span>
        </div>
        <div className="mt-4 text-[15px] leading-relaxed font-display text-foreground/90">
          Things were{" "}
          <span className="bg-gold/40 rounded px-0.5 underline decoration-gold decoration-2 underline-offset-4">
            hard sometimes
          </span>
          . In tenth grade, my school got Chromebooks and I checked one out from the library every single day.
          I taught myself Python while my mom prepped for the next day's lunch service.
        </div>
        <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Specificity · Coach note</span>
            <span className="font-mono text-muted-foreground">12/100 → 78/100</span>
          </div>
          <p className="mt-1.5 text-foreground/80">
            Vague closer to a powerful paragraph. Try one concrete detail that <em>shows</em> the difficulty.
          </p>
          <div className="mt-2 text-xs italic text-muted-foreground">
            "Some nights I did homework on the restaurant counter, my AP Calc book stained with red salsa."
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>SHPE Foundation Scholarship · 487 / 500 words</span>
          <span>Draft v3</span>
        </div>
      </div>
    </div>
  );
}

function Persona() {
  return (
    <section id="persona" className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-3xl border border-border bg-card p-8 md:p-12 grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-4 flex flex-col items-start gap-4">
          <div className="size-20 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-display text-3xl">
            {persona.initials}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Walk through as</div>
            <h2 className="font-display text-3xl mt-1">{persona.name}</h2>
            <div className="text-sm text-muted-foreground">
              {persona.level} · {persona.school}
            </div>
          </div>
        </div>
        <div className="md:col-span-8">
          <p className="text-lg text-balance text-foreground/90">{persona.shortBio}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {persona.identity.map((i) => (
              <span key={i} className="text-xs rounded-full bg-secondary text-secondary-foreground px-3 py-1">
                {i}
              </span>
            ))}
            <span className="text-xs rounded-full bg-gold/20 text-foreground px-3 py-1">GPA {persona.gpa}</span>
            <span className="text-xs rounded-full bg-gold/20 text-foreground px-3 py-1">{persona.major}</span>
            <span className="text-xs rounded-full bg-gold/20 text-foreground px-3 py-1">{persona.location}</span>
          </div>
          <Link
            to="/journey"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Begin Maya's 17-step journey →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  const items = [
    {
      t: "Personalized guidance",
      d: "Rule-based discovery maps your profile to scholarship buckets and curated sources — no scraping, no spam.",
    },
    {
      t: "Smart analysis",
      d: "Paste any scholarship link. AI extracts deadlines, eligibility, required docs, and prompts in seconds.",
    },
    {
      t: "Actionable feedback",
      d: "Grammarly-style highlights on your essay — clarity, specificity, leadership, storytelling, impact.",
    },
    {
      t: "Submission readiness",
      d: "Final check verifies every required document, word count, and recommender before you hit submit.",
    },
    {
      t: "Track & succeed",
      d: "One board for every application — Interested → Drafting → Submitted → Awarded.",
    },
  ];
  return (
    <section id="pillars" className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">What Scholar-E delivers</div>
        <h2 className="font-display text-4xl mt-2">Five things every applicant needs.</h2>
      </div>
      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {items.map((it, i) => (
          <div key={it.t} className="rounded-2xl border border-border bg-card p-5">
            <div className="font-mono text-xs text-gold">0{i + 1}</div>
            <div className="font-display text-lg mt-2">{it.t}</div>
            <p className="mt-2 text-sm text-muted-foreground">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-14 grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8">
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            See it the way a student sees it.
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl">
            This isn't a demo with placeholder data. Walk through all 17 steps as Maya Rodriguez — a real persona
            with a real essay, real scholarships, and real coach feedback.
          </p>
        </div>
        <div className="md:col-span-4 md:text-right">
          <Link
            to="/journey"
            className="inline-flex items-center gap-2 rounded-full bg-gold text-gold-foreground px-6 py-3 text-sm font-semibold hover:opacity-90"
          >
            Enter the journey →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 mt-10">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span>Scholar-E · Rice SEIP Summer 2026 · Prototype</span>
        </div>
        <div>A coach, not a ghostwriter.</div>
      </div>
    </footer>
  );
}
