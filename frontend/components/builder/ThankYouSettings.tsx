"use client";

import { useState, useEffect } from "react";
import { Form } from "@/lib/types";
import { api } from "@/lib/api";
import { Check } from "lucide-react";

export function ThankYouSettings({ form, onUpdate }: { form: Form; onUpdate: (f: Form) => void }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    thank_you_title: form.theme_config?.thank_you_title || "All done!",
    thank_you_description: form.theme_config?.thank_you_description || "Thank you for completing this form.",
    thank_you_button_text: form.theme_config?.thank_you_button_text || "",
    thank_you_redirect_url: form.theme_config?.thank_you_redirect_url || "",
  });

  useEffect(() => {
    setConfig({
      thank_you_title: form.theme_config?.thank_you_title || "All done!",
      thank_you_description: form.theme_config?.thank_you_description || "Thank you for completing this form.",
      thank_you_button_text: form.theme_config?.thank_you_button_text || "",
      thank_you_redirect_url: form.theme_config?.thank_you_redirect_url || "",
    });
  }, [form.theme_config]);

  const handleChange = (field: string, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newThemeConfig = { ...form.theme_config, ...config };
      await api.forms.update(form.id, { theme_config: newThemeConfig });
      onUpdate({ ...form, theme_config: newThemeConfig });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      console.error("[ThankYouSettings] Save failed:", e);
      alert("Failed to save thank you settings: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Thank You Screen</h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Customize what respondents see after they submit the form.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: "var(--text)" }}>
            Title
          </label>
          <input
            type="text"
            value={config.thank_you_title}
            onChange={(e) => handleChange("thank_you_title", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm"
            style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            placeholder="e.g. All done!"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: "var(--text)" }}>
            Description
          </label>
          <textarea
            value={config.thank_you_description}
            onChange={(e) => handleChange("thank_you_description", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm min-h-[100px] resize-none"
            style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            placeholder="e.g. Thank you for completing this form."
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: "var(--text)" }}>
            Button Text (Optional)
          </label>
          <input
            type="text"
            value={config.thank_you_button_text}
            onChange={(e) => handleChange("thank_you_button_text", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm"
            style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            placeholder="e.g. Continue to our website"
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--text-faint)" }}>
            If left blank and a redirect URL is provided, it will default to "Continue".
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" style={{ color: "var(--text)" }}>
            Redirect URL (Optional)
          </label>
          <input
            type="url"
            value={config.thank_you_redirect_url}
            onChange={(e) => handleChange("thank_you_redirect_url", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border outline-none font-medium text-sm"
            style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text)" }}
            placeholder="e.g. https://example.com"
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--text-faint)" }}>
            Where should the button link to? If empty, no button is shown.
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-full font-bold text-white text-sm transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: "#22c55e" }}>
            <Check size={16} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
