import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Wrench, Settings2, Package, Search, Play, Plane, CornerDownLeft } from "lucide-react";

export function EventStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'planning':
      return <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200"><Settings2 className="w-3 h-3 mr-1" /> Planejamento</Badge>;
    case 'in_progress':
      return <Badge variant="default" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"><Play className="w-3 h-3 mr-1" /> Em Andamento</Badge>;
    case 'completed':
      return <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Concluído</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function GlobalEquipmentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'available':
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Disponível</Badge>;
    case 'in_use':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 shadow-none"><Play className="w-3 h-3 mr-1" /> Em Uso</Badge>;
    case 'maintenance':
      return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200 shadow-none"><Wrench className="w-3 h-3 mr-1" /> Manutenção</Badge>;
    case 'borrowed':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 shadow-none"><Package className="w-3 h-3 mr-1" /> Emprestado</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function EventEquipmentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'requested':
      return <Badge className="bg-slate-100 text-slate-700 border-slate-200 shadow-none"><Search className="w-3 h-3 mr-1" /> Solicitado</Badge>;
    case 'testing':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-none"><Clock className="w-3 h-3 mr-1" /> Em Teste</Badge>;
    case 'ready':
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Pronto</Badge>;
    case 'deployed':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 shadow-none"><Plane className="w-3 h-3 mr-1" /> Enviado</Badge>;
    case 'returned':
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200 shadow-none"><CornerDownLeft className="w-3 h-3 mr-1" /> Retornado</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
