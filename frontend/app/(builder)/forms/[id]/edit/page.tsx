"use client";

import { useEffect, useState, use, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { Form } from "@/lib/types";
import { useToast } from "@/components/ui/ToastProvider";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { QuestionList } from "@/components/builder/QuestionList";
import { QuestionEditor } from "@/components/builder/QuestionEditor";
import { LivePreview } from "@/components/builder/LivePreview";
import { ThankYouSettings } from "@/components/builder/ThankYouSettings";
import { WorkflowCanvas } from "@/components/builder/WorkflowCanvas";
import { DesignToolbar } from "@/components/builder/DesignToolbar";
import { Eye, Copy, X, ArrowLeft, BarChart3, Check, Edit2, CircleHelp, ChevronDown, Blocks, PencilRuler, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GlobalNavbar } from "@/components/ui/GlobalNavbar";

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "Content");
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<"list" | "preview" | "editor">("preview");
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [publishAnimationState, setPublishAnimationState] = useState<"idle" | "arrow" | "live" | "done">("idle");

  const [titleEditing, setTitleEditing] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [titleSaving, setTitleSaving] = useState(false);
  const [titleSaved, setTitleSaved] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [leftWidth, setLeftWidth] = useState(288); // 288px default
  const [rightWidth, setRightWidth] = useState(320); // 320px default

  const startResizeLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = leftWidth;
    const onMouseMove = (moveEvent: MouseEvent) => {
      setLeftWidth(Math.max(200, Math.min(500, startWidth + (moveEvent.pageX - startX))));
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const startResizeRight = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = rightWidth;
    const onMouseMove = (moveEvent: MouseEvent) => {
      setRightWidth(Math.max(250, Math.min(600, startWidth - (moveEvent.pageX - startX))));
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const { toast } = useToast();

  const fetchForm = async () => {
    try {
      const data = await api.forms.get(id);
      setForm(data);
      if (data.questions.length > 0 && !selectedQuestionId) {
        setSelectedQuestionId(data.questions[0].id);
      }
    } catch (e: any) {
      console.error("[BuilderPage] Failed to load form:", e);
      toast("Error loading form", e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForm(); }, [id]);

  useEffect(() => {
    if (form) setTitleValue(form.title);
  }, [form]);

  useEffect(() => {
    if (titleEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [titleEditing]);

  const handleTitleSave = async () => {
    if (!form || titleValue.trim() === form.title) {
      setTitleEditing(false);
      setTitleValue(form?.title || "");
      return;
    }

    if (!titleValue.trim()) {
      setTitleValue(form.title);
      setTitleEditing(false);
      return;
    }

    setTitleSaving(true);
    try {
      await api.forms.update(form.id, { title: titleValue.trim() });
      setForm({ ...form, title: titleValue.trim() });
      setTitleSaved(true);
      setTimeout(() => setTitleSaved(false), 2000);
    } catch (e: any) {
      console.error("[BuilderPage] Title update failed:", e);
      toast("Error updating title", e.message, "error");
      setTitleValue(form.title);
    } finally {
      setTitleSaving(false);
      setTitleEditing(false);
    }
  };

  const handlePublish = async () => {
    if (!form) return;
    setPublishLoading(true);
    try {
      const res = await api.forms.publish(form.id);
      setForm({ ...form, status: res.status as any });
      if (res.status === "published") {
        setPublishAnimationState("arrow");
        setTimeout(() => setPublishAnimationState("live"), 1200);
        setTimeout(() => {
          setPublishAnimationState("done");
          setPublishUrl(res.url);
        }, 3000);
      } else {
        toast("Form unpublished", "Back in draft mode.", "info");
      }
    } catch (e: any) {
      console.error("[BuilderPage] Publish failed:", e);
      toast("Publish failed", e.message, "error");
    } finally {
      setPublishLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading form…</p>
      </div>
    );
  }

  if (!form) {
    return <div className="p-8" style={{ color: "var(--text-muted)" }}>Form not found.</div>;
  }

  const tabs = ["Content", "Thank You", "Workflow", "Connect", "Share", "Results"];
  const comingSoon = ["Connect"];

  return (
    <div className="h-full flex flex-col">
      {/* Global Top Navbar */}
      <GlobalNavbar />


      {/* Builder Top Bar */}
      <div
        className="h-14 border-b flex items-center justify-between px-6 shrink-0 shadow-sm z-10 bg-white dark:bg-[#192231] border-gray-200 dark:border-[#2b3544] text-gray-900 dark:text-gray-100"
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <Link
            href="/forms"
            className="flex items-center gap-2 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors text-sm font-medium"
          >
            <FileText size={16} /> Forms
          </Link>
          <span className="text-gray-400 dark:text-gray-500 text-sm px-1">&gt;</span>
          <div className="h-5 w-px" style={{ backgroundColor: "var(--border)" }} />

          <div className="hidden md:flex items-center gap-3 ml-1">
            {titleEditing ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSave();
                  if (e.key === "Escape") {
                    setTitleEditing(false);
                    setTitleValue(form.title);
                  }
                }}
                className="bg-transparent border-b-2 outline-none font-semibold text-sm px-1 py-0.5 w-[200px]"
                style={{ borderColor: "var(--accent)", color: "var(--text)" }}
                aria-label="Edit Form Title"
              />
            ) : (
              <div
                onClick={() => setTitleEditing(true)}
                className="group flex items-center gap-2 px-2 py-1 -ml-2 rounded-md cursor-pointer transition-colors"
                style={{ color: "inherit" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(100,100,100,0.1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                title="Click to edit form title"
              >
                <span className="font-semibold truncate max-w-[200px] text-sm">
                  {form.title}
                </span>
                <Edit2 size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }} />
              </div>
            )}

            {/* Saved / Saving indicator */}
            <div className="text-xs font-semibold flex items-center min-w-[70px]">
              {titleSaving && (
                <span style={{ color: "var(--text-faint)" }} className="animate-pulse">Saving…</span>
              )}
              {titleSaved && (
                <span style={{ color: "#22c55e" }} className="flex items-center gap-1">
                  <Check size={13} /> Saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center tabs */}
        <div
          className="flex gap-0.5 p-1 rounded-xl border border-gray-200 dark:border-[#2b3544] bg-gray-50 dark:bg-[#1E293B] overflow-x-auto hide-scrollbar max-w-[50vw] md:max-w-none"
        >
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => {
                if (t === "Results") {
                  router.push(`/forms/${id}/responses`);
                } else {
                  setActiveTab(t);
                }
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all relative ${activeTab === t ? 'bg-white dark:bg-[#2A3441] text-[#FF3D57] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              {t}
              {comingSoon.includes(t) && (
                <span className="absolute -top-1.5 -right-1 text-[9px] bg-orange-400 text-white px-1 py-0.5 rounded-full font-bold leading-none">
                  soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4">
          {form.status === "published" && (
            <>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + "/f/" + form.id);
                  toast("Copied!", "Link copied to clipboard", "success");
                }}
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 text-sm font-medium rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(100,100,100,0.1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                title="Copy Link"
              >
                <Copy size={15} /> <span className="hidden lg:inline">Copy Link</span>
              </button>
              <a
                href={`/f/${form.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 text-sm font-medium rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(100,100,100,0.1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
              >
                <Eye size={15} /> <span className="hidden lg:inline">Preview</span>
              </a>
            </>
          )}
          <button
            onClick={handlePublish}
            disabled={publishLoading}
            className={`px-3 md:px-5 py-1.5 rounded-full font-semibold text-sm transition-all shadow-sm disabled:opacity-70 whitespace-nowrap ${form.status === "published" ? "border-2 border-gray-200 dark:border-[#2b3544] text-gray-900 dark:text-gray-100 bg-white dark:bg-transparent" : "bg-[#FF3D57] text-white"}`}
          >
            {publishLoading ? "…" : form.status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "Content" ? (
          <div className="flex flex-col md:flex-row h-full relative">
            <style>{`
              @media (max-width: 767px) {
                .responsive-panel { width: 100% !important; flex: 1 !important; border: none !important; }
              }
            `}</style>

            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex border-b shrink-0 p-2 gap-2 overflow-x-auto" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              {(["list", "preview", "editor"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setMobileTab(tab)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-colors"
                  style={mobileTab === tab ? { backgroundColor: "var(--accent)", color: "#fff" } : { backgroundColor: "transparent", color: "var(--text-muted)" }}
                >
                  {tab === "list" ? "Questions" : tab}
                </button>
              ))}
            </div>

            {/* Question list */}
            <div
              className={`flex-col shrink-0 ${mobileTab === "list" ? "flex" : "hidden md:flex"} md:border-r relative responsive-panel z-10 w-full md:w-auto`}
              style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : leftWidth, backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <QuestionList
                form={form}
                selectedId={selectedQuestionId}
                onSelect={setSelectedQuestionId}
                onUpdate={setForm}
              />
              <div
                className="hidden md:block absolute top-0 right-0 w-2 h-full cursor-col-resize z-10 opacity-0 hover:opacity-100 bg-blue-500/20"
                style={{ transform: "translateX(50%)" }}
                onMouseDown={startResizeLeft}
              />
            </div>

            {/* Live preview */}
            <div
              className={`flex-1 flex-col items-center overflow-hidden ${mobileTab === "preview" ? "flex" : "hidden md:flex"} responsive-panel`}
              style={{ backgroundColor: "var(--bg)" }}
            >
              <DesignToolbar
                form={form}
                onUpdate={setForm}
                isMobilePreview={isMobilePreview}
                onMobileToggle={() => setIsMobilePreview(!isMobilePreview)}
                onPlayPreview={() => setIsFullScreenPreview(true)}
              />

              <div className="w-full flex-1 flex flex-col items-center justify-center overflow-y-auto p-4 md:p-8 bg-black/5 dark:bg-black/20">
                <div
                  className={`transition-all duration-300 shadow-sm overflow-hidden flex-shrink-0 relative ${isMobilePreview ? 'w-[375px] h-[812px] rounded-[48px] border-[12px] border-black shadow-2xl dark:border-black' : 'w-full max-w-3xl min-h-[500px] rounded-2xl border'}`}
                  style={!isMobilePreview ? {
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  } : { backgroundColor: "var(--card)" }}
                >
                  {isMobilePreview && (
                    <div className="absolute top-0 inset-x-0 h-6 bg-black z-20 rounded-b-3xl w-40 mx-auto" />
                  )}
                  <LivePreview
                    question={form.questions.find((q) => q.id === selectedQuestionId)}
                    themeConfig={form.theme_config}
                  />
                </div>
              </div>
            </div>

            {/* Editor */}
            <div
              className={`flex-col overflow-y-auto shrink-0 ${mobileTab === "editor" ? "flex" : "hidden md:flex"} md:border-l relative responsive-panel w-full md:w-auto z-10`}
              style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : rightWidth, backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div
                className="hidden md:block absolute top-0 left-0 w-2 h-full cursor-col-resize z-10 opacity-0 hover:opacity-100 bg-blue-500/20"
                style={{ transform: "translateX(-50%)" }}
                onMouseDown={startResizeRight}
              />
              <QuestionEditor
                question={form.questions.find((q) => q.id === selectedQuestionId)}
                onUpdate={(q) =>
                  setForm({ ...form, questions: form.questions.map((old) => (old.id === q.id ? q : old)) })
                }
              />
            </div>
          </div>
        ) : activeTab === "Thank You" ? (
          <div className="h-full" style={{ backgroundColor: "var(--bg)" }}>
            <ThankYouSettings form={form} onUpdate={setForm} />
          </div>
        ) : activeTab === "Workflow" ? (
          <div className="h-full w-full">
            <WorkflowCanvas form={form} onUpdate={setForm} />
          </div>
        ) : activeTab === "Share" ? (
          <div className="h-full overflow-y-auto" style={{ backgroundColor: "var(--bg)" }}>
            <div className="max-w-4xl mx-auto py-12 px-8 flex flex-col items-center">
              <h2 className="text-2xl font-normal mb-8 text-gray-900 dark:text-gray-100">Choose how you'd like to share your form</h2>

              <div className="w-full bg-white dark:bg-[#1E293B] border rounded-2xl p-6 mb-8 shadow-sm" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 flex items-center bg-gray-50 dark:bg-black/20 border rounded-lg overflow-hidden" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + "/f/" + form.id);
                        toast("Copied!", "Link copied to clipboard", "success");
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Copy size={14} /> Copy link
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={window.location.origin + "/f/" + form.id}
                      className="flex-1 bg-transparent px-3 text-sm text-gray-700 dark:text-gray-300 outline-none"
                    />
                    <div className="px-4 flex items-center gap-3 border-l" style={{ borderColor: "var(--border)" }}>
                      <button className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1.5"><Edit2 size={13} /> Edit</button>
                      <button className="text-gray-500 hover:text-gray-700"><Eye size={16} /></button>
                    </div>
                  </div>
                </div>

                <div className="border border-dashed rounded-xl p-6 relative" style={{ borderColor: "var(--border)" }}>
                  <div className="absolute top-4 right-4 flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Customize</span>
                    <button className="text-teal-700 hover:bg-teal-50 p-1 rounded"><Eye size={16} /></button>
                  </div>
                  <div className="text-xs text-gray-400 mb-2 font-medium">Link preview</div>
                  <div className="flex gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-black/10" style={{ borderColor: "var(--border)" }}>
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center shrink-0">
                      <span className="font-bold text-gray-400">TF</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{form.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{form.description || "Turn data collection into an experience with Typeform."}</div>
                      <div className="text-xs text-gray-400 mt-2 text-blue-500 hover:underline cursor-pointer">form.typeform.com</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full mb-4 font-semibold text-sm text-gray-800 dark:text-gray-200">Embed form</div>
              <div className="w-full grid grid-cols-2 gap-6 mb-8">
                <button className="flex border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-[#1E293B] text-left group" style={{ borderColor: "var(--border)" }}>
                  <div className="w-[120px] h-[80px] bg-purple-100 shrink-0 flex items-center justify-center p-2">
                    <div className="w-full h-full bg-white rounded shadow-sm flex items-center justify-center border-t-[8px] border-purple-400">
                      <div className="w-8 h-6 bg-gray-100 rounded-sm"></div>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-center">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600">On your website</span>
                  </div>
                </button>
                <button className="flex border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-[#1E293B] text-left group" style={{ borderColor: "var(--border)" }}>
                  <div className="w-[120px] h-[80px] bg-blue-50 shrink-0 flex items-center justify-center p-2">
                    <div className="w-full h-full bg-white rounded shadow-sm border p-1 flex flex-col gap-1">
                      <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
                      <div className="w-full h-6 bg-blue-100 rounded-sm mt-1"></div>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-center">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600">In your email</span>
                  </div>
                </button>
              </div>

              <button className="px-6 py-2 border rounded-full text-sm font-medium hover:bg-black/5 text-gray-700 dark:text-gray-300" style={{ borderColor: "var(--border)" }}>
                Explore other ways to share
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 h-full" style={{ backgroundColor: "var(--bg)" }}>
            <div
              className="max-w-4xl mx-auto h-full rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <ComingSoon feature={activeTab} />
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Publish Animation */}
      <AnimatePresence>
        {(publishAnimationState === "arrow" || publishAnimationState === "live") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900 overflow-hidden"
          >
            {publishAnimationState === "arrow" && (
              <motion.div
                key="arrow"
                initial={{ x: "-100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100vw", opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <ArrowRight className="w-24 h-24 md:w-32 md:h-32 text-white drop-shadow-2xl" />
              </motion.div>
            )}
            {publishAnimationState === "live" && (
              <motion.div
                key="live"
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex flex-col items-center gap-4 md:gap-6 px-4"
              >
                <span className="text-7xl md:text-9xl animate-bounce">🚀</span>
                <h1 
                  className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-2xl text-center"
                  style={{ color: "#FF3D57" }}
                >
                  It's Live!
                </h1>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Modal */}
      {publishUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="p-8 rounded-2xl shadow-2xl max-w-lg w-full border relative"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <button
              onClick={() => setPublishUrl(null)}
              className="absolute top-5 right-5 p-2 rounded-full transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
            >
              <X size={18} />
            </button>
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Form Published!</h3>
            <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
              Share this link to start collecting responses.
            </p>
            <div
              className="flex items-center gap-2 p-3 rounded-xl border-2"
              style={{ borderColor: "rgba(255,61,87,0.3)", backgroundColor: "rgba(255,61,87,0.04)" }}
            >
              <input
                type="text"
                readOnly
                value={publishUrl}
                className="flex-1 bg-transparent outline-none font-medium px-2 text-sm"
                style={{ color: "var(--accent)" }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publishUrl);
                  toast("Copied!", "Link copied to clipboard", "success");
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold text-sm"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <Copy size={15} /> Copy Link
              </button>
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href={publishUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                <Eye size={15} /> Open Form
              </a>
              <button
                onClick={() => setPublishUrl(null)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Full Screen Preview Modal */}
      {isFullScreenPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12">
          <button
            onClick={() => setIsFullScreenPreview(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X size={24} />
          </button>
          <div className={`w-full h-full ${isMobilePreview ? 'max-w-[375px] max-h-[812px]' : 'max-w-5xl max-h-[800px]'} rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 bg-white relative`}>
            <LivePreview
              question={form.questions.find((q) => q.id === selectedQuestionId)}
              themeConfig={form.theme_config}
            />
          </div>
        </div>
      )}
    </div>
  );
}
