import { Layout } from "@/components/layout";
import { useEvents } from "@/hooks/use-events";
import { useEquipmentList } from "@/hooks/use-equipment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Calendar, Monitor, Users, Activity } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: events, isLoading: loadingEvents } = useEvents();
  const { data: equipment, isLoading: loadingEquip } = useEquipmentList();

  if (loadingEvents || loadingEquip) {
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
  const equipmentMaintenance = equipment?.filter(e => e.status === 'maintenance') || [];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Painel de Controle</h1>
        <p className="text-muted-foreground mt-2">Resumo das operações de Itinerantes e Almoxarifado.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos em Andamento</p>
                <h3 className="text-3xl font-bold mt-2">{activeEvents.length}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos Planejados</p>
                <h3 className="text-3xl font-bold mt-2">{planningEvents.length}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Equips. em Uso</p>
                <h3 className="text-3xl font-bold mt-2">{equipmentInUse.length}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
                <Monitor className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Equips. em Manutenção</p>
                <h3 className="text-3xl font-bold mt-2">{equipmentMaintenance.length}</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl text-red-600">
                <Monitor className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-md border-border/50">
          <CardHeader className="bg-secondary/30 border-b pb-4">
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Eventos marcados como em planejamento.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {planningEvents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p>Nenhum evento planejado no momento.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {planningEvents.slice(0, 5).map(event => (
                  <li key={event.id} className="p-4 hover:bg-secondary/20 transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{event.name}</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                    <Link href={`/events/${event.id}`} className="text-sm font-medium text-primary hover:underline bg-primary/5 px-3 py-1 rounded-full">
                      Ver detalhes
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50">
          <CardHeader className="bg-secondary/30 border-b pb-4">
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Atalhos para tarefas comuns.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/events" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all group">
              <Calendar className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
              <span className="font-semibold text-foreground group-hover:text-primary">Gerenciar Eventos</span>
            </Link>
            <Link href="/equipment" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all group">
              <Monitor className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
              <span className="font-semibold text-foreground group-hover:text-primary">Cadastrar Equipamento</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
