import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  role: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

// Retorna true se o perfil tem acesso de suporte (pode editar eventos/equipamentos)
export function isSuporte(role: string) {
  return ["admin", "technician", "almoxarifado"].includes(role);
}

// Retorna true se o perfil é administrador
export function isAdmin(role: string) {
  return role === "admin";
}

// Retorna o rótulo legível do perfil
export function roleLabel(role: string) {
  switch (role) {
    case "admin": return "Administrador";
    case "technician": return "Suporte TI";
    case "almoxarifado": return "Almoxarifado";
    case "defender": return "Defensor";
    case "advisor": return "Assessor";
    default: return role;
  }
}

export function useAuthSetup() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Erro ao verificar sessão");
      return res.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Erro ao fazer login" }));
        throw new Error(err.message || "Credenciais inválidas");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      setLocation("/login");
    },
  });

  return {
    user: user ?? null,
    isLoading,
    login: (username: string, password: string) =>
      loginMutation.mutateAsync({ username, password }),
    logout: () => logoutMutation.mutateAsync(),
    loginError: loginMutation.error?.message,
    isLoggingIn: loginMutation.isPending,
  };
}
