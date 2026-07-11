"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Form } from "@/lib/types";
import { useToast } from "@/components/ui/ToastProvider";
import { Plus, MoreVertical, Copy, Trash2, Globe, BoxSelect, AlertCircle, Edit2, Link as LinkIcon, Search, LayoutGrid, List as ListIcon, UserPlus, Diamond, Check, Calendar, ChevronUp, Grid2x2, Users, Bot, FlaskConical, Settings2, FileText, Lock, ArrowRight, ArrowDownAZ, ChevronDown, Blocks } from "lucide-react";
import { GlobalNavbar } from "@/components/ui/GlobalNavbar";

export default function Dashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals / State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Form | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [activeTab, setActiveTab] = useState("Forms");
  const [isPrivateOpen, setIsPrivateOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const fetchForms = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.forms.list();
      setForms(data);
    } catch (e: any) {
      console.error("[Dashboard] Failed to load forms:", e);
      setError(e.message || "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForms(); }, []);

  const handleCreate = async () => {
    try {
      const newForm = await api.forms.create({ title: "New form" });
      router.push(`/forms/${newForm.id}/edit`);
    } catch (e: any) {
      toast("Error creating form", e.message, "error");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.forms.duplicate(id);
      toast("Form duplicated", "", "success");
      fetchForms();
    } catch (e: any) {
      toast("Error duplicating", e.message, "error");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await api.forms.publish(id);
      toast(res.status === "published" ? "Form published!" : "Form unpublished", "", "success");
      fetchForms();
    } catch (e: any) {
      toast("Error", e.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.forms.delete(deleteId);
      toast("Form deleted", "", "success");
      setDeleteId(null);
      fetchForms();
    } catch (e: any) {
      toast("Error deleting form", e.message, "error");
    }
  };

  const handleSaveInfo = async () => {
    if (!editForm) return;
    try {
      await api.forms.update(editForm.id, { title: editTitle, description: editDescription });
      toast("Form updated", "", "success");
      setEditForm(null);
      fetchForms();
    } catch (e: any) {
      toast("Error", e.message, "error");
    }
  };

  const totalResponses = forms.reduce((sum, f) => sum + (f.response_count || 0), 0);

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      {/* Top Navbar */}
      <GlobalNavbar />

      {/* Tabs Row */}
      <div className="flex items-center gap-8 px-4 md:px-6 border-b shrink-0 bg-[#fbfbfb] dark:bg-transparent overflow-x-auto hide-scrollbar" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-0.5 p-1 rounded-xl border border-gray-200 dark:border-[#2b3544] bg-gray-50 dark:bg-[#1E293B] my-3 min-w-max">
          {[
            { id: "Forms", icon: FileText },
            { id: "Contacts", icon: Users },
            { id: "Automations", icon: Settings2 },
            { id: "Research Flow", icon: FlaskConical, demo: true }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all relative ${activeTab === tab.id
                ? 'bg-white dark:bg-[#2A3441] text-[#FF3D57] shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              <tab.icon size={16} /> {tab.id}
              {tab.demo && (
                <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-blue-600 bg-blue-50 border border-blue-200 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-400 leading-none">Demo</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {activeTab !== "Research Flow" && (
          <aside className="hidden md:flex w-[260px] border-r flex-col shrink-0" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
            <div className="p-4 flex-1 overflow-y-auto">
              {activeTab === "Forms" ? (
                <>
                  <button
                    onClick={handleCreate}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold text-sm mb-6 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#2b2a35", color: "#fff" }}
                  >
                    <Plus size={16} /> Create form
                  </button>

                  <div className="relative mb-6">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full pl-9 pr-3 py-1.5 rounded-md text-sm outline-none border transition-colors focus:border-gray-400"
                      style={{ backgroundColor: "transparent", borderColor: "var(--border)", color: "var(--text)" }}
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Grid2x2 size={16} className="text-gray-400" /> Workspaces
                    </span>
                    <button className="w-5 h-5 flex items-center justify-center rounded border" style={{ borderColor: "var(--border)" }}>
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setIsPrivateOpen(!isPrivateOpen)}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded"
                    >
                      Private {isPrivateOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {isPrivateOpen && (
                      <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded" style={{ backgroundColor: "var(--border)", color: "var(--text)" }}>
                        My workspace <span className="text-xs text-gray-500">{forms.length}</span>
                      </button>
                    )}
                  </div>
                </>
              ) : activeTab === "Contacts" ? (
                <>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold text-sm mb-6 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#2b2a35", color: "#fff" }}
                  >
                    <UserPlus size={16} /> Add contact
                  </button>

                  <div className="mb-6">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 mb-2 inline-block">Early access</span>
                    <div className="flex items-center justify-between px-2 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-black/5 rounded cursor-pointer">
                      <span className="flex items-center gap-2"><Users size={16} /> Contact lists</span>
                      <Plus size={14} />
                    </div>
                    <div className="flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded mt-1 bg-black/5 dark:bg-white/5" style={{ color: "var(--text)" }}>
                      All contacts <span className="text-xs text-gray-500">0</span>
                    </div>
                  </div>
                </>
              ) : activeTab === "Automations" ? (
                <>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold text-sm mb-6 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#2b2a35", color: "#fff" }}
                  >
                    <Plus size={16} /> Create automation
                  </button>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded cursor-pointer transition-colors">
                      <span>Form submissions</span>
                      <span className="text-xs">{totalResponses}</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded cursor-pointer transition-colors">
                      <span>Contact activity/updates</span>
                      <span className="text-xs">0</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-400 dark:text-gray-500 rounded cursor-not-allowed">
                      <span className="truncate pr-2">Specific dat...</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-blue-600 bg-blue-50 border border-blue-200 shrink-0">Coming soon</span>
                    </div>
                  </div>
                </>
              ) : activeTab === "Automations" ? (
                <>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold text-sm mb-6 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#2b2a35", color: "#fff" }}
                  >
                    <Plus size={16} /> Create automation
                  </button>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded cursor-pointer transition-colors">
                      <span>Form submissions</span>
                      <span className="text-xs">{totalResponses}</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded cursor-pointer transition-colors">
                      <span>Contact activity/updates</span>
                      <span className="text-xs">0</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-400 dark:text-gray-500 rounded cursor-not-allowed">
                      <span className="truncate pr-2">Specific dat...</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-blue-600 bg-blue-50 border border-blue-200 shrink-0">Coming soon</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-400 p-2">Coming soon...</div>
              )}
            </div>

            <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
              {activeTab === "Forms" && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-500 mb-2">Responses collected</div>
                  <div className="w-full h-1 bg-gray-200 rounded-full mb-1 overflow-hidden">
                    <div className="h-full bg-black w-0" />
                  </div>
                  <div className="text-xs font-semibold mb-3">0 / 10</div>
                  <button className="text-xs font-medium px-3 py-1.5 rounded border hover:bg-black/5" style={{ borderColor: "var(--border)" }}>
                    Increase response limit
                  </button>
                </div>
              )}

              {activeTab === "Contacts" && (
                <div className="mb-4 space-y-2">
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black w-full text-left px-2 py-1">
                    <Lock size={14} /> Contact permissions
                  </button>
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black w-full text-left px-2 py-1">
                    <Settings2 size={14} /> Contact settings
                  </button>
                </div>
              )}

              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border shadow-sm group hover:border-purple-300 transition-colors" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 group-hover:text-purple-600">
                  <Bot size={16} /> Ask Typeform AI
                </div>
                <div className="w-5 h-5 rounded border flex items-center justify-center">
                  <ArrowRight size={12} className="text-gray-400" />
                </div>
              </button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#fafafa] dark:bg-transparent">
          {activeTab === "Forms" ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-4">
                    <h1 className="text-xl md:text-2xl font-light" style={{ color: "var(--text)" }}>My workspace</h1>
                    <div className="relative">
                      <MoreVertical size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setWorkspaceMenuOpen(!workspaceMenuOpen); }} />
                      {workspaceMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setWorkspaceMenuOpen(false)} />
                          <div className="absolute left-0 top-full mt-2 w-[160px] rounded-xl shadow-xl z-20 py-1.5 border bg-white dark:bg-[#1E293B]" style={{ borderColor: "var(--border)" }}>
                            <button onClick={() => setWorkspaceMenuOpen(false)} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Rename</button>
                            <button onClick={() => setWorkspaceMenuOpen(false)} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Leave</button>
                            <button onClick={() => setWorkspaceMenuOpen(false)} className="w-full text-left px-4 py-2 text-[13px] hover:bg-red-50 text-red-600">Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                    <button className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 ml-4">
                      <UserPlus size={16} /> Invite
                    </button>
                    <button
                      onClick={handleCreate}
                      className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold text-sm transition-opacity hover:opacity-90 ml-auto"
                      style={{ backgroundColor: "#2b2a35", color: "#fff" }}
                    >
                      <Plus size={14} /> Create form
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium hover:bg-black/5" style={{ borderColor: "var(--border)" }}>
                        <Calendar size={14} /> Date created <ChevronDown size={14} />
                      </button>
                      {sortOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                          <div className="absolute left-0 top-full mt-1 w-48 rounded-xl shadow-xl z-20 py-1.5 border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                            <button onClick={() => setSortOpen(false)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-black/5 text-gray-700 dark:text-gray-300"><Calendar size={14} /> Date created</button>
                            <button onClick={() => setSortOpen(false)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-black/5 text-gray-700 dark:text-gray-300"><Edit2 size={14} /> Last updated</button>
                            <button onClick={() => setSortOpen(false)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-black/5 text-gray-700 dark:text-gray-300"><ArrowDownAZ size={14} /> Alphabetical</button>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center rounded-md border p-0.5" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded ${viewMode === "list" ? "bg-black/5 dark:bg-white/10" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        <ListIcon size={14} /> List
                      </button>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded ${viewMode === "grid" ? "bg-black/5 dark:bg-white/10" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        <LayoutGrid size={14} /> Grid
                      </button>
                    </div>
                  </div>
                </div>

                {/* Forms Content */}
                {loading ? (
                  <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-t-transparent border-gray-400 rounded-full animate-spin" /></div>
                ) : forms.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 text-sm">No forms in this workspace.</div>
                ) : viewMode === "list" ? (
                  <div className="w-full">
                    {/* List Header */}
                    <div className="hidden md:grid grid-cols-[1fr_100px_100px_150px_100px_40px] gap-4 px-4 py-2 text-xs font-medium text-gray-500 mb-2">
                      <div></div>
                      <div className="text-right">Responses</div>
                      <div className="text-right">Completed</div>
                      <div className="text-right">Updated</div>
                      <div className="text-center">Integrations</div>
                      <div></div>
                    </div>
                    {/* List Items */}
                    <div className="flex flex-col gap-2">
                      {forms.map(form => (
                        <FormListItem
                          key={form.id}
                          form={form}
                          onDuplicate={() => handleDuplicate(form.id)}
                          onPublish={() => handlePublish(form.id)}
                          onDelete={() => setDeleteId(form.id)}
                          onRename={() => { setEditForm(form); setEditTitle(form.title); setEditDescription(form.description || ""); }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {forms.map(form => (
                      <FormGridCard
                        key={form.id}
                        form={form}
                        onDuplicate={() => handleDuplicate(form.id)}
                        onPublish={() => handlePublish(form.id)}
                        onDelete={() => setDeleteId(form.id)}
                        onRename={() => { setEditForm(form); setEditTitle(form.title); setEditDescription(form.description || ""); }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "Contacts" ? (
            <div className="flex-1 flex flex-col p-8">
              <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                <h1 className="text-2xl font-light" style={{ color: "var(--text)" }}>All contacts</h1>
                <button className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md" style={{ backgroundColor: "var(--card)", color: "var(--text)", border: "1px solid var(--border)" }}>
                  <Users size={14} /> Public
                </button>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search contacts" className="pl-9 pr-3 py-1.5 rounded-md border text-sm outline-none" style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }} />
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium hover:bg-black/5" style={{ borderColor: "var(--border)" }}>
                    <ListIcon size={14} /> Filter
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded hover:bg-black/5"><ChevronUp size={16} /></button>
                  <button className="px-4 py-1.5 rounded-md bg-[#2b2a35] text-white text-sm font-semibold flex items-center gap-2">
                    Actions <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center">
                <h2 className="text-2xl font-light mb-4" style={{ color: "var(--text)" }}>Ready to build your contact list?</h2>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                  Create contacts automatically from forms with email questions.
                </p>
                <div className="text-sm text-left space-y-2 mb-10" style={{ color: "var(--text-muted)" }}>
                  <p>1. <span className="underline">Add an email question</span> to a form</p>
                  <p>2. Publish your form</p>
                  <p>3. Click "Auto-add from forms" below</p>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <button className="px-4 py-2 rounded-md font-semibold text-sm border cursor-not-allowed flex items-center gap-2 bg-black/5 dark:bg-white/5 text-gray-400 dark:text-gray-500" style={{ borderColor: "var(--border)" }}>
                    <Plus size={14} /> Auto-add from forms
                  </button>
                  <button className="px-4 py-2 rounded-md font-semibold text-sm border hover:bg-black/5" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                    Import contacts
                  </button>
                </div>
                <p className="text-sm text-gray-500">Or, <span className="underline cursor-pointer hover:text-black">add individually</span>.</p>
              </div>
            </div>
          ) : activeTab === "Automations" ? (
            <div className="flex-1 flex items-center justify-center p-8 bg-[#fafafa] dark:bg-transparent overflow-y-auto">
              <div className="max-w-[800px] w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col items-start text-left">
                  <h2 className="text-[28px] font-light mb-4" style={{ color: "var(--text)" }}>Keep the conversation going</h2>
                  <p className="text-[15px] leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
                    Follow up with emails, text messages, and more actions when someone completes a form.
                  </p>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm transition-opacity hover:opacity-90 mb-6" style={{ backgroundColor: "#2b2a35", color: "#fff" }}>
                    <Plus size={16} /> Create automation
                  </button>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Or, <a href="#" className="underline hover:text-black dark:hover:text-white transition-colors">learn about automations.</a>
                  </p>
                </div>
                <div className="flex justify-center">
                  <img src="/automations_graphic.png" alt="Automations Graphic" className="max-w-full rounded-2xl shadow-sm border" style={{ borderColor: "var(--border)" }} />
                </div>
              </div>
            </div>
          ) : activeTab === "Research Flow" ? (
            <div className="flex-1 flex flex-col items-center overflow-y-auto bg-[#fafafa] dark:bg-transparent px-8 py-16">
              <div className="w-full max-w-[1000px] flex flex-col gap-16">

                {/* Hero Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="flex flex-col items-start text-left">
                    <h2 className="text-[32px] font-light mb-4" style={{ color: "var(--text)" }}>Try AI-powered research and see the insights for yourself</h2>
                    <p className="text-[15px] leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
                      It helps you run studies, talk to real respondents, and generate decision-ready insights in hours, not weeks.
                    </p>
                    <button className="px-6 py-3 rounded-md font-semibold text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: "#2b2a35", color: "#fff" }}>
                      Preview a real example
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <img src="/research_hero.png" alt="Research Hero Graphic" className="max-w-full rounded-2xl shadow-sm border" style={{ borderColor: "var(--border)" }} />
                  </div>
                </div>

                {/* Cards Section */}
                <div>
                  <h3 className="text-xl font-light mb-2" style={{ color: "var(--text)" }}>See other use cases in action</h3>
                  <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
                    Step into a live study across text, video, or voice—and see the themes, sentiment, and highlight reels generated from real respondents.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {/* Card 1 */}
                    <div className="bg-white dark:bg-black/20 border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer" style={{ borderColor: "var(--border)" }}>
                      <div className="p-1">
                        <img src="/research_card_1.png" alt="Concept Testing" className="w-full aspect-video object-cover rounded-lg" />
                      </div>
                      <div className="p-4 pt-3">
                        <h4 className="font-semibold text-sm mb-1">Science vs. Nature Design</h4>
                        <p className="text-xs text-gray-500">Concept Testing</p>
                      </div>
                    </div>
                    {/* Card 2 */}
                    <div className="bg-white dark:bg-black/20 border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer" style={{ borderColor: "var(--border)" }}>
                      <div className="p-1">
                        <img src="/research_card_2.png" alt="Public Opinion" className="w-full aspect-video object-cover rounded-lg" />
                      </div>
                      <div className="p-4 pt-3">
                        <h4 className="font-semibold text-sm mb-1">AI Productivity Insights</h4>
                        <p className="text-xs text-gray-500">Public Opinion</p>
                      </div>
                    </div>
                    {/* Card 3 */}
                    <div className="bg-white dark:bg-black/20 border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer" style={{ borderColor: "var(--border)" }}>
                      <div className="p-1">
                        <img src="/research_card_3.png" alt="Demand Testing" className="w-full aspect-video object-cover rounded-lg" />
                      </div>
                      <div className="p-4 pt-3">
                        <h4 className="font-semibold text-sm mb-1">Local E-Bike Sentiment</h4>
                        <p className="text-xs text-gray-500">Demand Testing</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="flex flex-col items-center justify-center text-center mt-8">
                    <h3 className="text-xl font-light mb-4" style={{ color: "var(--text)" }}>Ready to run your own study?</h3>
                    <button className="px-6 py-2.5 rounded-md font-semibold text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: "#2b2a35", color: "#fff" }}>
                      Request a demo
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="p-6 rounded-2xl shadow-xl max-w-md w-full border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-xl font-bold mb-2">Delete Form?</h3>
            <p className="mb-6 text-sm text-gray-500">This will also delete all responses. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border font-medium text-sm">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg font-medium text-sm text-white bg-red-500 hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="p-6 rounded-2xl shadow-xl max-w-md w-full border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-xl font-bold mb-4">Rename</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-500">Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-500">Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }} placeholder="Optional description..." />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditForm(null)} className="px-4 py-2 rounded-lg border font-medium text-sm">Cancel</button>
              <button onClick={handleSaveInfo} className="px-4 py-2 rounded-lg font-medium text-sm text-white bg-black dark:bg-white dark:text-black">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Form List Item Component (List View)
// ----------------------------------------------------------------------
function FormListItem({ form, onDuplicate, onPublish, onDelete, onRename }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isPublished = form.status === "published";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/f/" + form.id);
    toast("Copied!", "Link copied", "success");
    setMenuOpen(false);
  };

  return (
    <div
      className="flex md:grid md:grid-cols-[1fr_100px_100px_150px_100px_40px] gap-4 items-center justify-between px-4 py-3 rounded-xl border bg-white hover:shadow-md transition-shadow cursor-pointer relative group"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      onClick={(e) => { if (!(e.target as HTMLElement).closest(".kebab-menu")) router.push(`/forms/${form.id}/edit`); }}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-lg shrink-0 opacity-90 hidden md:block" style={{ backgroundColor: "var(--accent)" }} />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>{form.title}</span>
          {form.description && <span className="text-xs text-gray-500 truncate mt-0.5 hidden md:block">{form.description}</span>}
        </div>
      </div>
      <div className="hidden md:block text-right text-sm text-gray-400">{form.response_count || 0}</div>
      <div className="hidden md:block text-right text-sm">
        {isPublished ? (
          <span className="font-medium" style={{ color: "#22c55e" }}>
            Published
          </span>
        ) : (
          <span className="text-gray-400 font-medium">
            Draft
          </span>
        )}
      </div>
      <div className="hidden md:block text-right text-sm text-gray-500">{new Date(form.updated_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      <div className="hidden md:flex justify-center">
        <Blocks size={16} className="text-gray-400" />
      </div>

      {/* Kebab */}
      <div className="relative kebab-menu text-right">
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="p-1.5 rounded-lg hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={16} className="text-gray-500" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
            <div className="absolute right-0 top-full mt-1 w-[180px] rounded-xl shadow-xl z-20 py-1.5 border bg-white dark:bg-[#1E293B]" style={{ borderColor: "var(--border)" }}>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); handleCopyLink(); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Copy link</button>

              <div className="h-px my-1 mx-3 bg-gray-200 dark:bg-gray-700" />

              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.push(`/forms/${form.id}/edit?tab=Content`); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Content</button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.push(`/forms/${form.id}/edit?tab=Workflow`); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Workflow</button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.push(`/forms/${form.id}/edit?tab=Connect`); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Connect</button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.push(`/forms/${form.id}/edit?tab=Share`); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Share</button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.push(`/forms/${form.id}/edit?tab=Results`); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Results</button>

              <div className="h-px my-1 mx-3 bg-gray-200 dark:bg-gray-700" />

              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRename(); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Rename</button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDuplicate(); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Duplicate</button>

              <div className="h-px my-1 mx-3 bg-gray-200 dark:bg-gray-700" />

              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-red-50 text-red-600">Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Form Grid Card Component (Grid View)
// ----------------------------------------------------------------------
function FormGridCard({ form, onDuplicate, onPublish, onDelete, onRename }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isPublished = form.status === "published";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/f/" + form.id);
    toast("Copied!", "Link copied", "success");
    setMenuOpen(false);
  };

  return (
    <div
      className="rounded-2xl p-4 border bg-white hover:shadow-lg transition-shadow cursor-pointer relative group flex flex-col h-40"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      onClick={(e) => { if (!(e.target as HTMLElement).closest(".kebab-menu")) router.push(`/forms/${form.id}/edit`); }}
    >
      <div className="flex items-start justify-between mb-auto">
        <div className="flex items-start gap-3 min-w-0 pr-4">
          <div className="w-10 h-10 rounded-xl shrink-0 opacity-90" style={{ backgroundColor: "var(--accent)" }} />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>{form.title}</span>
            {form.description && <span className="text-xs text-gray-500 truncate mt-0.5">{form.description}</span>}
          </div>
        </div>

        {/* Kebab */}
        <div className="relative kebab-menu">
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="p-1 rounded-lg hover:bg-black/5 text-gray-400">
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="absolute right-0 top-full mt-1 w-[180px] rounded-xl shadow-xl z-20 py-1.5 border bg-white dark:bg-[#1E293B]" style={{ borderColor: "var(--border)" }}>
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); handleCopyLink(); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Copy link</button>

                <div className="h-px my-1 mx-3 bg-gray-200 dark:bg-gray-700" />

                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.push(`/forms/${form.id}/edit?tab=Content`); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Content</button>
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.push(`/forms/${form.id}/edit?tab=Workflow`); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Workflow</button>
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.push(`/forms/${form.id}/edit?tab=Connect`); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Connect</button>
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.push(`/forms/${form.id}/edit?tab=Share`); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Share</button>
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.push(`/forms/${form.id}/edit?tab=Results`); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Results</button>

                <div className="h-px my-1 mx-3 bg-gray-200 dark:bg-gray-700" />

                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRename(); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Rename</button>
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDuplicate(); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-black/5 text-[#2b2a35] dark:text-gray-300">Duplicate</button>

                <div className="h-px my-1 mx-3 bg-gray-200 dark:bg-gray-700" />

                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }} className="w-full text-left px-4 py-2 text-[13px] hover:bg-red-50 text-red-600">Delete</button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{form.response_count || 0} Responses</span>
          {isPublished ? (
            <span className="font-medium" style={{ color: "#22c55e" }}>Published</span>
          ) : (
            <span className="text-gray-400">Draft</span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5"><Blocks size={12} /> Integrations</div>
          <span>{new Date(form.updated_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
