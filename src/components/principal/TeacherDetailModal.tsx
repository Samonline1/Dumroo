"use client";

import React, { useState } from "react";
import { TeacherMonitoringItem } from "@/types";
import { SourceCards } from "@/components/shared/SourceCards";
import { X, Search, CheckCircle2, XCircle, Clock, Globe, ChevronDown, ChevronUp } from "lucide-react";

interface TeacherDetailModalProps {
  teacher: TeacherMonitoringItem | null;
  onClose: () => void;
}

export function TeacherDetailModal({ teacher, onClose }: TeacherDetailModalProps) {
  const [expandedSearchId, setExpandedSearchId] = useState<string | null>(null);

  if (!teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{teacher.name}</h3>
                {teacher.isActive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Active Faculty
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-medium">
                    <XCircle className="w-3 h-3" />
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Total Searches: <strong>{teacher.totalSearches}</strong> • Last Active:{" "}
                {teacher.lastActive ? new Date(teacher.lastActive).toLocaleDateString() : "Never"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Search Queries List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Web Search History ({teacher.recentSearches.length})
            </span>
            <span className="text-xs text-slate-400">Click inquiry to expand full response</span>
          </div>

          {teacher.recentSearches.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Globe className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">No search queries logged by this faculty member yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teacher.recentSearches.map((s) => {
                const isExpanded = expandedSearchId === s.id;
                return (
                  <div
                    key={s.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 hover:bg-white transition-all shadow-sm"
                  >
                    <button
                      onClick={() => setExpandedSearchId(isExpanded ? null : s.id)}
                      className="w-full p-4 text-left flex items-start justify-between gap-3 focus:outline-none"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                          Search Query
                        </span>
                        <p className="text-sm font-semibold text-slate-900 leading-snug">
                          {s.query}
                        </p>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(s.createdAt).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <div className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-white space-y-3">
                        <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {s.response}
                        </div>

                        {s.sources && (
                          <div className="pt-2">
                            <SourceCards sources={s.sources} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
}
