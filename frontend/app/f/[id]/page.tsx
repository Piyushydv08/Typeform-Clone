"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { PublicForm } from "@/lib/types";
import { ProgressBar } from "@/components/respondent/ProgressBar";
import { ThankYouScreen } from "@/components/respondent/ThankYouScreen";
import { QuestionSlide } from "@/components/respondent/QuestionSlide";
import { AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function RespondentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await api.public.getForm(id);
        setForm(data);
        if (data.theme_config) {
          const root = document.documentElement;
          if (data.theme_config.backgroundColor) root.style.setProperty("--bg", data.theme_config.backgroundColor);
          if (data.theme_config.textColor) root.style.setProperty("--text", data.theme_config.textColor);
          if (data.theme_config.buttonColor) root.style.setProperty("--accent", data.theme_config.buttonColor);
          if (data.theme_config.buttonTextColor) root.style.setProperty("--accent-text", data.theme_config.buttonTextColor);
          else root.style.setProperty("--accent-text", "#FFFFFF");
          
          if (data.theme_config.backgroundImage) {
            document.body.style.backgroundImage = `url(${data.theme_config.backgroundImage})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
          } else {
            document.body.style.backgroundImage = 'none';
          }
        }
      } catch (e: any) {
        console.error("[RespondentPage] Failed to load form:", e);
        setError("This form isn't available or doesn't exist.");
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
    
    return () => {
      document.body.style.backgroundImage = 'none';
    };
  }, [id]);

  const validateCurrent = (): boolean => {
    if (!form) return false;
    const q = form.questions[currentIndex];
    const val = answers[q.id];
    if (q.required && (val === undefined || val === null || val === "")) {
      setErrors((prev) => ({ ...prev, [q.id]: "This field is required." }));
      return false;
    }
    if (val && q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) {
      setErrors((prev) => ({ ...prev, [q.id]: "Please enter a valid email address." }));
      return false;
    }
    setErrors((prev) => { const n = { ...prev }; delete n[q.id]; return n; });
    return true;
  };

  const [navigating, setNavigating] = useState(false);

  const handleAdvance = (submitIfLast = true) => {
    if (!form || isSubmitting || isSubmitted || navigating) return;
    if (validateCurrent()) {
      if (currentIndex < form.questions.length - 1) {
        setNavigating(true);
        setDirection(1);
        setCurrentIndex((prev) => prev + 1);
        setTimeout(() => setNavigating(false), 500);
      } else if (submitIfLast) {
        handleSubmit();
      }
    }
  };

  const goPrev = () => {
    if (currentIndex > 0 && !navigating) {
      setNavigating(true);
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setTimeout(() => setNavigating(false), 500);
    }
  };

  useEffect(() => {
    const handleNav = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      if (active?.tagName === "TEXTAREA") return;
      if (e.key === "ArrowUp") { e.preventDefault(); goPrev(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); handleAdvance(false); }
    };
    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [currentIndex, form, answers, isSubmitting, isSubmitted, navigating]);

  const handleSubmit = async () => {
    if (!form) return;
    setIsSubmitting(true);
    const hasFiles = Object.values(answers).some((v) => v instanceof File);
    try {
      if (hasFiles) {
        const fd = new FormData();
        Object.entries(answers).forEach(([k, v]) => fd.append(k, v));
        await api.public.submit(form.id, fd, true);
      } else {
        await api.public.submit(form.id, answers, false);
      }
      setIsSubmitted(true);
    } catch (e: any) {
      console.error("[RespondentPage] Submit failed:", e);
      alert(`Submission failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (error || !form || form.questions.length === 0) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center p-8 text-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="max-w-md">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text)" }}>Oops!</h1>
          <p className="text-xl" style={{ color: "var(--text-muted)" }}>
            {error || "This form has no questions."}
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) return <ThankYouScreen form={form} />;

  return (
    <div
      className="h-screen w-screen overflow-hidden relative flex flex-col"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <ProgressBar current={currentIndex + 1} total={form.questions.length} />

      {/* Form title top-right */}
      <div className="absolute top-4 right-6 z-20">
        <span className="text-xs font-semibold" style={{ color: "var(--text-faint)" }}>{form.title}</span>
      </div>

      {/* Submitting overlay */}
      {isSubmitting && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        >
          <div className="text-center">
            <div
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
            />
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Submitting…</p>
          </div>
        </div>
      )}

      {/* Question slides */}
      <div className="flex-1 relative">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <QuestionSlide
            key={currentIndex}
            direction={direction}
            index={currentIndex}
            question={form.questions[currentIndex]}
            value={answers[form.questions[currentIndex].id]}
            error={errors[form.questions[currentIndex].id]}
            onChange={(val) => {
              setAnswers((prev) => ({ ...prev, [form.questions[currentIndex].id]: val }));
              setErrors((prev) => { const n = { ...prev }; delete n[form.questions[currentIndex].id]; return n; });
            }}
            onAdvance={handleAdvance}
          />
        </AnimatePresence>
      </div>

      {/* Nav arrows — bottom right */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          title="Previous"
          className="w-10 h-10 border rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          <ChevronUp size={18} />
        </button>
        <button
          onClick={() => handleAdvance(true)}
          title="Next"
          className="w-10 h-10 border rounded-xl flex items-center justify-center transition-all"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Question counter */}
      <div className="fixed bottom-6 left-6 z-40">
        <span className="text-xs font-medium" style={{ color: "var(--text-faint)" }}>
          {currentIndex + 1} / {form.questions.length}
        </span>
      </div>
    </div>
  );
}
