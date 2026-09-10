"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";

/**
 * FRONTEND PROTOTYPE AUTHENTICATION CONTEXT
 * 
 * IMPORTANT SECURITY NOTE:
 * This client-side AuthContext is strictly a frontend prototype for demonstration
 * and development navigation testing. Production authorization must be enforced
 * via secure HTTP-only cookies / JWT session tokens validated on the server side
 * once the real backend is connected.
 */

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, customUser?: Partial<User>) => void;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock users for development prototype testing
const MOCK_USERS: Record<UserRole, User> = {
  public_visitor: {
    id: "usr-guest",
    name: "Guest Visitor",
    email: "guest@apex.edu.pk",
    role: "public_visitor",
    createdAt: "2026-08-22",
  },
  applicant: {
    id: "usr-app-001",
    name: "Hamza Ahmed Khan",
    email: "hamza.khan@gmail.com",
    role: "applicant",
    createdAt: "2026-08-10",
  },
  student: {
    id: "std-2026-001",
    name: "Ali Hasan Siddiqui",
    email: "ali.siddiqui@student.apex.edu.pk",
    role: "student",
    phone: "+92 301 5551234",
    createdAt: "2024-09-01",
  },
  teacher: {
    id: "tch-101",
    name: "Dr. Muhammad Shahbaz",
    email: "shahbaz@apex.edu.pk",
    role: "teacher",
    phone: "+92 300 4443322",
    createdAt: "2018-02-15",
  },
  admin: {
    id: "stf-001",
    name: "Kashif Shahzad",
    email: "kashif.accounts@apex.edu.pk",
    role: "admin",
    phone: "+92 300 9988776",
    createdAt: "2015-01-10",
  },
};

const STORAGE_KEY = "cms_demo_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from localStorage for demo persistence
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (role: UserRole, customUser?: Partial<User>) => {
    const baseMock = MOCK_USERS[role] || MOCK_USERS.student;
    const sessionUser: User = {
      ...baseMock,
      ...customUser,
      role,
    };
    setUser(sessionUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    } catch {
      // Ignore localStorage errors
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
