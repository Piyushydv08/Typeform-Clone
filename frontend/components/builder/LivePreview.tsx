"use client";

import { Question } from "@/lib/types";
import { UploadCloud } from "lucide-react";

export function LivePreview({ question, themeConfig }: { question?: Question; themeConfig?: Record<string, any> }) {
  if (!question) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-8 min-h-[500px]">
        <div
          className="w-16 h-16 border-2 border-dashed rounded-2xl flex items-center justify-center"
          style={{ borderColor: "var(--border)" }}
        >
          <span style={{ color: "var(--text-faint)", fontSize: "1.5rem" }}>👁</span>
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--text-faint)" }}>
          Select a question to preview
        </p>
      </div>
    );
  }

  const bgStyle = themeConfig?.backgroundImage 
    ? { backgroundImage: `url(${themeConfig.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: themeConfig?.backgroundColor || "var(--bg)" };
  
  const textColor = themeConfig?.textColor || "var(--text)";
  const buttonColor = themeConfig?.buttonColor || "var(--accent)";
  const buttonTextColor = themeConfig?.buttonTextColor || "#FFFFFF";

  return (
    <div className="p-12 w-full h-full flex flex-col justify-center relative min-h-[500px]" style={bgStyle}>
      {/* Preview badge */}
      <div
        className="absolute top-5 left-5 text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase"
        style={{ color: buttonColor, backgroundColor: buttonColor + "20" }}
      >
        Preview
      </div>

      {/* Question heading */}
      <div className="flex items-start gap-4 mb-3">
        <div className="font-bold text-xl mt-1 shrink-0 font-mono" style={{ color: buttonColor }}>
          {question.order_index + 1}
        </div>
        <h2 className="text-3xl font-bold leading-tight" style={{ color: textColor }}>
          {question.title || "Question Title"}
          {question.required && (
            <span style={{ color: buttonColor }} className="ml-2">*</span>
          )}
        </h2>
      </div>

      {question.description && (
        <p className="text-lg mb-8 pl-9 opacity-80" style={{ color: textColor }}>
          {question.description}
        </p>
      )}

      <div className="mt-4 w-full pl-9">
        {/* Short text / email / number */}
        {["short_text", "email", "number"].includes(question.type) && (
          <input
            type="text"
            disabled
            placeholder="Type your answer here…"
            className="w-full border-b-2 bg-transparent py-3 text-2xl outline-none placeholder:opacity-50"
            style={{ borderColor: buttonColor, color: textColor }}
          />
        )}

        {/* Long text */}
        {question.type === "long_text" && (
          <textarea
            disabled
            placeholder="Type your answer here…"
            className="w-full border-b-2 bg-transparent py-3 text-2xl outline-none resize-none h-32 placeholder:opacity-50"
            style={{ borderColor: buttonColor, color: textColor }}
          />
        )}

        {/* Multiple choice */}
        {question.type === "multiple_choice" && (
          <div className="space-y-3 max-w-2xl">
            {(question.options || []).map((opt, i) => (
              <div
                key={opt}
                className="w-full text-left px-5 py-3 rounded-lg border-2 font-medium bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center gap-3 cursor-pointer"
                style={{ borderColor: buttonColor + "40", color: textColor }}
              >
                <div 
                  className="w-6 h-6 flex items-center justify-center rounded bg-black/10 text-xs font-bold font-mono"
                  style={{ color: textColor }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
                {opt || `Option ${i + 1}`}
              </div>
            ))}
            
            {question.validation_config?.has_other && (
              <div
                className="w-full text-left px-5 py-3 rounded-lg border-2 font-medium bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center gap-3 cursor-pointer"
                style={{ borderColor: buttonColor + "40", color: textColor }}
              >
                <div 
                  className="w-6 h-6 flex items-center justify-center rounded bg-black/10 text-xs font-bold font-mono"
                  style={{ color: textColor }}
                >
                  {String.fromCharCode(65 + (question.options?.length || 0))}
                </div>
                Other
              </div>
            )}
            
            {question.validation_config?.has_none && (
              <div
                className="w-full text-left px-5 py-3 rounded-lg border-2 font-medium bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center gap-3 cursor-pointer"
                style={{ borderColor: buttonColor + "40", color: textColor }}
              >
                <div 
                  className="w-6 h-6 flex items-center justify-center rounded bg-black/10 text-xs font-bold font-mono"
                  style={{ color: textColor }}
                >
                  {String.fromCharCode(65 + (question.options?.length || 0) + (question.validation_config?.has_other ? 1 : 0))}
                </div>
                None of the above
              </div>
            )}
            
            {(!question.options || question.options.length === 0) && (
              <div className="text-sm opacity-60" style={{ color: textColor }}>No options provided</div>
            )}
          </div>
        )}

        {/* Dropdown */}
        {question.type === "dropdown" && (
          <div className="w-full max-w-2xl relative">
            <select
              disabled
              className="w-full appearance-none bg-transparent border-b-2 py-3 text-2xl outline-none"
              style={{ borderColor: buttonColor, color: textColor }}
            >
              <option value="" disabled selected>Select an option…</option>
              {(question.options || []).map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: buttonColor }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        )}

        {question.type === "yes_no" && (
          <div className="flex gap-4 max-w-md">
            {["Yes", "No"].map((label) => (
              <div
                key={label}
                className="flex-1 py-5 border-2 rounded-2xl font-bold text-center text-xl cursor-pointer hover:bg-white/10 transition-colors"
                style={{ borderColor: buttonColor, color: textColor }}
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {question.type === "rating" && (
          <div className="flex gap-3 flex-wrap">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="w-14 h-14 flex items-center justify-center border-2 rounded-2xl text-xl font-bold cursor-pointer hover:bg-white/10 transition-colors"
                style={{ borderColor: buttonColor, color: textColor }}
              >
                {n}
              </div>
            ))}
          </div>
        )}

        {question.type === "file_upload" && (
          <div
            className="w-full max-w-xl p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
            style={{ borderColor: buttonColor, color: textColor }}
          >
            <UploadCloud size={44} className="mb-4" />
            <div className="font-bold text-xl mb-1">
              Choose file or drag here
            </div>
            <div className="text-sm opacity-70">Size limit: 10 MB</div>
          </div>
        )}
      </div>

      <div className="mt-12 pl-9">
        <button
          disabled
          className="px-6 py-2.5 rounded-md font-bold transition-opacity hover:opacity-90 flex items-center gap-2 shadow-sm cursor-not-allowed opacity-60"
          style={{ backgroundColor: buttonColor, color: buttonTextColor }}
        >
          OK <span className="font-normal">→</span>
        </button>
      </div>
    </div>
  );
}
