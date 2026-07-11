"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { Form, Stats, ResponsePreview, ResponseDetail } from "@/lib/types";
import { Download, Eye, X, ArrowLeft, BarChart3, List, FileText, AlertCircle, ChevronDown, Blocks, PencilRuler, Settings, CircleHelp } from "lucide-react";
import Link from "next/link";
import { GlobalNavbar } from "@/components/ui/GlobalNavbar";

export default function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [responses, setResponses] = useState<ResponsePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "responses">("summary");
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const [responseDetail, setResponseDetail] = useState<ResponseDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setFetchError(null);
      try {
        console.log(`[ResponsesPage] Fetching data for form id: ${id}`);
        const [formData, statsData, responsesData] = await Promise.all([
          api.forms.get(id),
          api.responses.getStats(id),
          api.responses.list(id),
        ]);
        console.log(`[ResponsesPage] Got ${responsesData.length} responses`);
        setForm(formData);
        setStats(statsData);
        setResponses(responsesData);
      } catch (e: any) {
        console.error("[ResponsesPage] Failed to load data:", e);
        setFetchError(e.message || "Failed to load. Check the console for details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleExport = async () => {
    try {
      const blob = await api.responses.exportCsv(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form?.title || "form"}_responses.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e: any) {
      console.error("[ResponsesPage] Export failed:", e);
      alert(`Export failed: ${e.message}`);
    }
  };

  const openDetail = async (respId: string) => {
    setSelectedResponseId(respId);
    setLoadingDetail(true);
    try {
      const detail = await api.responses.get(respId);
      setResponseDetail(detail);
    } catch (e: any) {
      console.error("[ResponsesPage] Detail load failed:", e);
      setSelectedResponseId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading responses…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="p-4 rounded-full mb-4" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
          <AlertCircle size={36} style={{ color: "#ef4444" }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Failed to load</h2>
        <p className="mb-2 max-w-md text-sm" style={{ color: "var(--text-muted)" }}>{fetchError}</p>
        <Link href={`/forms/${id}/edit`} className="text-sm font-semibold hover:underline" style={{ color: "var(--accent)" }}>
          ← Back to Builder
        </Link>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      {/* Global Top Navbar */}
      <GlobalNavbar />

      {/* Builder Top Bar */}
      <div
        className="h-14 border-b flex items-center justify-between px-6 shrink-0 shadow-sm z-10"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/forms"
            className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors text-sm font-medium"
          >
            <FileText size={16} /> Forms
          </Link>
          <span className="text-gray-400 text-sm px-1">&gt;</span>
          <div className="h-5 w-px" style={{ backgroundColor: "var(--border)" }} />
          <span className="font-semibold text-sm truncate max-w-[200px]" style={{ color: "var(--text)" }}>
            {form.title}{" "}
            <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>— Results</span>
          </span>
        </div>

        {/* Tab bar */}
        <div
          className="flex gap-1 p-1 rounded-lg border"
          style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
        >
          <Link
            href={`/forms/${id}/edit`}
            className="px-4 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-2 hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft size={15} /> Builder
          </Link>
          <div className="w-px h-4 my-auto mx-1" style={{ backgroundColor: "var(--border)" }} />
          {(["summary", "responses"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="px-4 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-2"
              style={
                activeTab === t
                  ? { backgroundColor: "var(--card)", color: "var(--accent)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
                  : { color: "var(--text-muted)" }
              }
            >
              {t === "summary" ? <BarChart3 size={15} /> : <List size={15} />}
              {t === "summary" ? "Summary" : `Responses (${responses.length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-semibold text-sm border transition-colors whitespace-nowrap"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <Download size={15} /> <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">

          {responses.length === 0 ? (
            <div
              className="border-2 border-dashed rounded-2xl p-16 text-center"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <FileText size={48} className="mx-auto mb-4" style={{ color: "var(--accent)", opacity: 0.3 }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>No responses yet</h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Share your form to start collecting data.
                {form.status !== "published" && (
                  <span className="block mt-2 font-medium" style={{ color: "#f59e0b" }}>
                    ⚠ Your form is in Draft — publish it first.
                  </span>
                )}
              </p>
            </div>
          ) : activeTab === "summary" ? (
            <div className="space-y-6">
              {Object.entries(stats || {}).map(([qId, stat]) => (
                <div
                  key={qId}
                  className="rounded-2xl p-6 border"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-base font-bold pr-8" style={{ color: "var(--text)" }}>
                      {stat.title}
                    </h3>
                    <span
                      className="text-sm font-bold px-3 py-1 rounded-full shrink-0"
                      style={{ backgroundColor: "rgba(255,61,87,0.1)", color: "var(--accent)" }}
                    >
                      {stat.total_answered} answered
                    </span>
                  </div>

                  {["multiple_choice", "dropdown", "yes_no"].includes(stat.type) && stat.percentages && (
                    <div className="space-y-3">
                      {Object.entries(stat.percentages).map(([option, percent]) => (
                        <div key={option}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium" style={{ color: "var(--text)" }}>{option}</span>
                            <span style={{ color: "var(--text-muted)" }}>
                              {(percent as number).toFixed(1)}% ({stat.counts?.[option] || 0})
                            </span>
                          </div>
                          <div
                            className="h-3 w-full rounded-full overflow-hidden border"
                            style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${percent}%`, backgroundColor: "var(--accent)" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {stat.type === "rating" && stat.average !== undefined && (
                    <div className="flex items-center gap-8 p-5 rounded-xl border" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
                      <div className="text-center min-w-[100px]">
                        <div className="text-5xl font-bold" style={{ color: "var(--accent)" }}>
                          {stat.average.toFixed(1)}
                        </div>
                        <div className="text-xs mt-1 uppercase font-bold tracking-widest" style={{ color: "var(--text-muted)" }}>
                          Average
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {Object.entries(stat.counts || {}).map(([rating, count]) => {
                          const pct = ((count as number) / (stat.total_answered || 1)) * 100;
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <span className="w-4 text-sm font-bold" style={{ color: "var(--text-muted)" }}>{rating}</span>
                              <div className="h-2.5 flex-1 rounded-full overflow-hidden border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
                                <div className="h-full rounded-full opacity-80 transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: "var(--accent)" }} />
                              </div>
                              <span className="w-6 text-xs font-bold text-right" style={{ color: "var(--text-faint)" }}>{count as number}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {["short_text", "long_text", "email", "number", "file_upload"].includes(stat.type) && (
                    <div className="text-center py-8 rounded-xl border" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}>
                      <div className="text-4xl font-bold mb-1" style={{ color: "var(--accent)" }}>{stat.total_answered}</div>
                      <div className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Responses Collected</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead style={{ backgroundColor: "var(--bg)", borderBottom: `1px solid var(--border)` }}>
                    <tr>
                      {["Submitted At", "Status", "Preview", "Actions"].map((h, i) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider"
                          style={{ color: "var(--text-muted)", textAlign: i === 3 ? "right" : "left" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((resp) => (
                      <tr key={resp.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium" style={{ color: "var(--text)" }}>
                          {new Date(resp.submitted_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide"
                            style={
                              resp.is_complete
                                ? { backgroundColor: "rgba(34,197,94,0.12)", color: "#16a34a" }
                                : { backgroundColor: "rgba(245,158,11,0.12)", color: "#d97706" }
                            }
                          >
                            {resp.is_complete ? "Complete" : "Partial"}
                          </span>
                        </td>
                        <td className="px-6 py-4 truncate max-w-sm" style={{ color: "var(--text-muted)" }}>
                          {resp.preview || "No preview"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openDetail(resp.id)}
                            className="font-bold hover:underline flex items-center gap-1 justify-end w-full"
                            style={{ color: "var(--accent)" }}
                          >
                            <Eye size={15} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response Detail Modal */}
      {selectedResponseId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border overflow-hidden"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            {loadingDetail ? (
              <div className="p-16 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>
              </div>
            ) : responseDetail ? (
              <>
                <div
                  className="p-6 border-b flex justify-between items-center shrink-0"
                  style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
                >
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>Response Details</h3>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                      {new Date(responseDetail.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedResponseId(null)}
                    className="p-2 border rounded-full transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-5">
                  {responseDetail.answers.map((ans, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl border"
                      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
                    >
                      <h4 className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                        <span style={{ color: "var(--accent)" }}>{idx + 1}. </span>
                        {ans.question_title}
                      </h4>
                      {ans.type === "file_upload" && ans.answer_value ? (
                        <a
                          href={ans.answer_value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-colors"
                          style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--card)" }}
                        >
                          <FileText size={16} />
                          Open File
                        </a>
                      ) : (
                        <p className="text-base font-medium whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text)" }}>
                          {ans.answer_value || (
                            <span style={{ color: "var(--text-faint)", fontStyle: "italic", fontWeight: 400 }}>
                              No answer provided
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-12 text-center font-bold" style={{ color: "#ef4444" }}>
                Failed to load response.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
