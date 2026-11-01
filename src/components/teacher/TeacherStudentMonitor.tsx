"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api-client";
import { StudentMonitoringItem } from "@/types";
import { StudentDetailModal } from "./StudentDetailModal";
import { Users, Activity, CheckCircle2, XCircle, Search, ExternalLink, Sparkles } from "lucide-react";

export function TeacherStudentMonitor() {
  const [students, setStudents] = useState<StudentMonitoringItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalStudent, setModalStudent] = useState<StudentMonitoringItem | null>(null);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth("/api/monitoring/students");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStudents(json.data);
      }
    } catch (err) {
      console.error("Failed to load students monitoring:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Student Activity & Engagement Monitor</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tap "View" on any student to inspect their full tutoring dialogue history and activity log.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student by name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Students ({filtered.length})
          </span>
          <span className="text-xs text-slate-400">
            Active: {students.filter((s) => s.isActive).length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Sessions</th>
                <th className="py-3.5 px-4 text-center">Messages</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setModalStudent(s)}
                    className="cursor-pointer hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.isActive ? (
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
                      {s.totalConversations}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                      {s.totalMessages}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {s.lastActive ? new Date(s.lastActive).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalStudent(s);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Audit Detail Modal */}
      <StudentDetailModal
        student={modalStudent}
        onClose={() => setModalStudent(null)}
      />
    </div>
  );
}
