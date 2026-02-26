import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  api, 
  buildUrl,
  type CreateEventRequest,
  type UpdateEventRequest,
  type AddEventEquipmentRequest,
  type AddEventTechnicianRequest
} from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useEvents() {
  return useQuery({
    queryKey: [api.events.list.path],
    queryFn: async () => {
      const res = await fetch(api.events.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Falha ao buscar eventos");
      const data = await res.json();
      return parseWithLogging(api.events.list.responses[200], data, "events.list");
    },
  });
}

export function useEvent(id: number) {
  const url = buildUrl(api.events.get.path, { id });
  return useQuery({
    queryKey: [api.events.get.path, id],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Falha ao buscar evento");
      const data = await res.json();
      return parseWithLogging(api.events.get.responses[200], data, "events.get");
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateEventRequest) => {
      const validated = api.events.create.input.parse(data);
      const res = await fetch(api.events.create.path, {
        method: api.events.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Erro de validação");
        }
        throw new Error("Falha ao criar evento");
      }
      return parseWithLogging(api.events.create.responses[201], await res.json(), "events.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      toast({ title: "Sucesso", description: "Evento criado com sucesso." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateEventRequest) => {
      const validated = api.events.update.input.parse(updates);
      const url = buildUrl(api.events.update.path, { id });
      
      const res = await fetch(url, {
        method: api.events.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Falha ao atualizar evento");
      return parseWithLogging(api.events.update.responses[200], await res.json(), "events.update");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.events.get.path, variables.id] });
      toast({ title: "Sucesso", description: "Evento atualizado." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  });
}

export function useAddEventEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, ...data }: { eventId: number } & AddEventEquipmentRequest) => {
      const validated = api.events.addEquipment.input.parse(data);
      const url = buildUrl(api.events.addEquipment.path, { id: eventId });
      
      const res = await fetch(url, {
        method: api.events.addEquipment.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Falha ao vincular equipamento");
      return parseWithLogging(api.events.addEquipment.responses[201], await res.json(), "events.addEquipment");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.events.get.path, variables.eventId] });
      toast({ title: "Equipamento Adicionado", description: "Equipamento vinculado ao evento." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  });
}

export function useUpdateEquipmentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, equipmentId, status }: { eventId: number; equipmentId: number; status: string }) => {
      const validated = api.events.updateEquipmentStatus.input.parse({ status });
      const url = buildUrl(api.events.updateEquipmentStatus.path, { eventId, equipmentId });
      
      const res = await fetch(url, {
        method: api.events.updateEquipmentStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Falha ao atualizar status");
      return parseWithLogging(api.events.updateEquipmentStatus.responses[200], await res.json(), "events.updateEquipmentStatus");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.events.get.path, variables.eventId] });
      toast({ title: "Status Atualizado", description: "O status do equipamento foi alterado." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  });
}

export function useAddEventTechnician() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, ...data }: { eventId: number } & AddEventTechnicianRequest) => {
      const validated = api.events.addTechnician.input.parse(data);
      const url = buildUrl(api.events.addTechnician.path, { id: eventId });
      
      const res = await fetch(url, {
        method: api.events.addTechnician.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Falha ao vincular técnico");
      return parseWithLogging(api.events.addTechnician.responses[201], await res.json(), "events.addTechnician");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.events.get.path, variables.eventId] });
      toast({ title: "Técnico Adicionado", description: "Técnico vinculado ao evento." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  });
}

export function useUpdateEventTechnician() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, technicianId, ...updates }: { eventId: number; technicianId: number; ticketCreated?: boolean; daysParticipating?: number }) => {
      const validated = api.events.updateTechnician.input.parse(updates);
      const url = buildUrl(api.events.updateTechnician.path, { eventId, technicianId });
      
      const res = await fetch(url, {
        method: api.events.updateTechnician.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Falha ao atualizar técnico");
      return parseWithLogging(api.events.updateTechnician.responses[200], await res.json(), "events.updateTechnician");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.events.get.path, variables.eventId] });
      toast({ title: "Atualizado", description: "Informações do técnico atualizadas." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  });
}
