import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usePresentationStore } from "../store/presentationStore";
import { useSettingsStore } from "../store/settingsStore";

const promptSuggestions = [
  "Startup pitch deck for an AI workflow product",
  "AI in healthcare: opportunities and risks",
  "Marketing strategy for a SaaS launch",
  "SaaS business plan for B2B automation",
  "Portfolio presentation for a product designer"
];

const trendingTemplates = ["Business", "Tech", "Modern", "Minimal", "Creative"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const presentations = usePresentationStore((state) => state.presentations);
  const isLoading = usePresentationStore((state) => state.isLoading);
  const fetchPresentations = usePresentationStore((state) => state.fetchPresentations);
  const setDraft = usePresentationStore((state) => state.setDraft);
  const globalSearch = usePresentationStore((state) => state.globalSearch);
  const setGlobalSearch = usePresentationStore((state) => state.setGlobalSearch);
  const defaultSlideCount = useSettingsStore((state) => state.defaultSlideCount);
  const defaultTemplate = useSettingsStore((state) => state.defaultTemplate);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    fetchPresentations().catch((error) => {
      toast.error(error?.response?.data?.message || "Failed to load presentations.");
    });
  }, [fetchPresentations]);

  const filteredPresentations = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    return presentations
      .filter((item) => {
        if (!query) return true;
        return (
          item.title?.toLowerCase().includes(query) ||
          item.prompt?.toLowerCase().includes(query) ||
          item.template?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [globalSearch, presentations]);

  const startStudio = (topic = prompt) => {
    setDraft({
      topic,
      prompt: topic,
      title: "",
      outline: [],
      slides: [],
      numberOfSlides: String(defaultSlideCount),
      template: defaultTemplate
    });
    navigate("/create");
  };

  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[1.6rem] border border-white/70 bg-slatePro-950 p-4 text-white shadow-soft sm:p-5 md:rounded-[2rem] md:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_30%),radial-gradient(circle_at_right,_rgba(99,102,241,0.25),_transparent_26%)]" />
        <div className="relative z-10 mx-auto max-w-4xl space-y-5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-white/5 px-4 py-2 text-xs font-semibold text-cyan-200">
            <Sparkles className="h-4 w-4" />
            AI presentation workspace
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            What would you like to create today?
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            Move into AI Studio for live outline streaming, template guidance, and progressive slide generation.
          </p>

          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-3 backdrop-blur sm:rounded-[1.75rem]">
            <div className="flex flex-col gap-3 md:flex-row">
              <textarea
                rows={3}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Create a high-impact investor deck for an AI-powered analytics platform..."
                className="w-full rounded-[1.5rem] border border-white/10 bg-slatePro-900/70 px-4 py-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-cyan-300/40"
              />
              <button onClick={() => startStudio()} className="btn-primary w-full md:min-w-[190px] md:w-auto">
                Open AI Studio
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {promptSuggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => setPrompt(item)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-glass backdrop-blur-xl sm:p-5 md:rounded-[1.75rem] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Recent presentations</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slatePro-900">Continue where you left off</h3>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slatePro-400" />
              <input
                className="input-field pl-11"
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Search by title or template"
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredPresentations.slice(0, 6).map((presentation) => (
              <button
                key={presentation._id}
                onClick={() => navigate(`/editor/${presentation._id}`)}
                className="flex w-full items-center justify-between rounded-2xl border border-slatePro-200 bg-white px-4 py-3 text-left transition hover:border-brand-200 hover:shadow-soft"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slatePro-900">{presentation.title}</p>
                  <p className="mt-1 text-xs text-slatePro-500">{presentation.slideCount || 0} slides - {presentation.template}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-slatePro-400">
                  <Clock3 className="h-3.5 w-3.5" />
                  {new Date(presentation.updatedAt).toLocaleDateString()}
                </span>
              </button>
            ))}

            {!isLoading && !filteredPresentations.length ? (
              <p className="rounded-2xl border border-dashed border-slatePro-300 bg-slatePro-50 p-5 text-sm text-slatePro-500">
                No presentations yet. Start with a prompt to generate your first deck.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-glass backdrop-blur-xl sm:p-5 md:rounded-[1.75rem] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Trending templates</p>
          <h3 className="mt-2 font-display text-2xl font-bold text-slatePro-900">Popular visual directions</h3>
          <div className="mt-5 space-y-3">
            {trendingTemplates.map((template, index) => (
              <button
                key={template}
                onClick={() => {
                  setDraft({ template });
                  navigate("/create");
                }}
                className="group flex w-full items-center justify-between rounded-2xl border border-slatePro-200 bg-white px-4 py-3 text-left transition hover:border-brand-200 hover:shadow-soft"
              >
                <div>
                  <p className="text-sm font-semibold text-slatePro-900">{template}</p>
                  <p className="text-xs text-slatePro-500">AI suggestion #{index + 1}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slatePro-400 transition group-hover:text-brand-600" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
