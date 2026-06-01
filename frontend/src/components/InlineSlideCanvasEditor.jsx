import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  GripVertical,
  ImageUp,
  LayoutTemplate,
  Move,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  Wand2,
  X
} from "lucide-react";
import clsx from "clsx";
import { getSlideLayoutVariant } from "../utils/slideLayouts";
import { getSlideTheme } from "../utils/slideThemes";
import ProgressiveSlideImage from "./ProgressiveSlideImage";

const baseEditableClass =
  "w-full rounded-lg bg-transparent px-2 py-1 text-left outline-none ring-0 transition placeholder:text-slate-400 hover:bg-white/60 focus:bg-white/85";

const imageTransformStyle = (slide) => ({
  objectPosition: `${Number(slide?.imageStyle?.offsetX ?? 50)}% ${Number(
    slide?.imageStyle?.offsetY ?? 50
  )}%`,
  transform: `scale(${Number(slide?.imageStyle?.scale ?? 100) / 100})`
});

const promptSuggestions = [
  "Cinematic editorial composition with dramatic lighting",
  "Minimal futuristic visual with depth and neon accents",
  "Clean professional stock-style scene with no text",
  "Modern product storytelling visual in 16:9 composition"
];

const EditableText = ({
  className,
  value,
  onChange,
  placeholder,
  multiline = false
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!multiline || !inputRef.current) {
      return;
    }

    inputRef.current.style.height = "0px";
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  }, [multiline, value]);

  if (multiline) {
    return (
      <textarea
        ref={inputRef}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck
        rows={1}
        dir="ltr"
        className={clsx(
          baseEditableClass,
          "resize-none overflow-hidden whitespace-pre-wrap",
          className
        )}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      spellCheck
      autoComplete="off"
      dir="ltr"
      className={clsx(baseEditableClass, className)}
    />
  );
};

const BulletList = ({ slide, onBulletChange, dark = false }) => (
  <ul className={clsx("space-y-2", dark ? "text-white" : "text-slatePro-700")}>
    {(slide.bulletPoints || []).map((point, bulletIndex) => (
      <li key={bulletIndex} className="flex gap-2">
        <span
          className={clsx(
            "mt-3 h-1.5 w-1.5 rounded-full",
            dark ? "bg-cyan-300" : "bg-brand-500"
          )}
        />
        <EditableText
          value={point}
          onChange={(nextValue) => onBulletChange(bulletIndex, nextValue)}
          className={clsx(
            "text-sm leading-6",
            dark ? "text-white placeholder:text-slate-300/70" : "text-slatePro-700 placeholder:text-slatePro-400"
          )}
          placeholder="Bullet point"
        />
      </li>
    ))}
  </ul>
);

const PromptEditorModal = ({
  isOpen,
  promptDraft,
  onPromptDraftChange,
  onClose,
  onRegenerate,
  isLoading
}) => (
  <AnimatePresence>
    {isOpen ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          className="w-full max-w-xl rounded-3xl border border-cyan-300/25 bg-slate-900/95 p-5 shadow-[0_22px_70px_rgba(8,47,73,0.55)]"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Image Prompt
              </p>
              <h4 className="mt-1 text-lg font-semibold text-white">Refine slide visual direction</h4>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800/70 p-2 text-slate-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <textarea
            value={promptDraft}
            onChange={(event) => onPromptDraftChange(event.target.value)}
            className="h-36 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-sm leading-6 text-slate-100 outline-none focus:border-cyan-300/60"
            placeholder="Describe a premium cinematic visual for this slide..."
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onPromptDraftChange(suggestion)}
                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Regenerate visual
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

const SlideImage = ({
  slide,
  onImageStyleChange,
  onImageUrlChange,
  onRegenerateImage,
  onDeleteImage,
  onPromptChange,
  isImageLoading
}) => {
  const wrapperRef = useRef(null);
  const uploadInputRef = useRef(null);
  const dragStateRef = useRef(null);
  const [isRepositionMode, setIsRepositionMode] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptDraft, setPromptDraft] = useState(slide.imagePrompt || "");

  useEffect(() => {
    setPromptDraft(slide.imagePrompt || "");
  }, [slide.imagePrompt]);

  const startDrag = (event) => {
    if (!wrapperRef.current || !slide.imageUrl || !isRepositionMode) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    dragStateRef.current = {
      rect,
      startX: event.clientX,
      startY: event.clientY,
      initialOffsetX: Number(slide.imageStyle?.offsetX ?? 50),
      initialOffsetY: Number(slide.imageStyle?.offsetY ?? 50)
    };

    const onMove = (moveEvent) => {
      if (!dragStateRef.current) return;
      const deltaX = ((moveEvent.clientX - dragStateRef.current.startX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - dragStateRef.current.startY) / rect.height) * 100;
      onImageStyleChange({
        offsetX: Math.max(0, Math.min(100, dragStateRef.current.initialOffsetX + deltaX)),
        offsetY: Math.max(0, Math.min(100, dragStateRef.current.initialOffsetY + deltaY))
      });
    };

    const onUp = () => {
      dragStateRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageUrlChange(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const onApplyPromptRegeneration = async () => {
    const nextPrompt = String(promptDraft || "").trim();
    onPromptChange(nextPrompt);
    await onRegenerateImage(nextPrompt);
    setIsPromptModalOpen(false);
  };

  return (
    <>
      <div
        ref={wrapperRef}
        className="group relative h-56 overflow-hidden rounded-[1.35rem] border border-white/20 bg-slate-950/70 shadow-[0_22px_60px_rgba(15,23,42,0.55)] sm:h-72 sm:rounded-[1.6rem] lg:h-[26rem]"
      >
        {slide.imageUrl ? (
          <ProgressiveSlideImage
            key={`${slide.imageUrl}-${slide.layoutVariant || "default"}-${slide.imageMeta?.generatedAt || ""}`}
            slide={slide}
            className={clsx("h-full w-full", isRepositionMode ? "cursor-move" : "")}
            style={imageTransformStyle(slide)}
            allowDrag={isRepositionMode}
            onMouseDown={startDrag}
            showLoadingState
          />
        ) : (
          <div className="image-skeleton absolute inset-0 flex items-center justify-center bg-slate-900/80">
            <div className="flex items-center gap-2 text-sm font-medium text-cyan-100">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Generating visual...
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        <div className="absolute right-2 top-2 z-10 flex translate-y-0 flex-wrap gap-1.5 opacity-100 transition duration-300 sm:right-3 sm:top-3 sm:translate-y-2 sm:gap-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onRegenerateImage(promptDraft)}
            className="inline-flex items-center gap-1 rounded-xl border border-white/25 bg-slate-900/70 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md sm:px-3 sm:text-xs"
            disabled={isImageLoading}
          >
            {isImageLoading ? <RefreshCcw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Regenerate
          </button>
          <button
            type="button"
            onClick={() => setIsPromptModalOpen(true)}
            className="rounded-xl border border-white/25 bg-slate-900/70 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md sm:px-3 sm:text-xs"
          >
            Edit Prompt
          </button>
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-xl border border-white/25 bg-slate-900/70 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md sm:px-3 sm:text-xs"
          >
            <ImageUp className="h-3.5 w-3.5" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setIsRepositionMode((current) => !current)}
            className={clsx(
              "inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold backdrop-blur-md",
              "px-2.5 text-[11px] sm:px-3 sm:text-xs",
              isRepositionMode
                ? "border-cyan-300/70 bg-cyan-300/20 text-cyan-100"
                : "border-white/25 bg-slate-900/70 text-white"
            )}
          >
            <Move className="h-3.5 w-3.5" />
            {isRepositionMode ? "Repositioning" : "Reposition"}
          </button>
          <button
            type="button"
            onClick={onDeleteImage}
            className="inline-flex items-center gap-1 rounded-xl border border-red-300/35 bg-red-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-red-100 backdrop-blur-md sm:px-3 sm:text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>

        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUploadImage}
        />
      </div>

      <PromptEditorModal
        isOpen={isPromptModalOpen}
        promptDraft={promptDraft}
        onPromptDraftChange={setPromptDraft}
        onClose={() => setIsPromptModalOpen(false)}
        onRegenerate={onApplyPromptRegeneration}
        isLoading={isImageLoading}
      />
    </>
  );
};

export default function InlineSlideCanvasEditor({
  slide,
  index,
  template = "Business",
  zoom,
  isImageLoading,
  onFieldChange,
  onBulletChange,
  onRegenerateImage,
  onDeleteImage,
  onDuplicate,
  onDeleteSlide,
  onAddAfter,
  onCycleLayout,
  onDragStart,
  onDragOver,
  onDrop
}) {
  const layout = slide.layoutVariant || getSlideLayoutVariant(index);
  const zoomStyle = { transform: `scale(${zoom / 100})`, transformOrigin: "top center" };
  const theme = getSlideTheme(template);
  const prefersLightText = theme.contentMode === "dark";

  const imagePanel = (
    <SlideImage
      slide={slide}
      isImageLoading={isImageLoading}
      onRegenerateImage={onRegenerateImage}
      onDeleteImage={onDeleteImage}
      onImageUrlChange={(nextUrl) => onFieldChange("imageUrl", nextUrl)}
      onPromptChange={(nextPrompt) => onFieldChange("imagePrompt", nextPrompt)}
      onImageStyleChange={(patch) =>
        onFieldChange("imageStyle", {
          ...slide.imageStyle,
          ...patch
        })
      }
    />
  );

  const textBlock = (dark = false) => (
    <div className={clsx("flex flex-col gap-4 p-4 sm:p-6 md:p-8", dark ? "text-white" : "text-slatePro-900")}>
      <EditableText
        value={slide.title}
        onChange={(nextValue) => onFieldChange("title", nextValue)}
        className={clsx(
          "font-display text-2xl font-bold leading-tight sm:text-3xl",
          dark ? "text-white placeholder:text-slate-300/70" : "text-slatePro-900 placeholder:text-slatePro-400"
        )}
        placeholder="Slide title"
      />
      <BulletList slide={slide} onBulletChange={onBulletChange} dark={dark} />
      <EditableText
        as="p"
        multiline
        value={slide.summary}
        onChange={(nextValue) => onFieldChange("summary", nextValue)}
        className={clsx(
          "text-sm leading-7",
          dark ? "text-slate-100 placeholder:text-slate-300/70" : "text-slatePro-600 placeholder:text-slatePro-400"
        )}
        placeholder="Add supporting narrative"
      />
    </div>
  );

  const renderCanvas = () => {
    if (layout === "image-left") {
      return (
        <div className="grid items-stretch gap-6 lg:grid-cols-[0.9fr,1.1fr]">
          {imagePanel}
          {textBlock(prefersLightText)}
        </div>
      );
    }

    if (layout === "image-top") {
      return (
        <div className="grid gap-5">
          {imagePanel}
          {textBlock(prefersLightText)}
        </div>
      );
    }

    if (layout === "image-bottom") {
      return (
        <div className="grid gap-5">
          {textBlock(prefersLightText)}
          {imagePanel}
        </div>
      );
    }

    if (layout === "image-background") {
      return (
        <div className="relative overflow-hidden rounded-[1.75rem]">
          <div className="min-h-[28rem] sm:min-h-[32rem]">
            <ProgressiveSlideImage
              key={`${slide.imageUrl}-${slide.layoutVariant || "background"}-${slide.imageMeta?.generatedAt || ""}`}
              slide={slide}
              className="absolute inset-0 h-full w-full"
              style={imageTransformStyle(slide)}
              showLoadingState
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slatePro-950/85 via-slatePro-900/55 to-slatePro-950/25" />
            <div className="relative z-10 grid min-h-[28rem] gap-4 sm:min-h-[32rem] sm:gap-6 lg:grid-cols-[1fr,340px]">
              <div className="max-w-2xl">{textBlock(true)}</div>
              <div className="p-4 sm:p-5">{imagePanel}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid items-stretch gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        {textBlock(prefersLightText)}
        {imagePanel}
      </div>
    );
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-[1.5rem] border border-slatePro-200/85 bg-white/95 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.16)] sm:rounded-[2rem] sm:p-5"
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", theme.chip)}>
            Slide {index + 1}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slatePro-500">
            <GripVertical className="h-3.5 w-3.5" />
            Drag to reorder
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onCycleLayout} className="btn-secondary px-3 py-2 text-[11px] sm:text-xs">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Layout
          </button>
          <button type="button" onClick={onDuplicate} className="btn-secondary px-3 py-2 text-[11px] sm:text-xs">
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </button>
          <button type="button" onClick={onAddAfter} className="btn-secondary px-3 py-2 text-[11px] sm:text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add After
          </button>
          <button
            type="button"
            onClick={onDeleteSlide}
            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600 sm:text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="overflow-hidden pb-2">
        <div style={zoomStyle} className="mx-auto w-full min-w-0 max-w-full sm:min-w-[560px] lg:min-w-[760px]">
          <div
            data-slide-export={`slide-${index}`}
            className={clsx("overflow-hidden rounded-[1.75rem] border", theme.border, theme.shell)}
          >
            {renderCanvas()}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
