import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  CalendarDays, 
  MonitorDot, 
  Users,
  ShieldAlert,
  LogOut,
  ChevronDown,
  UserCog,
  Calendar
} from "lucide-react";
import { useAuth, isSuporte, isAdmin, roleLabel } from "@/hooks/use-autenticacao";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { title: "Painel", url: "/", icon: LayoutDashboard, acesso: true },
    { title: "Calendário", url: "/calendario", icon: Calendar, acesso: true },
    { title: "Eventos Itinerantes", url: "/eventos", icon: CalendarDays, acesso: true },
    { title: "Equipamentos", url: "/equipamentos", icon: MonitorDot, acesso: isSuporte(user?.role ?? "") },
    { title: "Técnicos", url: "/tecnicos", icon: Users, acesso: isSuporte(user?.role ?? "") },
  ].filter(item => item.acesso);

  const iniciais = user?.name
    .split(" ")
    .slice(0, 2)
    .map(p => p[0])
    .join("")
    .toUpperCase() ?? "?";

  return (
    <Sidebar className="border-r border-sidebar-border" style={{ backgroundColor: "hsl(152, 70%, 16%)" }}>
      <SidebarHeader className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-white/15 p-2 rounded-xl text-white shadow-lg shadow-black/20">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">DPE-GO</h1>
            <p className="text-xs text-green-300/80">Gestão de Itinerantes</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-green-300/60 mt-4 mb-2 text-xs font-semibold tracking-wider uppercase">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        my-1 px-4 py-3 h-auto transition-all duration-200 rounded-lg
                        ${isActive
                          ? "bg-white/15 text-white font-semibold border-l-2 border-green-300"
                          : "text-green-100 hover:bg-white/10 hover:text-white"
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon size={18} className={isActive ? "text-green-300" : "text-green-300/70"} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin(user?.role ?? "") && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-green-300/60 mt-2 mb-2 text-xs font-semibold tracking-wider uppercase">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[{ title: "Gerenciar Usuários", url: "/administracao/usuarios", icon: UserCog }].map(item => {
                  const isActive = location.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`
                          my-1 px-4 py-3 h-auto transition-all duration-200 rounded-lg
                          ${isActive
                            ? "bg-white/15 text-white font-semibold border-l-2 border-green-300"
                            : "text-green-100 hover:bg-white/10 hover:text-white"
                          }
                        `}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon size={18} className={isActive ? "text-green-300" : "text-green-300/70"} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-testid="button-user-menu"
              className="flex items-center gap-3 w-full rounded-xl p-3 hover:bg-white/10 transition-colors text-left"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-sm font-semibold text-green-800" style={{ backgroundColor: "hsl(152, 60%, 80%)" }}>
                  {iniciais}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-green-300/70 truncate">{roleLabel(user?.role ?? "")}</p>
              </div>
              <ChevronDown size={14} className="text-green-300/50 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48 mb-1">
            <DropdownMenuItem
              data-testid="button-logout"
              onClick={() => logout()}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut size={15} className="mr-2" />
              Sair do sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex min-h-screen w-full" style={{ backgroundColor: "hsl(152, 30%, 97%)" }}>
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <header className="flex items-center h-16 px-6 bg-white border-b border-green-100 sticky top-0 z-50 shadow-sm">
            <SidebarTrigger className="mr-4 text-muted-foreground hover:text-foreground transition-colors" />
          </header>
          <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
