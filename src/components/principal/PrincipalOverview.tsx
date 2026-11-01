"use client";

import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api-client";
import { PlatformOverviewStats } from "@/types";
import {
  Users,
  Briefcase,
  MessageSquare,
  Search,
  TrendingUp,
  Activity,
} from "lucide-react";

export function PrincipalOverview() {
  const [stats, setStats] = useState<PlatformOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth("/api/monitoring/overview");
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to load overview stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner matching Screenshot 1 */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-blue-50 rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold tracking-wide shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ANALYTICS AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Executive Intelligence & Platform Overview
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Real-time analytics across student tutoring efficacy, teacher curriculum research, and overall institutional engagement.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Students
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats?.totalStudents ?? 0}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {stats?.activeStudents ?? 0} Active
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Teachers
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats?.totalTeachers ?? 0}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {stats?.activeTeachers ?? 0} Active
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tutoring Sessions
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats?.totalConversations ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.totalMessages ?? 0} Messages exchanged
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Web Research Searches
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats?.totalSearches ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Verified educational queries
            </p>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900">
              Platform-Wide Real-Time Activity Feed
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Live events ({stats?.recentActivity.length ?? 0})
          </span>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Aggregating live platform activity...
            </p>
          ) : !stats?.recentActivity || stats.recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No recent activity recorded yet.
            </p>
          ) : (
            stats.recentActivity.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      event.userRole === "student"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {event.userRole === "student" ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {event.userName}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          event.userRole === "student"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {event.userRole}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      {event.description}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0 ml-4">
                  {new Date(event.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
