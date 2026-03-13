import { Layout } from "@/components/layout";
import { useEvents } from "@/hooks/use-events";
import { useEquipmentList } from "@/hooks/use-equipment";
import { useUsers } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Calendar, Monitor, Activity, MapPin, Users, Package, ChevronRight, Ticket, FileText } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CONFIG: Record<string, {
  label: string;
  bg: string;
  border: string;
  headerBg: string;
  badge: string;
  dot: string;
  text: string;
}> = {
  planning: {
    label: "Planejamento",
    bg: "bg-blue-50/70",
    border: "border-blue-200",
    headerBg: "bg-blue-100/60",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
    text: "text-blue-800",
  },
  in_progress: {
    label: "Em Andamento",
    bg: "bg-emerald-50/70",
    border: "border-emerald-200",
    headerBg: "bg-emerald-100/60",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    text: "text-emerald-800",
  },
  completed: {
    label: "Concluído",
    bg: "bg-gray-50/70",
    border: "border-gray-200",
    headerBg: "bg-gray-100/60",
    badge: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
    text: "text-gray-700",
  },
  cancelled: {
    label: "Cancelado",
    bg: "bg-red-50/50",
    border: "border-red-100",
    headerBg: "bg-red-50",
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-400",
    text: "text-red-700",
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

  const statCards = [
    { label: "Eventos em Andamento", value: activeEvents.length, icon: Activity, href: "/events?status=in_progress", color: "text-emerald-600 bg-emerald-50" },
    { label: "Eventos Planejados", value: planningEvents.length, icon: Calendar, href: "/events?status=planning", color: "text-blue-600 bg-blue-50" },
    { label: "Equips. em Uso", value: equipmentInUse.length, icon: Monitor, href: "/equipment?status=in_use", color: "text-amber-600 bg-amber-50" },
    { label: "Servidores Cadastrados", value: (users?.length || 0), icon: Users, href: "/technicians", color: "text-purple-600 bg-purple-50" },
  ];

  const allEvents = [...(events || [])].sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

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
      <Card className="shadow-md border-border/50 overflow-hidden">
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
          {allEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm">Nenhum evento cadastrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {allEvents.map(event => {
                const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.planning;
                const ev = event as any;
                return (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className={`rounded-xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col`}>
                      {/* Colored header strip */}
                      <div className={`${cfg.headerBg} px-4 py-2.5 flex items-center justify-between gap-2`}>
                        <h3 className={`font-semibold text-sm ${cfg.text} leading-tight group-hover:underline line-clamp-1`}>
                          {event.name.trim()}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 flex-shrink-0 ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-3 flex flex-col gap-2 flex-1">
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary/50" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-primary/50" />
                          <span>
                            {format(new Date(event.startDate), "dd/MM/yy", { locale: ptBR })}
                            {" – "}
                            {format(new Date(event.endDate), "dd/MM/yy", { locale: ptBR })}
                          </span>
                        </div>

                        {/* GLPI + Processo */}
                        {(ev.glpiTicket || ev.processNumber) && (
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {ev.glpiTicket && (
                              <span className="flex items-center gap-1 text-xs bg-blue-50 border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                                <Ticket className="h-2.5 w-2.5" />
                                {ev.glpiTicket.startsWith("http") ? "Chamado GLPI" : `GLPI: ${ev.glpiTicket}`}
                              </span>
                            )}
                            {ev.processNumber && (
                              <span className="flex items-center gap-1 text-xs bg-amber-50 border border-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-medium">
                                <FileText className="h-2.5 w-2.5" />
                                {ev.processNumber}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Counts footer */}
                        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-current/5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {ev.technicianCount ?? 0} servidor{ev.technicianCount !== 1 ? 'es' : ''}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Package className="h-3 w-3" />
                            {ev.equipmentCount ?? 0} equip.
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
