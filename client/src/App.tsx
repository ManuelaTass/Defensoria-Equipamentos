import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthContext, useAuthSetup, isSuporte, isAdmin } from "@/hooks/use-autenticacao";

// Páginas
import Painel from "./pages/dashboard";
import EventosPage from "./pages/eventos/index";
import DetalheEventoPage from "./pages/eventos/detail";
import EquipamentosPage from "./pages/equipamentos/index";
import TecnicosPage from "./pages/tecnicos/index";
import AdminUsuariosPage from "./pages/administracao/users";
import CalendarioPage from "./pages/calendario/index";
import LoginPage from "./pages/login";
import NaoEncontrado from "@/pages/nao-encontrado";

function AppContent() {
  const auth = useAuthSetup();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "hsl(152, 30%, 97%)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user: auth.user, isLoading: auth.isLoading, login: auth.login, logout: auth.logout }}>
      <Switch>
        <Route path="/login" component={LoginPage} />

        <Route path="/">
          {() => !auth.user ? <Redirect to="/login" /> : <Painel />}
        </Route>
        <Route path="/calendario">
          {() => !auth.user ? <Redirect to="/login" /> : <CalendarioPage />}
        </Route>
        <Route path="/eventos">
          {() => !auth.user ? <Redirect to="/login" /> : <EventosPage />}
        </Route>
        <Route path="/eventos/:id">
          {() => !auth.user ? <Redirect to="/login" /> : <DetalheEventoPage />}
        </Route>
        <Route path="/equipamentos">
          {() => {
            if (!auth.user) return <Redirect to="/login" />;
            if (!isSuporte(auth.user.role)) return <Redirect to="/" />;
            return <EquipamentosPage />;
          }}
        </Route>
        <Route path="/tecnicos">
          {() => {
            if (!auth.user) return <Redirect to="/login" />;
            if (!isSuporte(auth.user.role)) return <Redirect to="/" />;
            return <TecnicosPage />;
          }}
        </Route>
        <Route path="/administracao/usuarios">
          {() => {
            if (!auth.user) return <Redirect to="/login" />;
            if (!isAdmin(auth.user.role)) return <Redirect to="/" />;
            return <AdminUsuariosPage />;
          }}
        </Route>

        <Route component={NaoEncontrado} />
      </Switch>
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
