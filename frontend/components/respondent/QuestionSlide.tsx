"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { PublicQuestion } from "@/lib/types";
import { UploadCloud, ArrowRight } from "lucide-react";

interface Props {
  question: PublicQuestion;
  index: number;
  value: any;
  error?: string;
  onChange: (val: any) => void;
  onAdvance: () => void;
  direction: number;
}

export function QuestionSlide({ question, index, value, error, onChange, onAdvance, direction }: Props) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      if (active?.tagName === "TEXTAREA") return;

      if ((question.type === "multiple_choice" || question.type === "dropdown") && question.options) {
        const key = e.key.toUpperCase();
        const code = key.charCodeAt(0);
        if (code >= 65 && code < 65 + question.options.length) {
          onChange(question.options[code - 65]);
          setTimeout(onAdvance, 300);
        }
      }
      if (question.type === "yes_no") {
        if (e.key.toLowerCase() === "y") { onChange("true"); setTimeout(onAdvance, 300); }
        else if (e.key.toLowerCase() === "n") { onChange("false"); setTimeout(onAdvance, 300); }
      }
      if (question.type === "rating") {
        const num = parseInt(e.key);
        const scale = question.validation_config?.scale || 5;
        if (!isNaN(num) && num >= 1 && num <= scale) {
          onChange(num.toString());
          setTimeout(onAdvance, 300);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [question, onChange, onAdvance]);

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const active = document.activeElement as HTMLElement;
        if (active?.tagName === "TEXTAREA") return;
        e.preventDefault();
        onAdvance();
      }
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [onAdvance]);

  const variants = {
    enter: (dir: number) => ({ y: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { zIndex: 1, y: 0, opacity: 1 },
    exit: (dir: number) => ({ zIndex: 0, y: dir < 0 ? 60 : -60, opacity: 0 }),
  };

  return (
    <motion.div
      key={question.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="absolute inset-0 flex flex-col justify-center max-w-3xl mx-auto px-8 md:px-16 w-full"
    >
      {/* Question heading */}
      <div className="flex items-start gap-4 mb-3">
        <div className="font-bold text-xl mt-1.5 shrink-0 font-mono" style={{ color: "var(--accent)" }}>
          {index + 1}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: "var(--text)" }}>
          {question.title}
          {question.required && (
            <span style={{ color: "var(--accent)" }} className="ml-2 text-2xl align-super">*</span>
          )}
        </h2>
      </div>

      {question.description && (
        <p className="text-lg mb-8 pl-10" style={{ color: "var(--text-muted)" }}>
          {question.description}
        </p>
      )}

      <div className="mt-4 w-full pl-10">
        {renderInput(question, value, onChange, onAdvance)}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-2.5 rounded-xl font-medium inline-block text-sm"
            style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)" }}
          >
            ⚠ {error}
          </motion.div>
        )}
      </div>

      {/* OK button */}
      <div className="mt-12 pl-10 flex items-center gap-3">
        <button
          onClick={onAdvance}
          className="flex items-center gap-2.5 font-bold py-3 px-7 rounded-full active:scale-95 transition-all hover:shadow-lg hover:-translate-y-0.5"
          style={{ backgroundColor: "var(--accent)", color: "var(--accent-text)" }}
        >
          OK <ArrowRight size={16} strokeWidth={2.5} />
        </button>
        <span className="text-xs" style={{ color: "var(--text-faint)" }}>
          press{" "}
          <kbd
            className="px-1.5 py-0.5 rounded text-xs font-mono"
            style={{ backgroundColor: "var(--card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            Enter ↵
          </kbd>
        </span>
      </div>
    </motion.div>
  );
}

function renderInput(
  question: PublicQuestion,
  value: any,
  onChange: (val: any) => void,
  onAdvance: () => void
) {
  const valStr = value?.toString() || "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
      setTimeout(onAdvance, 500);
    }
  };

  const inputStyle: React.CSSProperties = {
    borderBottom: "2px solid var(--border)",
    color: "var(--text)",
    background: "transparent",
  };

  const onFocusBorder = (e: React.FocusEvent<any>) => {
    e.currentTarget.style.borderBottomColor = "var(--accent)";
  };
  const onBlurBorder = (e: React.FocusEvent<any>) => {
    e.currentTarget.style.borderBottomColor = "var(--border)";
  };

  switch (question.type) {
    case "short_text":
    case "email":
      return (
        <input
          autoFocus
          type={question.type === "email" ? "email" : "text"}
          value={valStr}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocusBorder}
          onBlur={onBlurBorder}
          placeholder="Type your answer here…"
          className="w-full py-3 text-2xl outline-none bg-transparent"
          style={inputStyle}
        />
      );

    case "number":
      return (
        <input
          autoFocus
          type="number"
          value={valStr}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocusBorder}
          onBlur={onBlurBorder}
          placeholder="0"
          className="w-full py-3 text-2xl outline-none bg-transparent"
          style={inputStyle}
        />
      );

    case "long_text":
      return (
        <textarea
          autoFocus
          value={valStr}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocusBorder}
          onBlur={onBlurBorder}
          placeholder="Type your answer here…"
          className="w-full py-3 text-2xl outline-none resize-none min-h-[120px] bg-transparent"
          style={inputStyle}
        />
      );

    case "multiple_choice": {
      const isMulti = question.validation_config?.multiple_selection;
      const opts = question.options || [];
      const hasOther = question.validation_config?.has_other;
      const hasNone = question.validation_config?.has_none;

      const toggleMulti = (val: string) => {
        let current = Array.isArray(value) ? value : (value ? [value] : []);
        if (current.includes(val)) {
          onChange(current.filter((v: string) => v !== val));
        } else {
          current = current.filter(v => v !== "None of the above");
          if (val === "None of the above") {
            onChange(["None of the above"]);
          } else {
            onChange([...current, val]);
          }
        }
      };

      const handleSelect = (val: string) => {
        if (isMulti) {
          toggleMulti(val);
        } else {
          onChange(val);
          setTimeout(onAdvance, 350);
        }
      };

      const renderOption = (opt: string, i: number, label: string) => {
        const isSelected = isMulti ? (Array.isArray(value) && value.includes(opt)) : valStr === opt;
        return (
          <button
            key={i}
            onClick={() => handleSelect(opt)}
            className="w-full flex items-center text-left gap-4 p-4 border-2 rounded-2xl transition-all"
            style={{
              borderColor: isSelected ? "var(--accent)" : "var(--border)",
              backgroundColor: isSelected ? "rgba(255,61,87,0.08)" : "var(--card)",
              boxShadow: isSelected ? "0 2px 12px rgba(255,61,87,0.15)" : "none",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all"
              style={{
                borderColor: isSelected ? "var(--accent)" : "var(--border)",
                backgroundColor: isSelected ? "var(--accent)" : "transparent",
                color: isSelected ? "var(--accent-text, #fff)" : "var(--text-muted)",
              }}
            >
              {label}
            </div>
            <span
              className="text-xl font-medium"
              style={{ color: isSelected ? "var(--accent)" : "var(--text)" }}
            >
              {opt}
            </span>
          </button>
        );
      };

      return (
        <div className="space-y-3 max-w-2xl">
          {opts.map((opt, i) => renderOption(opt, i, String.fromCharCode(65 + i)))}
          {hasOther && renderOption("Other", opts.length, String.fromCharCode(65 + opts.length))}
          {hasNone && renderOption("None of the above", opts.length + (hasOther ? 1 : 0), String.fromCharCode(65 + opts.length + (hasOther ? 1 : 0)))}
        </div>
      );
    }

    case "dropdown":
      return (
        <div className="w-full max-w-2xl relative mt-4">
          <select
            value={valStr || ""}
            onChange={(e) => {
              onChange(e.target.value);
              setTimeout(onAdvance, 350);
            }}
            onFocus={(e) => { e.currentTarget.style.borderBottomColor = "var(--accent)"; }}
            onBlur={(e) => { e.currentTarget.style.borderBottomColor = "var(--border)"; }}
            className="w-full appearance-none bg-transparent border-b-2 py-4 text-2xl outline-none cursor-pointer"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            <option value="" disabled>Select an option…</option>
            {(question.options || []).map((opt, i) => (
              <option key={i} value={opt} className="text-black">{opt}</option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      );

    case "yes_no":
      return (
        <div className="flex gap-4 max-w-sm">
          {[
            { val: "true", label: "Yes", key: "Y" },
            { val: "false", label: "No", key: "N" },
          ].map(({ val, label, key }) => {
            const isSelected = valStr === val;
            return (
              <button
                key={val}
                onClick={() => { onChange(val); setTimeout(onAdvance, 350); }}
                className="flex-1 py-5 border-2 rounded-2xl font-bold text-center text-xl transition-all flex flex-col items-center gap-1"
                style={{
                  borderColor: isSelected ? "var(--accent)" : "var(--border)",
                  backgroundColor: isSelected ? "rgba(255,61,87,0.08)" : "var(--card)",
                  color: isSelected ? "var(--accent)" : "var(--text)",
                }}
              >
                <span className="text-2xl font-bold">{label}</span>
                <span className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>press {key}</span>
              </button>
            );
          })}
        </div>
      );

    case "rating": {
      const scale = question.validation_config?.scale || 5;
      const range = Array.from({ length: scale }, (_, i) => i + 1);
      return (
        <div className="flex gap-2 flex-wrap max-w-xl">
          {range.map((n) => {
            const isSelected = valStr === n.toString();
            return (
              <button
                key={n}
                onClick={() => { onChange(n.toString()); setTimeout(onAdvance, 350); }}
                className="w-14 h-14 flex items-center justify-center border-2 rounded-2xl text-xl font-bold transition-all"
                style={{
                  borderColor: isSelected ? "var(--accent)" : "var(--border)",
                  backgroundColor: isSelected ? "var(--accent)" : "var(--card)",
                  color: isSelected ? "#fff" : "var(--text)",
                  transform: isSelected ? "scale(1.1)" : "scale(1)",
                  boxShadow: isSelected ? "0 4px 12px rgba(255,61,87,0.3)" : "none",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      );
    }

    case "file_upload":
      return (
        <label
          className="w-full max-w-xl p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
          style={{
            borderColor: value ? "var(--accent)" : "var(--border)",
            backgroundColor: value ? "rgba(255,61,87,0.04)" : "var(--card)",
          }}
        >
          <input type="file" className="hidden" onChange={handleFileChange} />
          <UploadCloud
            size={44}
            className="mb-4"
            style={{ color: value ? "var(--accent)" : "var(--text-faint)" }}
          />
          <div className="font-bold text-xl mb-1" style={{ color: "var(--text)" }}>
            {value ? (value as File).name : "Choose file or drag here"}
          </div>
          <div className="text-sm" style={{ color: "var(--text-muted)" }}>Size limit: 10 MB</div>
        </label>
      );

    default:
      return <div style={{ color: "var(--text-muted)" }}>Unsupported question type</div>;
  }
}
