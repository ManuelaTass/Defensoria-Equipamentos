import { Layout } from "@/components/layout";
import { 
  useEvent, 
  useUpdateEvent, 
  useAddEventEquipment, 
  useUpdateEquipmentStatus, 
  useAddEventTechnician, 
  useUpdateEventTechnician 
} from "@/hooks/use-events";
import { useEquipmentList } from "@/hooks/use-equipment";
import { useUsers } from "@/hooks/use-users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useParams, Link } from "wouter";
import { Loader2, ArrowLeft, Calendar, MapPin, CheckCircle2, ChevronRight, Package, UserPlus, Plus } from "lucide-react";
import { EventStatusBadge, EventEquipmentStatusBadge } from "@/components/status-badges";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id, 10);
  
  const { data: event, isLoading } = useEvent(eventId);
  const { data: allEquipment } = useEquipmentList();
  const { data: allUsers } = useUsers();
  
  const updateEvent = useUpdateEvent();
  const addEquipment = useAddEventEquipment();
  const updateEqStatus = useUpdateEquipmentStatus();
  const addTechnician = useAddEventTechnician();
  const updateTechnician = useUpdateEventTechnician();

  const [isEqDialogOpen, setIsEqDialogOpen] = useState(false);
  const [isTechDialogOpen, setIsTechDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Evento não encontrado</h2>
          <Link href="/events" className="text-primary mt-4 inline-block hover:underline">Voltar para eventos</Link>
        </div>
      </Layout>
    );
  }

  const handleAddEquipment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addEquipment.mutate({
      eventId: event.id,
      equipmentId: parseInt(formData.get("equipmentId") as string, 10),
      status: "requested"
    }, {
      onSuccess: () => setIsEqDialogOpen(false)
    });
  };

  const handleAddTechnician = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addTechnician.mutate({
      eventId: event.id,
      technicianId: parseInt(formData.get("technicianId") as string, 10),
      daysParticipating: parseInt(formData.get("daysParticipating") as string, 10),
      ticketCreated: false
    }, {
      onSuccess: () => setIsTechDialogOpen(false)
    });
  };

  const availableEquipmentToAdd = allEquipment?.filter(eq => 
    !event.equipment.some(ee => ee.equipmentId === eq.id)
  ) || [];

  const availableTechsToAdd = allUsers?.filter(u => 
    ['technician', 'defender', 'advisor', 'almoxarifado'].includes(u.role) && !event.technicians.some(et => et.technicianId === u.id)
  ) || [];

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/events" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {event.location}</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {format(new Date(event.startDate), "dd 'de' MMMM", { locale: ptBR })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Status do Evento:</span>
            <Select 
              value={event.status} 
              onValueChange={(val) => updateEvent.mutate({ id: event.id, status: val })}
              disabled={updateEvent.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planejamento</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-secondary/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Resumo</TabsTrigger>
          <TabsTrigger value="equipment" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Equipamentos</TabsTrigger>
          <TabsTrigger value="technicians" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Técnicos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Detalhes do Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium text-foreground">{event.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Início</p>
                    <p className="font-medium text-foreground">{format(new Date(event.startDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Término</p>
                    <p className="font-medium text-foreground">{format(new Date(event.endDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status Geral</p>
                  <EventStatusBadge status={event.status} />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Localização no Mapa
                  </p>
                  <div className="h-[250px] w-full rounded-xl border overflow-hidden shadow-inner bg-secondary/20 relative group">
                     <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSy...&q=${encodeURIComponent(event.location)}`}
                      allowFullScreen
                      className="grayscale opacity-80 contrast-125"
                    ></iframe>
                    <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px] group-hover:backdrop-blur-none transition-all cursor-default pointer-events-none">
                       <div className="bg-background/90 px-4 py-2 rounded-full shadow-lg border border-primary/20 flex items-center gap-2 animate-bounce">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-primary">MAPA ATIVO: {event.location}</span>
                       </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 text-xs gap-2" asChild>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noreferrer">
                      Abrir no Google Maps <ChevronRight className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-border/50 bg-primary/5 border-primary/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Resumo Operacional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary"><Package className="w-5 h-5"/></div>
                    <div>
                      <p className="font-medium text-foreground">Equipamentos</p>
                      <p className="text-sm text-muted-foreground">{event.equipment.filter(e => e.status === 'ready' || e.status === 'deployed').length} / {event.equipment.length} prontos/enviados</p>
                    </div>
                  </div>
                  <Link href="#equipment" className="text-primary hover:underline text-sm font-medium">Ver Lista</Link>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-600"><UserPlus className="w-5 h-5"/></div>
                    <div>
                      <p className="font-medium text-foreground">Técnicos Alocados</p>
                      <p className="text-sm text-muted-foreground">{event.technicians.length} na equipe</p>
                    </div>
                  </div>
                  <Link href="#technicians" className="text-primary hover:underline text-sm font-medium">Gerenciar</Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="animate-in fade-in-50 duration-300">
          <Card className="shadow-md border-border/50">
            <CardHeader className="flex flex-row items-center justify-between bg-secondary/20 border-b pb-4">
              <div>
                <CardTitle>Fluxo de Equipamentos</CardTitle>
                <CardDescription>Acompanhe o teste e envio dos itens.</CardDescription>
              </div>
              <Dialog open={isEqDialogOpen} onOpenChange={setIsEqDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2"/> Adicionar</Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddEquipment}>
                    <DialogHeader>
                      <DialogTitle>Vincular Equipamento</DialogTitle>
                      <DialogDescription>Selecione um equipamento do inventário geral.</DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                      <Label htmlFor="equipmentId" className="mb-2 block">Selecione o Equipamento</Label>
                      <Select name="equipmentId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableEquipmentToAdd.map(eq => (
                            <SelectItem key={eq.id} value={eq.id.toString()}>
                              {eq.name} - SN: {eq.serialNumber} ({eq.status})
                            </SelectItem>
                          ))}
                          {availableEquipmentToAdd.length === 0 && (
                            <SelectItem value="none" disabled>Nenhum equipamento disponível</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsEqDialogOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={addEquipment.isPending || availableEquipmentToAdd.length === 0}>Vincular</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {event.equipment.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhum equipamento vinculado a este evento.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Item & Patrimônio</TableHead>
                      <TableHead>Status Atual</TableHead>
                      <TableHead className="w-[200px]">Atualizar Fluxo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {event.equipment.map((item) => (
                      <TableRow key={item.id} className="hover:bg-secondary/10">
                        <TableCell>
                          <div className="font-medium text-foreground">{item.equipment.name}</div>
                          <div className="text-xs text-muted-foreground mt-1 bg-secondary/50 inline-block px-2 py-0.5 rounded border">SN: {item.equipment.serialNumber}</div>
                        </TableCell>
                        <TableCell>
                          <EventEquipmentStatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={item.status} 
                            onValueChange={(val) => updateEqStatus.mutate({ eventId: event.id, equipmentId: item.id, status: val })}
                            disabled={updateEqStatus.isPending}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="requested">Solicitado</SelectItem>
                              <SelectItem value="testing">Em Teste</SelectItem>
                              <SelectItem value="ready">Pronto</SelectItem>
                              <SelectItem value="deployed">Enviado</SelectItem>
                              <SelectItem value="returned">Retornado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="animate-in fade-in-50 duration-300">
          <div className="space-y-6">
            {/* Defensores e Assessores */}
            <Card className="shadow-md border-border/50">
              <CardHeader className="flex flex-row items-center justify-between bg-emerald-50/20 border-b pb-4">
                <div>
                  <CardTitle className="text-emerald-800">Defensores e Assessores</CardTitle>
                  <CardDescription>Membros jurídicos escalados para o atendimento.</CardDescription>
                </div>
                <Dialog open={isTechDialogOpen} onOpenChange={setIsTechDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary hover:bg-primary/90"><UserPlus className="w-4 h-4 mr-2"/> Adicionar Membro</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddTechnician}>
                      <DialogHeader>
                        <DialogTitle>Vincular Membro à Equipe</DialogTitle>
                        <DialogDescription>Adicione um defensor, assessor ou técnico para este evento.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-5 py-6">
                        <div className="grid gap-2">
                          <Label htmlFor="technicianId">Selecione o Servidor</Label>
                          <Select name="technicianId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTechsToAdd.map(t => (
                                <SelectItem key={t.id} value={t.id.toString()}>{t.name} ({t.role})</SelectItem>
                              ))}
                              {availableTechsToAdd.length === 0 && (
                                <SelectItem value="none" disabled>Nenhum membro disponível</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="daysParticipating">Dias de Participação</Label>
                          <Input type="number" id="daysParticipating" name="daysParticipating" min="1" defaultValue="1" required />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsTechDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={addTechnician.isPending || availableTechsToAdd.length === 0}>Vincular</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                {event.technicians.filter(t => ['defender', 'advisor'].includes(t.technician.role)).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground italic text-sm">
                    Nenhum defensor ou assessor vinculado.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead className="text-right">Chamado GLPI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {event.technicians.filter(t => ['defender', 'advisor'].includes(t.technician.role)).map((tech) => (
                        <TableRow key={tech.id}>
                          <TableCell className="font-medium">{tech.technician.name}</TableCell>
                          <TableCell>
                            {tech.technician.role === 'defender' ? 'Defensor(a)' : 'Assessor(a)'}
                          </TableCell>
                          <TableCell>{tech.daysParticipating}</TableCell>
                          <TableCell className="text-right">
                            <Switch 
                              checked={tech.ticketCreated} 
                              onCheckedChange={(checked) => updateTechnician.mutate({ eventId: event.id, technicianId: tech.id, ticketCreated: checked })}
                              disabled={updateTechnician.isPending}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Equipe Técnica (TI e Almoxarifado) */}
            <Card className="shadow-md border-border/50">
              <CardHeader className="bg-blue-50/20 border-b pb-4">
                <CardTitle className="text-blue-800">Equipe de TI e Apoio</CardTitle>
                <CardDescription>Técnicos e responsáveis pelo Almoxarifado.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {event.technicians.filter(t => ['technician', 'almoxarifado'].includes(t.technician.role)).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground italic text-sm">
                    Nenhum técnico vinculado.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Dias</TableHead>
                        <TableHead className="text-right">Chamado GLPI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {event.technicians.filter(t => ['technician', 'almoxarifado'].includes(t.technician.role)).map((tech) => (
                        <TableRow key={tech.id}>
                          <TableCell className="font-medium">{tech.technician.name}</TableCell>
                          <TableCell>
                            {tech.technician.role === 'technician' ? 'Técnico de TI' : 'Almoxarifado'}
                          </TableCell>
                          <TableCell>{tech.daysParticipating}</TableCell>
                          <TableCell className="text-right">
                            <Switch 
                              checked={tech.ticketCreated} 
                              onCheckedChange={(checked) => updateTechnician.mutate({ eventId: event.id, technicianId: tech.id, ticketCreated: checked })}
                              disabled={updateTechnician.isPending}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
