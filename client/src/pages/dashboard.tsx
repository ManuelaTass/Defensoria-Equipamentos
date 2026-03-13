import { Layout } from "@/components/layout";
import { useEvents } from "@/hooks/use-events";
import { useEquipmentList } from "@/hooks/use-equipment";
import { useUsers } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Monitor, Activity, MapPin, Users, Package, ChevronRight, ShieldCheck, Cpu } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG: Record<string, {
  label: string;
  bg: string;
  border: string;
  badge: string;
  dot: string;
}> = {
  planning: {
    label: "Planejamento",
    bg: "bg-blue-50/60",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
  },
  in_progress: {
    label: "Em Andamento",
    bg: "bg-emerald-50/60",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Concluído",
    bg: "bg-gray-50/60",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
  cancelled: {
    label: "Cancelado",
    bg: "bg-red-50/40",
    border: "border-red-100",
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-400",
  },
};

export default function Dashboard() {
  const { data: events, isLoading: loadingEvents } = useEvents();
  const { data: equipment, isLoading: loadingEquip } = useEquipmentList();
  const { data: users, isLoading: loadingUsers } = useUsers();

  if (loadingEvents || loadingEquip || loadingUsers) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const activeEvents = events?.filter(e => e.status === 'in_progress') || [];
  const planningEvents = events?.filter(e => e.status === 'planning') || [];
  const equipmentInUse = equipment?.filter(e => e.status === 'in_use') || [];
  const legalTeam = users?.filter(u => ['defender', 'advisor'].includes(u.role)) || [];
  const techTeam = users?.filter(u => ['technician', 'almoxarifado'].includes(u.role)) || [];

  const statCards = [
    { label: "Eventos em Andamento", value: activeEvents.length, icon: Activity, href: "/events", color: "text-emerald-600 bg-emerald-50" },
    { label: "Eventos Planejados", value: planningEvents.length, icon: Calendar, href: "/events", color: "text-blue-600 bg-blue-50" },
    { label: "Equips. em Uso", value: equipmentInUse.length, icon: Monitor, href: "/equipment", color: "text-amber-600 bg-amber-50" },
    { label: "Servidores Cadastrados", value: (users?.length || 0), icon: Users, href: "/technicians", color: "text-purple-600 bg-purple-50" },
  ];

  const recentEvents = [...(events || [])].sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  ).slice(0, 8);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Painel de Controle</h1>
        <p className="text-muted-foreground mt-2">Resumo das operações de Itinerantes e Almoxarifado.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="border border-border shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground leading-tight">{card.label}</p>
                    <h3 className="text-3xl font-bold mt-2 text-foreground">{card.value}</h3>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.color} group-hover:opacity-80 transition-opacity`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Events Panel */}
      <Card className="shadow-md border-border/50 mb-8 overflow-hidden">
        <CardHeader className="bg-secondary/30 border-b pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Todos os Eventos</CardTitle>
            <CardDescription>Visão geral com status, localização e equipe.</CardDescription>
          </div>
          <Link href="/events">
            <span className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="h-3 w-3" />
            </span>
          </Link>
        </CardHeader>
        <CardContent className="p-4">
          {recentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">Nenhum evento cadastrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {recentEvents.map(event => {
                const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.planning;
                const startDate = new Date(event.startDate);
                const endDate = new Date(event.endDate);
                return (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 hover:shadow-md transition-all cursor-pointer group h-full flex flex-col gap-3`}>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {event.name.trim()}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-primary/60" />
                        <span>
                          {format(startDate, "dd/MM/yyyy", { locale: ptBR })}
                          {" – "}
                          {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-current/5">
                        {(event as any).technicianCount !== undefined && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {(event as any).technicianCount} servidor{(event as any).technicianCount !== 1 ? 'es' : ''}
                          </span>
                        )}
                        {(event as any).equipmentCount !== undefined && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Package className="h-3 w-3" />
                            {(event as any).equipmentCount} equip.
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom row: team summary + equipment summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md border-border/50">
          <CardHeader className="bg-secondary/30 border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Equipe Cadastrada</CardTitle>
              <Link href="/technicians">
                <span className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                  Gerenciar <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex gap-4">
            <div className="flex-1 flex items-center gap-3 rounded-xl bg-emerald-50/50 border border-emerald-100 p-3">
              <ShieldCheck className="h-8 w-8 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-emerald-700">{legalTeam.length}</p>
                <p className="text-xs text-emerald-600/80 font-medium">Defensores / Assessores</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3 rounded-xl bg-blue-50/50 border border-blue-100 p-3">
              <Cpu className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{techTeam.length}</p>
                <p className="text-xs text-blue-600/80 font-medium">TI / Almoxarifado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50">
          <CardHeader className="bg-secondary/30 border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Inventário de Equipamentos</CardTitle>
              <Link href="/equipment">
                <span className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                  Gerenciar <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-3 gap-3">
            {[
              { label: "Disponíveis", count: equipment?.filter(e => e.status === 'available').length || 0, cls: "bg-emerald-50 border-emerald-100 text-emerald-700" },
              { label: "Em Uso", count: equipment?.filter(e => e.status === 'in_use').length || 0, cls: "bg-blue-50 border-blue-100 text-blue-700" },
              { label: "Manutenção", count: equipment?.filter(e => e.status === 'maintenance').length || 0, cls: "bg-amber-50 border-amber-100 text-amber-700" },
            ].map(item => (
              <div key={item.label} className={`rounded-xl border p-3 text-center ${item.cls}`}>
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-xs font-medium opacity-80">{item.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
