import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  LayoutTemplate,
  Presentation,
  Sparkles,
  Users,
  Wand2
} from "lucide-react";
import { TEMPLATE_OPTIONS } from "../utils/templates";

const features = [
  {
    icon: Sparkles,
    title: "Real-time AI generation",
    description: "Outline and slides stream live so the deck feels alive while it builds."
  },
  {
    icon: Wand2,
    title: "Inline slide editing",
    description: "Edit directly inside the slide canvas with image, layout, and text controls in place."
  },
  {
    icon: LayoutTemplate,
    title: "Flexible templates",
    description: "Switch between business, modern, tech, minimal, and creative visual systems."
  },
  {
    icon: Presentation,
    title: "Export-ready decks",
    description: "Turn AI-generated drafts into polished presentations for clients, teams, and demos."
  },
  {
    icon: Bot,
    title: "Per-slide AI imagery",
    description: "Every slide gets its own context-aware visual prompt instead of repeated imagery."
  },
  {
    icon: Users,
    title: "Built for workflows",
    description: "Use it as the foundation for future collaboration, review, and publishing flows."
  }
];

const steps = [
  {
    title: "Describe the story",
    description: "Enter a topic, slide count, and optional title to frame the presentation."
  },
  {
    title: "Watch AI build live",
    description: "Outline items and slides appear progressively with status feedback and image generation."
  },
  {
    title: "Refine on-canvas",
    description: "Edit content directly in the slide canvas, regenerate visuals, reorder, and present."
  }
];

const testimonials = [
  {
    quote:
      "The live generation flow feels closer to Gamma than a typical CRUD deck builder. It finally feels premium.",
    name: "Areeba Khan",
    role: "Product Designer"
  },
  {
    quote:
      "We went from rough prompt to investor-ready structure in minutes, and the inline editing was the missing piece.",
    name: "Saad Malik",
    role: "Startup Founder"
  },
  {
    quote:
      "The alternating layouts and context-aware slide visuals made the deck feel designed, not just generated.",
    name: "Hina Yousaf",
    role: "Growth Lead"
  }
];

const faqs = [
  {
    question: "Can I edit every slide after generation?",
    answer: "Yes. Titles, bullets, summaries, image prompts, image positions, and layouts can all be refined directly in the canvas."
  },
  {
    question: "Does generation happen live?",
    answer: "Yes. Outlines and slides stream progressively so users can watch the deck take shape instead of waiting on a blank screen."
  },
  {
    question: "Can I regenerate images per slide?",
    answer: "Yes. Each slide has its own image prompt and regeneration control, with varied layouts for a more polished result."
  }
];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 }
};

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-[#f5fbff] text-slatePro-900">
      <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(240,249,255,0.92))]" />
      <div className="absolute left-[-6rem] top-24 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute right-[-4rem] top-16 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <header className="mb-12 flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/70 px-4 py-4 shadow-glass backdrop-blur-xl sm:mb-16 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h1 className="font-display text-2xl font-bold">SlideCraft AI</h1>
            <p className="text-xs text-slatePro-500">AI presentation workspace</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/login" className="btn-secondary w-full justify-center sm:w-auto">
              Login
            </Link>
            <Link to="/signup" className="btn-primary w-full justify-center sm:w-auto">
              Start Free
            </Link>
          </div>
        </header>

        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr,0.95fr]">
          <motion.div {...fadeInUp} className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-xs font-semibold text-brand-700 shadow-glass">
              <Sparkles className="h-4 w-4" />
              Premium AI presentation generation
            </div>
            <h2 className="max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
              Generate, stream, and edit presentations directly on the slide canvas.
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-slatePro-600">
              A modern AI deck builder inspired by Gamma, Canva, and Notion. Watch outlines and slides appear live, then refine every element inline without leaving the canvas.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/signup" className="btn-primary w-full justify-center sm:w-auto">
                Build a deck
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/create" className="btn-secondary w-full justify-center sm:w-auto">
                View generator
              </Link>
            </div>
            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              {["Live AI outline", "Inline slide editing", "Context-aware images"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-slatePro-600 shadow-glass">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ duration: 0.6, delay: 0.1 }} className="glass-panel rounded-[2rem] p-5">
            <div className="rounded-[1.75rem] bg-slatePro-900 p-4 text-white shadow-soft">
              <div className="mb-4 flex items-center justify-between text-xs text-slate-300">
                <span>AI deck preview</span>
                <span>Streaming now</span>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr,0.86fr]">
                <div className="rounded-[1.4rem] bg-white p-5 text-slatePro-900">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Slide 3</p>
                  <h3 className="mt-2 font-display text-2xl font-bold">AI diagnostics in clinical workflows</h3>
                  <ul className="mt-4 space-y-2 text-sm text-slatePro-700">
                    <li>- Predictive triage and faster patient routing</li>
                    <li>- Imaging models assisting radiology teams</li>
                    <li>- Decision support for treatment planning</li>
                    <li>- Data quality and ethics remain critical</li>
                  </ul>
                </div>
                <div className="overflow-hidden rounded-[1.4rem] bg-[linear-gradient(160deg,#0ea5e9,#082f49)] p-5">
                  <div className="h-full rounded-[1.2rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <div className="grid gap-3">
                      <div className="h-24 rounded-2xl bg-white/20" />
                      <div className="h-3 w-3/4 rounded-full bg-white/25" />
                      <div className="h-3 w-2/3 rounded-full bg-white/25" />
                      <div className="h-3 w-4/5 rounded-full bg-white/25" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-24">
          <motion.div {...fadeInUp} className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Features</p>
            <h3 className="mt-3 font-display text-4xl font-bold">Built like a modern AI product, not a form app</h3>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                {...fadeInUp}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="glass-panel rounded-3xl p-6"
              >
                <feature.icon className="h-6 w-6 text-brand-600" />
                <h4 className="mt-4 text-lg font-semibold">{feature.title}</h4>
                <p className="mt-2 text-sm leading-7 text-slatePro-600">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-10 lg:grid-cols-[0.9fr,1.1fr]">
          <motion.div {...fadeInUp}>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">How it works</p>
            <h3 className="mt-3 font-display text-4xl font-bold">From idea to deck in three guided steps</h3>
            <p className="mt-4 max-w-xl text-base leading-7 text-slatePro-600">
              The workflow is tuned for speed, but still gives users control when it matters.
            </p>
          </motion.div>
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <motion.div key={step.title} {...fadeInUp} transition={{ duration: 0.45, delay: index * 0.05 }} className="glass-panel rounded-3xl p-6">
                <p className="text-sm font-semibold text-brand-700">0{index + 1}</p>
                <h4 className="mt-2 text-xl font-semibold">{step.title}</h4>
                <p className="mt-2 text-sm leading-7 text-slatePro-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <motion.div {...fadeInUp} className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Templates</p>
              <h3 className="mt-3 font-display text-4xl font-bold">Choose a visual system that fits the story</h3>
            </div>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {TEMPLATE_OPTIONS.map((template, index) => (
              <motion.article key={template.id} {...fadeInUp} transition={{ duration: 0.45, delay: index * 0.04 }} className="glass-panel rounded-3xl p-4">
                <div className="mb-4 flex gap-2">
                  {template.palette.map((color) => (
                    <span key={color} className="h-8 w-8 rounded-full border border-white/60" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <h4 className="font-semibold">{template.name}</h4>
                <p className="mt-2 text-sm text-slatePro-600">{template.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.article key={testimonial.name} {...fadeInUp} transition={{ duration: 0.45, delay: index * 0.04 }} className="glass-panel rounded-3xl p-6">
              <p className="text-sm leading-7 text-slatePro-700">“{testimonial.quote}”</p>
              <div className="mt-6">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-slatePro-500">{testimonial.role}</p>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="mt-24 rounded-[2rem] bg-slatePro-900 px-6 py-10 text-white md:px-10">
          <motion.div {...fadeInUp} className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Pricing</p>
              <h3 className="mt-3 font-display text-4xl font-bold">Start free, upgrade when your workflow grows</h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                A polished free experience for solo creators, with room for export, collaboration, and workspace tiers.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-semibold text-cyan-300">Starter</p>
                <p className="mt-3 text-4xl font-bold">Free</p>
                <ul className="mt-5 space-y-3 text-sm text-slate-200">
                  {["AI outline and slides", "Inline canvas editing", "Template selection"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-cyan-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-cyan-300/30 bg-cyan-400/10 p-6">
                <p className="text-sm font-semibold text-cyan-300">Pro</p>
                <p className="mt-3 text-4xl font-bold">$19</p>
                <ul className="mt-5 space-y-3 text-sm text-slate-200">
                  {["Advanced exports", "Collaboration workflows", "Presentation analytics"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-cyan-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-24 grid gap-4 lg:grid-cols-3">
          {faqs.map((faq, index) => (
            <motion.article key={faq.question} {...fadeInUp} transition={{ duration: 0.45, delay: index * 0.04 }} className="glass-panel rounded-3xl p-6">
              <h4 className="text-lg font-semibold">{faq.question}</h4>
              <p className="mt-3 text-sm leading-7 text-slatePro-600">{faq.answer}</p>
            </motion.article>
          ))}
        </section>

        <footer className="mt-20 flex flex-col gap-4 border-t border-slatePro-200/80 py-8 text-sm text-slatePro-500 md:flex-row md:items-center md:justify-between">
          <p>SlideCraft AI. AI presentation building for modern teams.</p>
          <div className="flex gap-4">
            <Link to="/signup" className="hover:text-slatePro-900">Get Started</Link>
            <Link to="/login" className="hover:text-slatePro-900">Login</Link>
            <Link to="/dashboard" className="hover:text-slatePro-900">Dashboard</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
