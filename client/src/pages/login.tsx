import { useState } from "react";
import { useAuth } from "@/hooks/use-autenticacao";
import { ShieldAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!username.trim() || !password.trim()) {
      setErro("Preencha o usuário e a senha.");
      return;
    }
    setIsLoggingIn(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setErro(err.message || "Erro ao fazer login.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "hsl(152, 30%, 97%)" }}>
      {/* Painel lateral verde */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-12"
        style={{ backgroundColor: "hsl(152, 70%, 16%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/15 p-2 rounded-xl shadow-lg">
            <ShieldAlert size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">DPE-GO</h1>
            <p className="text-xs text-green-300/80">Defensoria Pública do Estado de Goiás</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Sistema de Gestão de<br />Eventos Itinerantes
          </h2>
          <p className="text-green-200/70 text-sm leading-relaxed">
            Controle de equipamentos, alocação de equipes e acompanhamento de expedições da Defensoria Pública.
          </p>
        </div>

        <p className="text-green-300/40 text-xs">
          Divisão de Tecnologia da Informação — DPE-GO
        </p>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="p-2 rounded-xl shadow" style={{ backgroundColor: "hsl(152, 70%, 16%)" }}>
              <ShieldAlert size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">DPE-GO</h1>
              <p className="text-xs text-gray-500">Gestão de Itinerantes</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Entrar no sistema</h2>
            <p className="text-gray-500 text-sm mt-1">Informe suas credenciais para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                Usuário
              </Label>
              <Input
                id="username"
                data-testid="input-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu.login"
                className="h-11 border-gray-200 focus-visible:ring-green-600"
                disabled={isLoggingIn}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="input-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 border-gray-200 focus-visible:ring-green-600 pr-10"
                  disabled={isLoggingIn}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && (
              <div
                data-testid="text-login-error"
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
              >
                {erro}
              </div>
            )}

            <Button
              type="submit"
              data-testid="button-login"
              disabled={isLoggingIn}
              className="w-full h-11 font-semibold"
              style={{ backgroundColor: "hsl(152, 70%, 22%)" }}
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
