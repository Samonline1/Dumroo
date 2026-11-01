"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DemoUser } from "@/types";

interface DemoUserContextType {
  currentUser: DemoUser | null;
  setCurrentUser: (user: DemoUser) => void;
  allUsers: DemoUser[];
  isLoading: boolean;
  refreshUsers: () => Promise<void>;
}

const DemoUserContext = createContext<DemoUserContextType | undefined>(undefined);

export function DemoUserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<DemoUser | null>(null);
  const [allUsers, setAllUsers] = useState<DemoUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/demo-users");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllUsers(json.data);

        // Stored identity
        const savedId = typeof window !== "undefined" ? localStorage.getItem("demo_user_id") : null;
        let selected = json.data.find((u: DemoUser) => u.id === savedId);

        // Fallback
        if (!selected) {
          selected = json.data.find((u: DemoUser) => u.role === "student" && u.isActive) || json.data[0];
        }

        if (selected) {
          setCurrentUserState(selected);
          document.cookie = `demo_user_id=${selected.id}; path=/; max-age=86400; SameSite=Lax`;
          localStorage.setItem("demo_user_id", selected.id);
        }
      }
    } catch (err) {
      console.error("Failed to load demo users:", err);
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
