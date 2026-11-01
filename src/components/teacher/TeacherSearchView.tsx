"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api-client";
import { DumrooChatInput } from "@/components/shared/DumrooChatInput";
import { SourceCards } from "@/components/shared/SourceCards";
import { FormattedAiContent } from "@/components/shared/FormattedAiContent";
import { useDemoUser } from "@/contexts/DemoUserContext";
import { TeacherSearch } from "@/types";
import {
  Search,
  Globe,
  Clock,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  PlusCircle,
  BookOpen,
} from "lucide-react";

export function TeacherSearchView() {
  const { currentUser } = useDemoUser();
  const [history, setHistory] = useState<TeacherSearch[]>([]);
  const [activeSearch, setActiveSearch] = useState<TeacherSearch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isPrincipal = currentUser?.role === "principal";
  const [scope, setScope] = useState<"own" | "teachers" | "all">("own");

  const loadHistory = async (targetScope = scope) => {
    try {
      const scopeParam = isPrincipal ? `?scope=${targetScope}` : "";
      const res = await fetchWithAuth(`/api/search/history${scopeParam}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setHistory(json.data);
        if (json.data.length > 0 && !activeSearch) {
          setActiveSearch(json.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load search history:", err);
    }
  };

  useEffect(() => {
    loadHistory(scope);
  }, [scope, currentUser]);

  const handleSearch = async (query: string) => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuth("/api/search", {
        method: "POST",
        body: JSON.stringify({ query }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Web search request failed");
      }

      const newRecord: TeacherSearch = {
        id: json.data.searchId,
        teacherId: currentUser?.id || "",
        conversationId: json.data.conversationId,
        query: json.data.query,
        response: json.data.answer,
        sources: json.data.sources,
        createdAt: json.data.createdAt,
      };

      setActiveSearch(newRecord);
      setHistory((prev) => [newRecord, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute search");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!activeSearch) return;
    navigator.clipboard.writeText(`${activeSearch.query}\n\n${activeSearch.response}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleQueries = isPrincipal
    ? [
        "District-wide STEM curriculum assessment benchmarks",
        "Evidence-based attendance intervention policies",
        "Faculty professional development frameworks for digital literacy",
        "K-12 state standard compliance metrics for science",
      ]
    : [
        "Differentiated instruction strategies for mixed-ability math",
        "Formative assessment techniques for high school physics",
        "Reading comprehension strategies for struggling readers",
        "Inquiry-based biology lesson planning rubrics",
      ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-7rem)]">
      {/* History sidebar */}
      <div className="w-full lg:w-80 bg-slate-50/80 rounded-3xl p-4 border border-slate-200/80 flex flex-col justify-between shrink-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>{isPrincipal ? "Search Archives" : "My Search History"}</span>
            </div>
            <button
              onClick={() => setActiveSearch(null)}
              className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-full transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Scope filter */}
          {isPrincipal && (
            <div className="flex bg-slate-200/70 p-1 rounded-xl text-[11px] font-semibold gap-1">
              <button
                onClick={() => setScope("own")}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  scope === "own" ? "bg-white text-purple-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                My Searches
              </button>
              <button
                onClick={() => setScope("teachers")}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  scope === "teachers" ? "bg-white text-purple-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Faculty
              </button>
              <button
                onClick={() => setScope("all")}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  scope === "all" ? "bg-white text-purple-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
            </div>
          )}

          <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-17rem)] pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 p-2 text-center">No search records found in this view.</p>
            ) : (
              history.map((s) => {
                const isSelected = activeSearch?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSearch(s)}
                    className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs transition-all flex flex-col gap-1 ${
                      isSelected
                        ? "bg-white text-purple-800 font-semibold shadow-sm border border-purple-200"
                        : "text-slate-600 hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 mt-0.5 shrink-0 text-purple-500" />
                      <span className="truncate flex-1 font-medium">{s.query}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 pl-5.5">
                      {new Date(s.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 text-[11px] text-purple-900 flex items-start gap-2 mt-4">
          <BookOpen className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <p>
            {isPrincipal
              ? "Principal view has visibility into faculty research archives and institutional queries."
              : "Teacher view is isolated: your search queries are private and not visible to peers."}
          </p>
        </div>
      </div>

      {/* Main search pane */}
      <div className="flex-1 flex flex-col justify-between bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-4 sm:p-6">
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {isPrincipal ? "Institutional AI Intelligence & Web Search" : "Faculty Curriculum & Educational Web Search"}
                </h2>
                <p className="text-xs text-slate-500">
                  Powered by Groq live browser search with verified educational source citations.
                </p>
              </div>
            </div>

            {activeSearch && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeSearch ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-gradient-to-r from-purple-50 via-slate-50 to-blue-50 rounded-2xl p-4 border border-purple-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700">
                  Research Inquiry
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {activeSearch.query}
                </p>
                <span className="text-[11px] text-slate-400 mt-2 block">
                  Conducted on {new Date(activeSearch.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <FormattedAiContent content={activeSearch.response} />
                <SourceCards sources={activeSearch.sources} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Search className="w-7 h-7" />
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-bold text-slate-900">
                  Educational Web Research
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Submit any pedagogical, curriculum, or standards inquiry. AI will research the web and synthesize verified findings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full pt-4">
                {sampleQueries.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(q)}
                    className="p-3 text-left rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-purple-50 hover:border-purple-300 text-xs text-slate-700 transition-all font-medium flex items-start gap-2"
                  >
                    <Search className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 p-4 bg-purple-50 rounded-2xl w-fit text-xs text-purple-800 animate-pulse border border-purple-200">
              <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
              <span>Conducting live web research and synthesizing verified sources...</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <DumrooChatInput
            onSend={handleSearch}
            isLoading={isLoading}
            placeholder="Search educational research, teaching strategies, or curriculum concepts..."
          />
        </div>
      </div>
    </div>
  );
}
