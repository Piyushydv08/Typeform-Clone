"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Settings2, Sun, Moon, Monitor } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const options = [
    { id: "light" as const, icon: Sun, label: "Light" },
    { id: "system" as const, icon: Monitor, label: "System" },
    { id: "dark" as const, icon: Moon, label: "Dark" },
  ];

  return (
    <div 
      className="flex items-center p-1 rounded-full border shadow-sm"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {options.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          aria-label={`Switch to ${label} theme`}
          title={label}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors focus:ring-2 focus:outline-none"
          style={{
            backgroundColor: theme === id ? "var(--accent)" : "transparent",
            color: theme === id ? "#fff" : "var(--text-muted)",
          }}
          onMouseEnter={(e) => {
            if (theme !== id) {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,61,87,0.05)";
              (e.currentTarget as HTMLElement).style.color = "var(--accent)";
            }
          }}
          onMouseLeave={(e) => {
            if (theme !== id) {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }
          }}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
