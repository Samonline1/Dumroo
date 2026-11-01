"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { useDemoUser } from "@/contexts/DemoUserContext";
import { StudentTutorView } from "@/components/student/StudentTutorView";
import { TeacherSearchView } from "@/components/teacher/TeacherSearchView";
import { TeacherStudentMonitor } from "@/components/teacher/TeacherStudentMonitor";
import { PrincipalOverview } from "@/components/principal/PrincipalOverview";
import { PrincipalTeacherMonitor } from "@/components/principal/PrincipalTeacherMonitor";
import { AlertCircle, Loader2, Search, Users, LayoutDashboard, Briefcase, Sparkles } from "lucide-react";

export default function WorkspacePage() {
  const { currentUser, isLoading } = useDemoUser();
  const [teacherTab, setTeacherTab] = useState<"search" | "students">("search");
  const [principalTab, setPrincipalTab] = useState<"overview" | "teachers" | "students" | "search">("overview");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-medium">Loading Dumroo.ai workspace...</p>
        </div>
      </div>
    );
  }

  const role = currentUser?.role || "student";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentUser && !currentUser.isActive ? (
          <div className="max-w-md mx-auto my-16 bg-white rounded-3xl p-8 border border-red-200 shadow-lg text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Account Inactive (HTTP 403)</h2>
            <p className="text-xs text-slate-600 mt-2">
              The user <strong>{currentUser?.name}</strong> is marked as inactive in the database.
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Use the top-right persona switcher to switch to an active Student, Teacher, or Principal persona.
            </p>
          </div>
        ) : role === "student" ? (
          /* Student AI Tutoring View */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 leading-tight">Student AI Tutoring</h1>
                  <p className="text-xs text-slate-500">Socratic guidance, step-by-step hints, and concept coaching.</p>
                </div>
              </div>
            </div>
            <StudentTutorView />
          </div>
        ) : role === "teacher" ? (
          /* Teacher Workspace with Search & Student Activity Tabs */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-lg font-bold text-slate-900">Teacher Workspace</h1>
                <p className="text-xs text-slate-500">Education web search and student activity telemetry.</p>
              </div>

              {/* Sub tabs */}
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 gap-1">
                <button
                  onClick={() => setTeacherTab("search")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    teacherTab === "search"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>AI Web Search</span>
                </button>
                <button
                  onClick={() => setTeacherTab("students")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    teacherTab === "students"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Student Activity</span>
                </button>
              </div>
            </div>

            {teacherTab === "search" ? <TeacherSearchView /> : <TeacherStudentMonitor />}
          </div>
        ) : (
          /* Principal Workspace with Overview, Teachers, Students, and Search Tabs */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-lg font-bold text-slate-900">Principal / Admin Intelligence</h1>
                <p className="text-xs text-slate-500">Platform-wide activity telemetry and curriculum audit.</p>
              </div>

              {/* Sub tabs */}
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 gap-1 flex-wrap">
                <button
                  onClick={() => setPrincipalTab("overview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    principalTab === "overview"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Platform Overview</span>
                </button>
                <button
                  onClick={() => setPrincipalTab("teachers")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    principalTab === "teachers"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Teacher Monitoring</span>
                </button>
                <button
                  onClick={() => setPrincipalTab("students")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    principalTab === "students"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Student Activity</span>
                </button>
                <button
                  onClick={() => setPrincipalTab("search")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    principalTab === "search"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Web Search</span>
                </button>
              </div>
            </div>

            {principalTab === "overview" ? (
              <PrincipalOverview />
            ) : principalTab === "teachers" ? (
              <PrincipalTeacherMonitor />
            ) : principalTab === "students" ? (
              <TeacherStudentMonitor />
            ) : (
              <TeacherSearchView />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
