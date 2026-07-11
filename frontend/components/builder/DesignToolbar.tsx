"use client";

import { useState, useRef } from "react";
import { Form } from "@/lib/types";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import { Plus, Palette, Smartphone, Play, Accessibility, Undo2, Languages, Settings } from "lucide-react";

const PRESET_THEMES = [
  { id: "plain_blue", name: "Plain Blue", bg: "#F0F4F8", text: "#102A43", button: "#627D98", buttonText: "#FFFFFF" },
  { id: "classic_blue", name: "Classic Blue", bg: "#E1E8ED", text: "#15202B", button: "#1DA1F2", buttonText: "#FFFFFF" },
  { id: "pearl_white", name: "Pearl White", bg: "#FFFFFF", text: "#111827", button: "#374151", buttonText: "#FFFFFF" },
  { id: "inky_black", name: "Inky Black", bg: "#1F2937", text: "#F9FAFB", button: "#F3F4F6", buttonText: "#1F2937" },
  { id: "plain_dark", name: "Plain Dark", bg: "#111827", text: "#E5E7EB", button: "#374151", buttonText: "#FFFFFF" },
  { id: "coral", name: "Coral", bg: "#FFEFEA", text: "#4A154B", button: "#E01E5A", buttonText: "#FFFFFF" },
];

export function DesignToolbar({ form, onUpdate, isMobilePreview, onMobileToggle, onPlayPreview }: { form: Form; onUpdate: (f: Form) => void; isMobilePreview?: boolean; onMobileToggle?: () => void; onPlayPreview?: () => void; }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [tab, setTab] = useState<"gallery" | "my_themes">("gallery");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyTheme = async (theme: any) => {
    const newThemeConfig = {
      backgroundColor: theme.bg,
      textColor: theme.text,
      buttonColor: theme.button,
      buttonTextColor: theme.buttonText,
      backgroundImage: "",
    };
    onUpdate({
      ...form,
      theme_config: newThemeConfig
    });
    try {
      await api.forms.update(form.id, { theme_config: newThemeConfig });
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const newThemeConfig = {
          ...form.theme_config,
          backgroundImage: base64,
        };
        onUpdate({
          ...form,
          theme_config: newThemeConfig
        });
        try {
          await api.forms.update(form.id, { theme_config: newThemeConfig });
        } catch (e) {
          console.error("Failed to save background image", e);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = async () => {
    const newThemeConfig = { ...form.theme_config, backgroundImage: "" };
    onUpdate({ ...form, theme_config: newThemeConfig });
    try {
      await api.forms.update(form.id, { theme_config: newThemeConfig });
    } catch (e) {
      console.error("Failed to remove background image", e);
    }
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-[#1E293B]" style={{ borderColor: "var(--border)" }}>
      {/* Left items */}
      <div className="flex items-center gap-2 md:gap-4 relative pr-2">
        <button 
          onClick={() => toast("Use the Content Panel", "Click on the left sidebar to add new questions.", "info")}
          className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg font-medium text-xs md:text-sm transition-opacity hover:opacity-90 shrink-0 cursor-pointer" 
          style={{ backgroundColor: "var(--text)", color: "var(--bg)" }}
        >
          <Plus size={16} /> <span className="hidden sm:inline">Add content</span>
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        <button 
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors shrink-0 ${open ? "bg-black/5" : "hover:bg-black/5"}`}
          style={{ color: "var(--text)" }}
        >
          <Palette size={16} /> <span className="hidden sm:inline">Design</span>
        </button>

        {/* Design Popover */}
        {open && (
          <div className="absolute top-full left-0 mt-2 w-[calc(100vw-32px)] max-w-[400px] bg-white dark:bg-[#1E293B] border rounded-xl shadow-xl z-50 overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 font-semibold">
                <Palette size={16} /> Design
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Settings size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-6 px-4 pt-2 border-b" style={{ borderColor: "var(--border)" }}>
              <button 
                onClick={() => setTab("my_themes")}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === "my_themes" ? "border-black dark:border-white text-black dark:text-white" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                My themes
              </button>
              <button 
                onClick={() => setTab("gallery")}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === "gallery" ? "border-black dark:border-white text-black dark:text-white" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                Gallery
              </button>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto">
              {tab === "gallery" && (
                <div className="grid grid-cols-2 gap-4">
                  {PRESET_THEMES.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => applyTheme(t)}
                      className="border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group"
                      style={{ borderColor: "var(--border)", backgroundColor: t.bg }}
                    >
                      <div className="font-semibold text-sm mb-1" style={{ color: t.text }}>Question</div>
                      <div className="text-xs mb-3 opacity-80" style={{ color: t.text }}>Answer</div>
                      <div className="w-10 h-4 rounded" style={{ backgroundColor: t.button }} />
                      <div className="mt-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: t.text }}>
                        {t.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "my_themes" && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">Upload a custom background image for your form.</div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-gray-500 hover:bg-black/5 hover:text-gray-700 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Plus size={20} />
                    <span className="text-sm font-medium">Upload Image</span>
                  </button>
                  
                  {form.theme_config?.backgroundImage && (
                    <div className="mt-4 border rounded-xl p-2 relative" style={{ borderColor: "var(--border)" }}>
                      <img src={form.theme_config.backgroundImage} alt="Background" className="w-full h-32 object-cover rounded-lg" />
                      <button 
                        onClick={removeBackgroundImage}
                        className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold shadow hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right items */}
      <div className="flex items-center gap-1.5 md:gap-3 text-gray-500 shrink-0">
        <button type="button" onClick={(e) => { e.preventDefault(); onMobileToggle?.(); }} className={`p-1.5 rounded-md transition-colors ${isMobilePreview ? 'bg-black/10 text-black dark:text-white dark:bg-white/20' : 'hover:bg-black/5'}`} title="Mobile Preview"><Smartphone size={16} className="md:w-[18px] md:h-[18px]" /></button>
        <button type="button" onClick={(e) => { e.preventDefault(); onPlayPreview?.(); }} className="p-1.5 hover:bg-black/5 rounded-md transition-colors" title="Play Preview"><Play size={16} className="md:w-[18px] md:h-[18px]" /></button>
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-0.5 md:mx-1" />
        <button className="hidden sm:block p-1.5 hover:bg-black/5 rounded-md transition-colors"><Accessibility size={16} className="md:w-[18px] md:h-[18px]" /></button>
        <button className="hidden sm:block p-1.5 hover:bg-black/5 rounded-md transition-colors"><Undo2 size={16} className="md:w-[18px] md:h-[18px]" /></button>
        <button className="hidden sm:block p-1.5 hover:bg-black/5 rounded-md transition-colors"><Languages size={16} className="md:w-[18px] md:h-[18px]" /></button>
        <button className="p-1.5 hover:bg-black/5 rounded-md transition-colors"><Settings size={16} className="md:w-[18px] md:h-[18px]" /></button>
      </div>
    </div>
  );
}
