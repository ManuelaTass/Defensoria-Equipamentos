import { Layout } from "@/components/layout";
import { 
  useEvent, 
  useUpdateEvent, 
  useAddEventEquipment, 
  useUpdateEquipmentStatus, 
  useAddEventTechnician, 
  useUpdateEventTechnician 
} from "@/hooks/use-eventos";
import { useEquipmentList } from "@/hooks/use-equipamentos";
import { useUsers } from "@/hooks/use-usuarios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useParams, Link } from "wouter";
import { Loader2, ArrowLeft, Calendar, MapPin, ChevronRight, Package, UserPlus, Plus, Pencil, Trash2, Ticket, FileText } from "lucide-react";
import { EventStatusBadge, EventEquipmentStatusBadge } from "@/components/badges-status";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, isSuporte } from "@/hooks/use-autenticacao";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id, 10);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const podeEditar = isSuporte(user?.role ?? "");
  
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
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);

  const deleteEventEquipment = useMutation({
    mutationFn: async (eeId: number) => {
      await apiRequest("DELETE", `/api/events/${eventId}/equipment/${eeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      toast({ title: "Removido", description: "Equipamento removido do evento." });
    }
  });

  const deleteEventTechnician = useMutation({
    mutationFn: async (etId: number) => {
      await apiRequest("DELETE", `/api/events/${eventId}/technicians/${etId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      toast({ title: "Removido", description: "Membro removido do evento." });
    }
  });

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
          <Link href="/eventos" className="text-primary mt-4 inline-block hover:underline">Voltar para eventos</Link>
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
    }, { onSuccess: () => setIsEqDialogOpen(false) });
  };

  const handleAddTechnician = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addTechnician.mutate({
      eventId: event.id,
      technicianId: parseInt(formData.get("technicianId") as string, 10),
      daysParticipating: parseInt(formData.get("daysParticipating") as string, 10),
      ticketCreated: false,
      attended: false,
    }, { onSuccess: () => setIsTechDialogOpen(false) });
  };

  const handleEditEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateEvent.mutate({
      id: event.id,
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      glpiTicket: formData.get("glpiTicket") as string || null,
      processNumber: formData.get("processNumber") as string || null,
    }, { onSuccess: () => {
      setIsEditEventOpen(false);
      toast({ title: "Salvo", description: "Detalhes do evento atualizados." });
    }});
  };

  const availableEquipmentToAdd = allEquipment?.filter(eq => 
    !event.equipment.some(ee => ee.equipmentId === eq.id)
  ) || [];

  const availableTechsToAdd = allUsers?.filter(u => 
    ['technician', 'defender', 'advisor', 'almoxarifado'].includes(u.role) && !event.technicians.some(et => et.technicianId === u.id)
  ) || [];

  const defenders = event.technicians.filter(t => ['defender', 'advisor'].includes(t.technician.role));
  const techTeam = event.technicians.filter(t => ['technician', 'almoxarifado'].includes(t.technician.role));

  const toDatetimeLocal = (d: Date | string) => {
    const dt = new Date(d);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/eventos" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {event.location}</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {format(new Date(event.startDate), "dd 'de' MMMM", { locale: ptBR })}</span>
              {event.glpiTicket && (
                event.glpiTicket.startsWith("http") ? (
                  <a href={event.glpiTicket} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 text-xs font-medium hover:bg-blue-100 transition-colors">
                    <Ticket className="w-3 h-3"/> Abrir Chamado GLPI
                  </a>
                ) : (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 text-xs font-medium"><Ticket className="w-3 h-3"/> GLPI: {event.glpiTicket}</span>
                )
              )}
              {event.processNumber && <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 text-xs font-medium"><FileText className="w-3 h-3"/> Proc: {event.processNumber}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {podeEditar && <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Pencil className="w-4 h-4" /> Editar Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <form onSubmit={handleEditEvent}>
                  <DialogHeader>
                    <DialogTitle>Editar Detalhes do Evento</DialogTitle>
                    <DialogDescription>Atualize as informações do itinerante.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-5">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Nome do Evento</Label>
                      <Input id="edit-name" name="name" defaultValue={event.name} required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-location">Localização</Label>
                      <Input id="edit-location" name="location" defaultValue={event.location} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-startDate">Data de Início</Label>
                        <Input id="edit-startDate" name="startDate" type="datetime-local" defaultValue={toDatetimeLocal(event.startDate)} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-endDate">Data de Término</Label>
                        <Input id="edit-endDate" name="endDate" type="datetime-local" defaultValue={toDatetimeLocal(event.endDate)} required />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-glpiTicket" className="flex items-center gap-1"><Ticket className="w-4 h-4 text-blue-600"/> Chamado GLPI</Label>
                      <Input id="edit-glpiTicket" name="glpiTicket" placeholder="Nº do chamado ou URL completa (https://...)" defaultValue={event.glpiTicket ?? ""} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-processNumber" className="flex items-center gap-1"><FileText className="w-4 h-4 text-amber-600"/> Número de Processo</Label>
                      <Input id="edit-processNumber" name="processNumber" placeholder="Ex: 202400001234" defaultValue={event.processNumber ?? ""} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditEventOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={updateEvent.isPending}>
                      {updateEvent.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>}

            <Select 
              value={event.status} 
              onValueChange={(val) => podeEditar && updateEvent.mutate({ id: event.id, status: val })}
              disabled={!podeEditar || updateEvent.isPending}
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
          <TabsTrigger value="technicians" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Equipe</TabsTrigger>
        </TabsList>

        {/* RESUMO */}
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
                {(event.glpiTicket || event.processNumber) && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    {event.glpiTicket && (
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><Ticket className="w-3 h-3"/> Chamado GLPI</p>
                        {event.glpiTicket.startsWith("http") ? (
                          <a href={event.glpiTicket} target="_blank" rel="noreferrer" className="font-medium text-blue-700 hover:underline">
                            Abrir no GLPI ↗
                          </a>
                        ) : (
                          <p className="font-medium text-blue-700">{event.glpiTicket}</p>
                        )}
                      </div>
                    )}
                    {event.processNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3"/> Nº Processo</p>
                        <p className="font-medium text-amber-700">{event.processNumber}</p>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status Geral</p>
                  <EventStatusBadge status={event.status} />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Localização no Mapa
                  </p>
                  <div className="h-[220px] w-full rounded-xl border overflow-hidden shadow-inner bg-secondary/20 relative group">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSy...&q=${encodeURIComponent(event.location)}`}
                      allowFullScreen
                      className="grayscale opacity-80 contrast-125"
                    ></iframe>
                    <div className="absolute inset-0 flex items-center justify-center bg-background/40 pointer-events-none">
                      <div className="bg-background/90 px-4 py-2 rounded-full shadow-lg border border-primary/20 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-primary">{event.location}</span>
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
                </div>
                <div className="flex items-center justify-between border-b border-primary/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-600"><UserPlus className="w-5 h-5"/></div>
                    <div>
                      <p className="font-medium text-foreground">Defensores/Assessores</p>
                      <p className="text-sm text-muted-foreground">{defenders.filter(t => t.attended).length} / {defenders.length} presentes</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-600"><UserPlus className="w-5 h-5"/></div>
                    <div>
                      <p className="font-medium text-foreground">Equipe de TI</p>
                      <p className="text-sm text-muted-foreground">{techTeam.length} na equipe</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* EQUIPAMENTOS */}
        <TabsContent value="equipment" className="animate-in fade-in-50 duration-300">
          <Card className="shadow-md border-border/50">
            <CardHeader className="flex flex-row items-center justify-between bg-secondary/20 border-b pb-4">
              <div>
                <CardTitle>Fluxo de Equipamentos</CardTitle>
                <CardDescription>Acompanhe o teste e envio dos itens.</CardDescription>
              </div>
              {podeEditar && <Dialog open={isEqDialogOpen} onOpenChange={setIsEqDialogOpen}>
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
                              {eq.name} — SN: {eq.serialNumber}
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
              </Dialog>}
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
                      <TableHead className="w-[35%]">Item & Patrimônio</TableHead>
                      <TableHead>Status Atual</TableHead>
                      <TableHead>Atualizar Fluxo</TableHead>
                      <TableHead className="w-[60px] text-right">Ações</TableHead>
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
                            <SelectTrigger className="h-8 w-[150px]">
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
                        <TableCell className="text-right">
                          {podeEditar && <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover equipamento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{item.equipment.name}" será desvinculado deste evento. O equipamento não será excluído do inventário.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => deleteEventEquipment.mutate(item.id)}
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EQUIPE */}
        <TabsContent value="technicians" className="animate-in fade-in-50 duration-300">
          <div className="space-y-6">
            <div className="flex justify-end">
              {podeEditar && <Dialog open={isTechDialogOpen} onOpenChange={setIsTechDialogOpen}>
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
                        <Label>Selecione o Servidor</Label>
                        <Select name="technicianId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTechsToAdd.map(t => (
                              <SelectItem key={t.id} value={t.id.toString()}>
                                {t.name} ({t.role === 'technician' ? 'TI' : t.role === 'defender' ? 'Defensor' : t.role === 'advisor' ? 'Assessor' : 'Almoxarifado'})
                              </SelectItem>
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
              </Dialog>}
            </div>

            {/* Defensores e Assessores */}
            <Card className="shadow-md border-border/50">
              <CardHeader className="bg-emerald-50/30 border-b pb-4">
                <CardTitle className="text-emerald-800 text-base">Defensores e Assessores</CardTitle>
                <CardDescription>Membros jurídicos escalados — marque a presença no evento.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {defenders.length === 0 ? (
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
                        <TableHead className="text-center">Presente no Evento</TableHead>
                        <TableHead className="text-right">GLPI</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {defenders.map((tech) => (
                        <TableRow key={tech.id} className={tech.attended ? "bg-emerald-50/20" : ""}>
                          <TableCell className="font-medium">{tech.technician.name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {tech.technician.role === 'defender' ? 'Defensor(a)' : 'Assessor(a)'}
                          </TableCell>
                          <TableCell>{tech.daysParticipating} dia(s)</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Checkbox
                                checked={tech.attended}
                                onCheckedChange={(checked) => updateTechnician.mutate({ eventId: event.id, technicianId: tech.id, attended: !!checked })}
                                disabled={updateTechnician.isPending}
                                className="border-emerald-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                              />
                              <span className={`text-xs font-medium ${tech.attended ? "text-emerald-600" : "text-muted-foreground"}`}>
                                {tech.attended ? "Confirmado" : "Pendente"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Switch 
                              checked={tech.ticketCreated} 
                              onCheckedChange={(checked) => updateTechnician.mutate({ eventId: event.id, technicianId: tech.id, ticketCreated: checked })}
                              disabled={updateTechnician.isPending}
                              className="data-[state=checked]:bg-emerald-500"
                            />
                          </TableCell>
                          <TableCell>
                            {podeEditar && <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {tech.technician.name} será removido da equipe deste evento.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => deleteEventTechnician.mutate(tech.id)}
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Equipe de TI */}
            <Card className="shadow-md border-border/50">
              <CardHeader className="bg-blue-50/20 border-b pb-4">
                <CardTitle className="text-blue-800 text-base">Equipe de TI e Apoio</CardTitle>
                <CardDescription>Técnicos e responsáveis pelo Almoxarifado.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {techTeam.length === 0 ? (
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
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {techTeam.map((tech) => (
                        <TableRow key={tech.id}>
                          <TableCell className="font-medium">{tech.technician.name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {tech.technician.role === 'technician' ? 'Técnico de TI' : 'Almoxarifado'}
                          </TableCell>
                          <TableCell>{tech.daysParticipating} dia(s)</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-2">
                              <span className="text-xs text-muted-foreground">{tech.ticketCreated ? "Criado" : "Pendente"}</span>
                              <Switch 
                                checked={tech.ticketCreated} 
                                onCheckedChange={(checked) => updateTechnician.mutate({ eventId: event.id, technicianId: tech.id, ticketCreated: checked })}
                                disabled={updateTechnician.isPending}
                                className="data-[state=checked]:bg-blue-500"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            {podeEditar && <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {tech.technician.name} será removido da equipe deste evento.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => deleteEventTechnician.mutate(tech.id)}
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>}
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
