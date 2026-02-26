import { Layout } from "@/components/layout";
import { useEvents, useCreateEvent } from "@/hooks/use-events";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Plus, Search, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { useState } from "react";
import { EventStatusBadge } from "@/components/status-badges";
import { Link } from "wouter";

export default function EventsPage() {
  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const formatDateTimeLocal = (d?: Date) => d ? new Date(d).toISOString().slice(0, 16) : '';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createEvent.mutate({
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      status: 'planning'
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
      }
    });
  };

  const filteredEvents = events?.filter(evt => 
    evt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    evt.location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos Itinerantes</h1>
          <p className="text-muted-foreground mt-1">Gerencie os eventos e expedições da Defensoria.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Criar Novo Itinerante</DialogTitle>
                <DialogDescription>
                  Preencha os dados básicos do evento para iniciar o planejamento.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-5 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Evento</Label>
                  <Input id="name" name="name" placeholder="Ex: Itinerante - Aparecida de Goiânia" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Local</Label>
                  <Input id="location" name="location" placeholder="Ex: Praça da Matriz" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Início</Label>
                    <Input id="startDate" name="startDate" type="datetime-local" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">Término</Label>
                    <Input id="endDate" name="endDate" type="datetime-local" required />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createEvent.isPending}>
                  {createEvent.isPending ? "Criando..." : "Salvar Evento"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg border-border/50 overflow-hidden">
        <div className="p-4 border-b bg-card flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar eventos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary/20 border-transparent focus-visible:border-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
            <p>Nenhum evento encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="font-semibold text-foreground">Evento</TableHead>
                <TableHead className="font-semibold text-foreground">Local</TableHead>
                <TableHead className="font-semibold text-foreground">Período</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((evt) => (
                <TableRow key={evt.id} className="hover:bg-secondary/10 transition-colors">
                  <TableCell className="font-medium">{evt.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" /> {evt.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(evt.startDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
                      <div className="text-muted-foreground text-xs mt-0.5">até {format(new Date(evt.endDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <EventStatusBadge status={evt.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/events/${evt.id}`}>
                      <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary transition-colors">
                        Gerenciar
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </Layout>
  );
}
