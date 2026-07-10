"use client";

import { useState, useEffect, useRef } from "react";
import { Question } from "@/lib/types";
import { api } from "@/lib/api";
import { useToast } from "../ui/ToastProvider";
import { Check, GripVertical, Plus, Trash2, ChevronDown } from "lucide-react";

export function QuestionEditor({
  question,
  onUpdate,
}: {
  question?: Question;
  onUpdate: (q: Question) => void;
}) {
  // Initialize directly from prop so first render already has data
  const [localQ, setLocalQ] = useState<Question | null>(question ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Keep in sync when selected question changes
  useEffect(() => {
    setLocalQ(question ?? null);
    setSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaving(false);
  }, [question?.id]);

  const handleChange = (updates: Partial<Question>) => {
    if (!localQ) return;
    const newQ = { ...localQ, ...updates };
    setLocalQ(newQ);
    onUpdate(newQ);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaving(true);
    setSaved(false);

    saveTimeout.current = setTimeout(async () => {
      try {
        await api.questions.update(newQ.id, updates);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (e: any) {
        console.error("[QuestionEditor] Save failed:", e);
        toast("Failed to save", e.message, "error");
      } finally {
        setSaving(false);
      }
    }, 800);
  };

  if (!localQ) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-2xl border-2 border-dashed mb-4 flex items-center justify-center"
          style={{ borderColor: "var(--border)" }}>
          <span style={{ color: "var(--text-faint)", fontSize: "1.5rem" }}>⚙</span>
        </div>
        <p className="font-semibold" style={{ color: "var(--text-muted)" }}>Question Settings</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-faint)" }}>
          Select a question to edit its properties.
        </p>
      </div>
    );
  }

  const questionTypes = [
    { value: "short_text", label: "Short Text" },
    { value: "long_text", label: "Long Text" },
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "dropdown", label: "Dropdown" },
    { value: "email", label: "Email" },
    { value: "number", label: "Number" },
    { value: "yes_no", label: "Yes / No" },
    { value: "rating", label: "Rating" },
    { value: "file_upload", label: "File Upload" },
  ];

  const inputCls =
    "w-full p-3 border-2 rounded-xl font-medium text-sm outline-none transition-colors";
  const inputStyle = {
    borderColor: "var(--border)",
    backgroundColor: "var(--card)",
    color: "var(--text)",
  };
  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--accent)";
  };
  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--border)";
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "var(--card)" }}>
      {/* Panel header */}
      <div
        className="p-4 border-b flex justify-between items-center shrink-0"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
      >
        <h3
          className="font-bold text-xs uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          Settings
        </h3>
        <div className="text-xs font-semibold flex items-center gap-1.5 min-w-[70px] justify-end">
          {saving && (
            <span style={{ color: "var(--text-faint)" }} className="animate-pulse">Saving…</span>
          )}
          {saved && (
            <span style={{ color: "#22c55e" }} className="flex items-center gap-1">
              <Check size={13} /> Saved
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5 flex-1 overflow-y-auto">
        {/* Question Type */}
        <div>
          <label
            className="block text-xs font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Question Type
          </label>
          <div className="relative">
            <select
              value={localQ.type}
              onChange={(e) => handleChange({ type: e.target.value as any })}
              onFocus={inputFocusHandler}
              onBlur={inputBlurHandler}
              className={`${inputCls} appearance-none pr-10`}
              style={inputStyle}
            >
              {questionTypes.map((t) => (
                <option key={t.value} value={t.value} style={{ color: "var(--text)", backgroundColor: "var(--card)" }}>
                  {t.label}
                </option>
              ))}
              <option disabled style={{ color: "var(--text-faint)" }}>
                Payment (Coming Soon)
              </option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            className="block text-xs font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Question Title
          </label>
          <input
            type="text"
            value={localQ.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
            className={inputCls}
            style={inputStyle}
            placeholder="E.g. What's your name?"
          />
        </div>

        {/* Description */}
        <div>
          <label
            className="block text-xs font-bold mb-2 uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Description (optional)
          </label>
          <textarea
            value={localQ.description || ""}
            onChange={(e) => handleChange({ description: e.target.value })}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            className={`${inputCls} h-24 resize-none`}
            style={inputStyle}
            placeholder="Optional context for the respondent…"
          />
        </div>

        {/* Required toggle */}
        <div
          className="flex items-center justify-between p-4 border rounded-xl"
          style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text)" }}>Required</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Respondents must answer this question
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={localQ.required}
              onChange={(e) => handleChange({ required: e.target.checked })}
            />
            <div
              className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
              style={{
                backgroundColor: localQ.required ? "var(--accent)" : "var(--border)",
                borderColor: "var(--border)",
              }}
            />
          </label>
        </div>

        {/* Options (multiple choice / dropdown) */}
        {(localQ.type === "multiple_choice" || localQ.type === "dropdown") && (
          <div
            className="p-4 border rounded-xl"
            style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
          >
            <label
              className="block text-xs font-bold mb-4 uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Answer Options
            </label>
            <div className="space-y-2.5">
              {(localQ.options || []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <div style={{ color: "var(--text-faint)" }} className="opacity-40 group-hover:opacity-100 cursor-grab">
                    <GripVertical size={15} />
                  </div>
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: "var(--border)", color: "var(--text-muted)" }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...(localQ.options || [])];
                      newOpts[idx] = e.target.value;
                      handleChange({ options: newOpts });
                    }}
                    className="flex-1 p-2.5 text-sm border rounded-lg outline-none transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--text)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                    placeholder={`Option ${idx + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOpts = [...(localQ.options || [])];
                      newOpts.splice(idx, 1);
                      handleChange({ options: newOpts });
                    }}
                    className="p-2 opacity-0 group-hover:opacity-60 hover:opacity-100 rounded-lg transition-all"
                    style={{ color: "#ef4444" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOpts = [
                    ...(localQ.options || []),
                    `Option ${(localQ.options?.length || 0) + 1}`,
                  ];
                  handleChange({ options: newOpts });
                }}
                className="w-full py-2.5 mt-1 text-sm font-semibold border rounded-xl flex items-center justify-center gap-2 transition-colors"
                style={{
                  color: "var(--accent)",
                  backgroundColor: "rgba(255,61,87,0.05)",
                  borderColor: "rgba(255,61,87,0.2)",
                }}
              >
                <Plus size={15} /> Add Option
              </button>
            </div>

            {localQ.type === "multiple_choice" && (
              <div className="mt-6 pt-6 border-t space-y-4" style={{ borderColor: "var(--border)" }}>

                {/* Multiple Selection */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Multiple selection</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Allow users to select multiple options</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={localQ.validation_config?.multiple_selection || false}
                      onChange={(e) => handleChange({ validation_config: { ...localQ.validation_config, multiple_selection: e.target.checked } })}
                    />
                    <div
                      className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all"
                      style={{
                        backgroundColor: localQ.validation_config?.multiple_selection ? "var(--accent)" : "var(--border)",
                        borderColor: "var(--border)",
                      }}
                    />
                  </label>
                </div>

                {/* Add Other Option */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>"Other" option</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Add a text input for other answers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={localQ.validation_config?.has_other || false}
                      onChange={(e) => handleChange({ validation_config: { ...localQ.validation_config, has_other: e.target.checked } })}
                    />
                    <div
                      className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all"
                      style={{
                        backgroundColor: localQ.validation_config?.has_other ? "var(--accent)" : "var(--border)",
                        borderColor: "var(--border)",
                      }}
                    />
                  </label>
                </div>

                {/* Add None Option */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>"None of the above"</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Add an exclusive none option</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={localQ.validation_config?.has_none || false}
                      onChange={(e) => handleChange({ validation_config: { ...localQ.validation_config, has_none: e.target.checked } })}
                    />
                    <div
                      className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all"
                      style={{
                        backgroundColor: localQ.validation_config?.has_none ? "var(--accent)" : "var(--border)",
                        borderColor: "var(--border)",
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
