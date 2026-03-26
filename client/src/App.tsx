import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthContext, useAuthSetup, isSuporte } from "@/hooks/use-auth";

// Páginas
import Dashboard from "./pages/dashboard";
import EventsPage from "./pages/events/index";
import EventDetailPage from "./pages/events/detail";
import EquipmentPage from "./pages/equipment/index";
import TechniciansPage from "./pages/technicians/index";
import LoginPage from "./pages/login";
import NotFound from "@/pages/not-found";

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
          {() => !auth.user ? <Redirect to="/login" /> : <Dashboard />}
        </Route>
        <Route path="/events">
          {() => !auth.user ? <Redirect to="/login" /> : <EventsPage />}
        </Route>
        <Route path="/events/:id">
          {() => !auth.user ? <Redirect to="/login" /> : <EventDetailPage />}
        </Route>
        <Route path="/equipment">
          {() => {
            if (!auth.user) return <Redirect to="/login" />;
            if (!isSuporte(auth.user.role)) return <Redirect to="/" />;
            return <EquipmentPage />;
          }}
        </Route>
        <Route path="/technicians">
          {() => {
            if (!auth.user) return <Redirect to="/login" />;
            if (!isSuporte(auth.user.role)) return <Redirect to="/" />;
            return <TechniciansPage />;
          }}
        </Route>

        <Route component={NotFound} />
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
