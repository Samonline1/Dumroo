"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DemoUser } from "@/types";

const FALLBACK_DEMO_USERS: DemoUser[] = [
  {
    id: "usr_student_01",
    name: "Alex Rivera",
    role: "student",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_teacher_01",
    name: "Prof. Clara Edwards",
    role: "teacher",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_principal_01",
    name: "Dr. Arthur Vance",
    role: "principal",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_student_inactive",
    name: "Jordan Smith (Inactive Student)",
    role: "student",
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface DemoUserContextType {
  currentUser: DemoUser | null;
  setCurrentUser: (user: DemoUser) => void;
  allUsers: DemoUser[];
  isLoading: boolean;
  refreshUsers: () => Promise<void>;
}

const DemoUserContext = createContext<DemoUserContextType | undefined>(undefined);

export function DemoUserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<DemoUser | null>(FALLBACK_DEMO_USERS[0]);
  const [allUsers, setAllUsers] = useState<DemoUser[]>(FALLBACK_DEMO_USERS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/demo-users");
      const json = await res.json();
      const usersList = (json.success && Array.isArray(json.data) && json.data.length > 0)
        ? json.data
        : FALLBACK_DEMO_USERS;

      setAllUsers(usersList);

      // Stored identity
      const savedId = typeof window !== "undefined" ? localStorage.getItem("demo_user_id") : null;
      let selected = usersList.find((u: DemoUser) => u.id === savedId);

      // Fallback
      if (!selected) {
        selected = usersList.find((u: DemoUser) => u.role === "student" && u.isActive) || usersList[0];
      }

      if (selected) {
        setCurrentUserState(selected);
        document.cookie = `demo_user_id=${selected.id}; path=/; max-age=86400; SameSite=Lax`;
        localStorage.setItem("demo_user_id", selected.id);
      }
    } catch {
      // Use fallback
      setCurrentUserState(FALLBACK_DEMO_USERS[0]);
      setAllUsers(FALLBACK_DEMO_USERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const setCurrentUser = (user: DemoUser) => {
    setCurrentUserState(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("demo_user_id", user.id);
      document.cookie = `demo_user_id=${user.id}; path=/; max-age=86400; SameSite=Lax`;
    }
  };

  return (
    <DemoUserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers,
        isLoading,
        refreshUsers: fetchUsers,
      }}
    >
      {children}
    </DemoUserContext.Provider>
  );
}

export function useDemoUser() {
  const context = useContext(DemoUserContext);
  if (!context) {
    throw new Error("useDemoUser must be used within a DemoUserProvider");
  }
  return context;
}
