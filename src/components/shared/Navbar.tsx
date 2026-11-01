"use client";

import React, { useState } from "react";
import { DumrooLogo } from "./DumrooLogo";
import { useDemoUser } from "@/contexts/DemoUserContext";
import { ChevronDown, User, Shield, GraduationCap, School, Check } from "lucide-react";
import { UserRole } from "@/types";

export function Navbar() {
  const { currentUser, setCurrentUser, allUsers } = useDemoUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleRoleQuickSwitch = (role: UserRole) => {
    const user = allUsers.find((u) => u.role === role && u.isActive);
    if (user) {
      setCurrentUser(user);
    }
  };

  const currentRole = currentUser?.role || "student";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <DumrooLogo />

        {/* Center: Direct Role Switcher Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/80">
          <button
            onClick={() => handleRoleQuickSwitch("student")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentRole === "student"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            onClick={() => handleRoleQuickSwitch("teacher")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentRole === "teacher"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Teacher</span>
          </button>

          <button
            onClick={() => handleRoleQuickSwitch("principal")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentRole === "principal"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Principal</span>
          </button>
        </div>

        {/* Right: Active Demo User profile & Inactive tester */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium transition-all"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentUser?.isActive ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span className="max-w-[120px] truncate">{currentUser?.name || "Demo User"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select User Persona
                </p>
              </div>

              <div className="py-1 space-y-1">
                {allUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                        isCurrent
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">
                          {u.role} {!u.isActive && "(Inactive / 403 test)"}
                        </p>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
