"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Blocks, PencilRuler, Settings, CircleHelp, Menu, X } from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

export function GlobalNavbar() {
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="h-14 border-b flex items-center justify-between px-6 shrink-0 bg-white dark:bg-[#192231] border-gray-200 dark:border-[#2b3544] text-gray-900 dark:text-gray-100">
      <div className="relative">
        <div
          onClick={() => setIsOrgOpen(!isOrgOpen)}
          className="flex items-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-1.5 -ml-1.5 rounded-lg transition-colors"
        >
          <div
            className="w-6 h-6 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <span className="text-white text-[10px] font-bold tracking-tight">TF</span>
          </div>
          <span className="font-semibold text-sm">itxpiyush2004</span>
          <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
        </div>

        {isOrgOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOrgOpen(false)} />
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#1E293B] border rounded-xl shadow-lg z-50 py-2" style={{ borderColor: "var(--border)" }}>
              <div className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Organization</div>
              {['Admin settings', 'Org members', 'Plan & billing', 'Developer apps'].map(item => (
                <button key={item} className="w-full text-left px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  {item}
                </button>
              ))}
              
              <div className="h-px mx-4 my-2 bg-gray-200 dark:bg-gray-700" />
              
              <div className="px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200">All organizations</div>
              <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <div 
                  className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  I
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-sm font-medium text-gray-800 truncate">itxpiyush2004</span>
                    <span className="text-[10px] font-medium border rounded-full px-2 py-0.5 text-gray-600" style={{ borderColor: "var(--border)" }}>Owner</span>
                  </div>
                  <span className="text-xs text-gray-500 truncate">Free Plan - 1 member</span>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link href="/integrations" className="flex items-center gap-2 text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <Blocks size={16} /> Integrations
        </Link>
        <button className="flex items-center gap-2 text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <PencilRuler size={16} /> Brand kit
        </button>
        <button 
          className="text-white px-3 py-1.5 rounded text-sm font-semibold transition-colors opacity-90 hover:opacity-100"
          style={{ backgroundColor: "var(--accent)" }}
        >
          View plans
        </button>
        <ThemeSwitcher />
        <button className="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <Settings size={18} />
        </button>
        <button className="text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <CircleHelp size={18} />
        </button>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#D92D20] bg-[#FFE1E1] dark:bg-[#D92D20] dark:text-white">
          PY
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="flex items-center gap-3 md:hidden">
        <ThemeSwitcher />
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#D92D20] bg-[#FFE1E1]">
          PY
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 border-b bg-white dark:bg-[#192231] z-40 shadow-lg md:hidden" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col p-4 gap-4">
            <Link href="/integrations" className="flex items-center gap-2 text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium">
              <Blocks size={16} /> Integrations
            </Link>
            <button className="flex items-center gap-2 text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium">
              <PencilRuler size={16} /> Brand kit
            </button>
            <button className="flex items-center gap-2 text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium">
              <Settings size={16} /> Settings
            </button>
            <button className="flex items-center gap-2 text-gray-700 hover:text-black dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium">
              <CircleHelp size={16} /> Help
            </button>
            <button 
              className="text-white px-3 py-2 rounded text-sm font-semibold transition-colors opacity-90 hover:opacity-100 w-full"
              style={{ backgroundColor: "var(--accent)" }}
            >
              View plans
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
