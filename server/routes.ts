import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Eventos
  app.get(api.events.list.path, async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.get(api.events.get.path, async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }
    res.json(event);
  });

  app.post(api.events.create.path, async (req, res) => {
    try {
      const input = api.events.create.input.parse(req.body);
      const event = await storage.createEvent(input);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.events.update.path, async (req, res) => {
    try {
      const input = api.events.update.input.parse(req.body);
      const event = await storage.updateEvent(Number(req.params.id), input);
      res.json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Equipamentos do Evento
  app.post(api.events.addEquipment.path, async (req, res) => {
    try {
      const input = api.events.addEquipment.input.parse(req.body);
      const result = await storage.addEventEquipment({ ...input, eventId: Number(req.params.id) });
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete('/api/events/:eventId/equipment/:equipmentId', async (req, res) => {
    await storage.deleteEventEquipment(Number(req.params.equipmentId));
    res.status(204).send();
  });

  app.patch(api.events.updateEquipmentStatus.path, async (req, res) => {
    try {
      const input = api.events.updateEquipmentStatus.input.parse(req.body);
      const result = await storage.updateEventEquipment(Number(req.params.equipmentId), input);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Técnicos do Evento
  app.post(api.events.addTechnician.path, async (req, res) => {
    try {
      const input = api.events.addTechnician.input.parse(req.body);
      const result = await storage.addEventTechnician({ ...input, eventId: Number(req.params.id) });
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete('/api/events/:eventId/technicians/:technicianId', async (req, res) => {
    await storage.deleteEventTechnician(Number(req.params.technicianId));
    res.status(204).send();
  });

  app.patch(api.events.updateTechnician.path, async (req, res) => {
    try {
      const input = api.events.updateTechnician.input.parse(req.body);
      const result = await storage.updateEventTechnician(Number(req.params.technicianId), input);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Equipamentos
  app.get(api.equipment.list.path, async (req, res) => {
    const eqList = await storage.getEquipmentList();
    res.json(eqList);
  });

  app.post(api.equipment.create.path, async (req, res) => {
    try {
      const input = api.equipment.create.input.parse(req.body);
      const eq = await storage.createEquipment(input);
      res.status(201).json(eq);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.equipment.update.path, async (req, res) => {
    try {
      const input = api.equipment.update.input.parse(req.body);
      const eq = await storage.updateEquipment(Number(req.params.id), input);
      res.json(eq);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete('/api/equipment/:id', async (req, res) => {
    await storage.deleteEquipment(Number(req.params.id));
    res.status(204).send();
  });

  // Usuários
  app.get(api.users.list.path, async (req, res) => {
    const userList = await storage.getUsers();
    res.json(userList);
  });

  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.updateUser(Number(req.params.id), req.body);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: "Erro ao atualizar servidor." });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    await storage.deleteUser(Number(req.params.id));
    res.status(204).send();
  });

  // Carga inicial de dados
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getUsers();
  if (users.length === 0) {
    await storage.createUser({ username: "joao.ti", password: "password", name: "João Silva", role: "technician" });
    await storage.createUser({ username: "maria.ti", password: "password", name: "Maria Oliveira", role: "technician" });
    await storage.createUser({ username: "admin.almo", password: "password", name: "Admin Almoxarifado", role: "almoxarifado" });

    await storage.createEquipment({ name: "Notebook Dell Latitude", serialNumber: "NB-10293", status: "available" });
    await storage.createEquipment({ name: "Impressora Multifuncional HP", serialNumber: "PR-48910", status: "available" });
    await storage.createEquipment({ name: "Switch 8 portas Cisco", serialNumber: "SW-9912", status: "available" });

    await storage.createEvent({
      name: "Itinerante - Cidade de Goiás",
      location: "Praça do Coreto, Goiás - GO",
      startDate: new Date("2026-05-10T08:00:00Z"),
      endDate: new Date("2026-05-12T18:00:00Z"),
      status: "planning"
    });
  }
}
