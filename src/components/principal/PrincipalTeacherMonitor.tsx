"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api-client";
import { TeacherMonitoringItem } from "@/types";
import { TeacherDetailModal } from "./TeacherDetailModal";
import { Briefcase, Search, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";

export function PrincipalTeacherMonitor() {
  const [teachers, setTeachers] = useState<TeacherMonitoringItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalTeacher, setModalTeacher] = useState<TeacherMonitoringItem | null>(null);

  const loadTeachers = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth("/api/monitoring/teachers");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTeachers(json.data);
      }
    } catch (err) {
      console.error("Failed to load teachers monitoring:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-600" />
          <span>Faculty & Teacher Activity Monitor</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tap "Details" on any faculty member to audit their curriculum research queries and verified source references.
        </p>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Faculty Members ({teachers.length})
          </span>
          <span className="text-xs text-slate-400">
            Active: {teachers.filter((t) => t.isActive).length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-3.5 px-4">Teacher Name</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Searches Conducted</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading teacher activity records...
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No teacher records found.
                  </td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setModalTeacher(t)}
                    className="cursor-pointer hover:bg-purple-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{t.name}</td>
                    <td className="py-3.5 px-4">
                      {t.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full font-medium">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {t.totalSearches}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {t.lastActive ? new Date(t.lastActive).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalTeacher(t);
                        }}
                        className="text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-full transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Modal Popup */}
      <TeacherDetailModal
        teacher={modalTeacher}
        onClose={() => setModalTeacher(null)}
      />
    </div>
  );
}
