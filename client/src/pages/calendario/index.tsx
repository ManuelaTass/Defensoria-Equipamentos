import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { useEvents } from "@/hooks/use-eventos";
import { useCreateEvent } from "@/hooks/use-eventos";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Plus,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, isSuporte } from "@/hooks/use-autenticacao";
import type { Event } from "@shared/schema";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const STATUS_COR: Record<string, string> = {
  planning: "bg-amber-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-600",
  cancelled: "bg-gray-400",
};

const STATUS_LABEL: Record<string, string> = {
  planning: "Planejamento",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_BADGE: Record<string, string> = {
  planning: "bg-amber-100 text-amber-800 border-amber-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

function dataParaLocal(d: string | Date) {
  const dt = new Date(d);
  return new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
}

function eventoNoDia(evento: Event, dia: Date): boolean {
  const inicio = dataParaLocal(evento.startDate);
  const fim = dataParaLocal(evento.endDate);
  const d = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
  return d >= inicio && d <= fim;
}

function formatarData(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatarDataCurta(d: string | Date) {
  const dt = dataParaLocal(d);
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

type FormNovoEvento = {
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
};

export default function CalendarioPage() {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(hoje);
  const [criarAberto, setCriarAberto] = useState(false);
  const [diaNovoEvento, setDiaNovoEvento] = useState<Date | null>(null);
  const [form, setForm] = useState<FormNovoEvento>({
    name: "", location: "", startDate: "", endDate: "", status: "planning"
  });

  const { data: eventos, isLoading } = useEvents();
  const criarEvento = useCreateEvent();
  const { user } = useAuth();
  const podeEditar = isSuporte(user?.role ?? "");

  const diasDoMes = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const dias: (Date | null)[] = [];
    for (let i = 0; i < primeiroDia.getDay(); i++) dias.push(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(new Date(ano, mes, d));
    return dias;
  }, [mesAtual]);

  const eventosNoDia = useMemo(() => {
    if (!diaSelecionado || !eventos) return [];
    return eventos.filter(e => eventoNoDia(e, diaSelecionado));
  }, [diaSelecionado, eventos]);

  const eventosPorDia = useMemo(() => {
    if (!eventos) return {};
    const mapa: Record<string, Event[]> = {};
    diasDoMes.forEach(dia => {
      if (!dia) return;
      const chave = dia.toISOString().split("T")[0];
      mapa[chave] = eventos.filter(e => eventoNoDia(e, dia));
    });
    return mapa;
  }, [eventos, diasDoMes]);

  function mesAnterior() {
    setMesAtual(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }
  function proximoMes() {
    setMesAtual(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }
  function irParaHoje() {
    setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    setDiaSelecionado(hoje);
  }

  function abrirCriarEvento(dia: Date) {
    const isoDate = [
      dia.getFullYear(),
      String(dia.getMonth() + 1).padStart(2, "0"),
      String(dia.getDate()).padStart(2, "0"),
    ].join("-");
    setDiaNovoEvento(dia);
    setForm(f => ({ ...f, startDate: isoDate, endDate: isoDate }));
    setCriarAberto(true);
  }

  function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    criarEvento.mutate(
      {
        name: form.name,
        location: form.location,
        startDate: new Date(form.startDate + "T08:00:00"),
        endDate: new Date(form.endDate + "T18:00:00"),
        status: form.status,
      },
      {
        onSuccess: () => {
          setCriarAberto(false);
          setForm({ name: "", location: "", startDate: "", endDate: "", status: "planning" });
        }
      }
    );
  }

  const ehHoje = (dia: Date) => {
    return dia.getDate() === hoje.getDate() &&
      dia.getMonth() === hoje.getMonth() &&
      dia.getFullYear() === hoje.getFullYear();
  };

  const ehSelecionado = (dia: Date) => {
    return diaSelecionado !== null &&
      dia.getDate() === diaSelecionado.getDate() &&
      dia.getMonth() === diaSelecionado.getMonth() &&
      dia.getFullYear() === diaSelecionado.getFullYear();
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário de Eventos</h1>
          <p className="text-muted-foreground mt-1">Visualize os eventos itinerantes por data.</p>
        </div>
        {podeEditar && (
          <Button
            data-testid="button-novo-evento-calendario"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            onClick={() => abrirCriarEvento(diaSelecionado ?? hoje)}
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Evento
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendário */}
        <Card className="flex-1 p-6 shadow-lg border-border/50">
          {/* Cabeçalho do mês */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={mesAnterior} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold min-w-[180px] text-center">
                {MESES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
              </h2>
              <Button variant="outline" size="icon" onClick={proximoMes} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={irParaHoje} className="text-xs">
              Hoje
            </Button>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COR[k]}`} />
                <span className="text-muted-foreground">{v}</span>
              </div>
            ))}
          </div>

          {/* Grade dos dias da semana */}
          <div className="grid grid-cols-7 mb-2">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grade dos dias */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando eventos...</div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {diasDoMes.map((dia, idx) => {
                if (!dia) return <div key={`vazio-${idx}`} />;
                const chave = dia.toISOString().split("T")[0];
                const evsDia = eventosPorDia[chave] ?? [];
                const isHoje = ehHoje(dia);
                const isSel = ehSelecionado(dia);

                return (
                  <button
                    key={chave}
                    data-testid={`dia-${chave}`}
                    onClick={() => setDiaSelecionado(dia)}
                    className={`
                      relative min-h-[72px] p-1.5 rounded-lg text-left transition-all border
                      ${isSel
                        ? "bg-primary/10 border-primary shadow-sm"
                        : isHoje
                          ? "bg-green-50 border-green-300"
                          : "border-transparent hover:bg-secondary/30 hover:border-border"
                      }
                    `}
                  >
                    <span className={`
                      text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full mb-1
                      ${isHoje ? "bg-primary text-primary-foreground" : isSel ? "text-primary" : "text-foreground"}
                    `}>
                      {dia.getDate()}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {evsDia.slice(0, 3).map(ev => (
                        <div
                          key={ev.id}
                          className={`w-full h-1.5 rounded-full ${STATUS_COR[ev.status] ?? "bg-gray-400"}`}
                          title={ev.name}
                        />
                      ))}
                      {evsDia.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{evsDia.length - 3}</span>
                      )}
                    </div>
                    {podeEditar && evsDia.length === 0 && (
                      <span
                        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); abrirCriarEvento(dia); }}
                      >
                        <Plus className="h-4 w-4 text-muted-foreground/50" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Painel lateral: eventos do dia selecionado */}
        <div className="lg:w-80 flex flex-col gap-4">
          <Card className="p-5 shadow-lg border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">
                {diaSelecionado
                  ? formatarData(diaSelecionado)
                  : "Selecione um dia"}
              </h3>
            </div>

            {diaSelecionado && eventosNoDia.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-20" />
                Nenhum evento neste dia
              </div>
            )}

            <div className="flex flex-col gap-3">
              {eventosNoDia.map(ev => (
                <div
                  key={ev.id}
                  className="border border-border/60 rounded-xl p-4 bg-white/60 hover:bg-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm leading-tight">{ev.name.trim()}</h4>
                    <Badge
                      variant="outline"
                      className={`text-[10px] whitespace-nowrap shrink-0 ${STATUS_BADGE[ev.status]}`}
                    >
                      {STATUS_LABEL[ev.status] ?? ev.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>{ev.location}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {formatarDataCurta(ev.startDate)} → {formatarDataCurta(ev.endDate)}
                  </div>
                  <Link href={`/eventos/${ev.id}`}>
                    <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1.5">
                      <ExternalLink className="h-3 w-3" />
                      Ver detalhes
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* Resumo do mês */}
          <Card className="p-5 shadow-lg border-border/50">
            <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
              Resumo de {MESES[mesAtual.getMonth()]}
            </h3>
            {Object.entries(STATUS_LABEL).map(([status, label]) => {
              const qtd = (eventos ?? []).filter(ev => {
                const ini = dataParaLocal(ev.startDate);
                const fim = dataParaLocal(ev.endDate);
                const mesIni = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
                const mesFim = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
                return ev.status === status && ini <= mesFim && fim >= mesIni;
              }).length;
              if (qtd === 0) return null;
              return (
                <div key={status} className="flex items-center justify-between py-1.5 border-b last:border-0 border-border/40">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${STATUS_COR[status]}`} />
                    <span className="text-sm text-muted-foreground">{label}</span>
                  </div>
                  <span className="font-semibold text-sm">{qtd}</span>
                </div>
              );
            })}
            {(eventos ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">Nenhum evento este mês</p>
            )}
          </Card>
        </div>
      </div>

      {/* Dialog: Criar novo evento */}
      <Dialog open={criarAberto} onOpenChange={setCriarAberto}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleCriar}>
            <DialogHeader>
              <DialogTitle>Novo Evento</DialogTitle>
              <DialogDescription>
                {diaNovoEvento && `Data inicial: ${formatarData(diaNovoEvento)}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cal-name">Nome do evento</Label>
                <Input
                  id="cal-name"
                  data-testid="input-cal-nome"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Programa Goiás Social"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cal-local">Local</Label>
                <Input
                  id="cal-local"
                  data-testid="input-cal-local"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Ex: Goiânia - GO"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="cal-inicio">Data início</Label>
                  <Input
                    id="cal-inicio"
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cal-fim">Data fim</Label>
                  <Input
                    id="cal-fim"
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCriarAberto(false)}>Cancelar</Button>
              <Button type="submit" disabled={criarEvento.isPending}>
                {criarEvento.isPending ? "Criando..." : "Criar Evento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
