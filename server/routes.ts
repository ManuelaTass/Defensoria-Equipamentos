import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { passport } from "./auth";

// Middlewares de controle de acesso
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  next();
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    const user = req.user as any;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Acesso não permitido para este perfil" });
    }
    next();
  };
}

const suporte = ["admin", "technician", "almoxarifado"];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Autenticação
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Credenciais inválidas" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        const { password: _, ...userSafe } = user;
        return res.json(userSafe);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Sessão encerrada" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    const { password: _, ...userSafe } = req.user as any;
    res.json(userSafe);
  });

  // Eventos
  app.get(api.events.list.path, requireAuth, async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.get(api.events.get.path, requireAuth, async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }
    res.json(event);
  });

  app.post(api.events.create.path, requireRole(...suporte), async (req, res) => {
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

  app.put(api.events.update.path, requireRole(...suporte), async (req, res) => {
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
  app.post(api.events.addEquipment.path, requireRole(...suporte), async (req, res) => {
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

  app.delete('/api/events/:eventId/equipment/:equipmentId', requireRole(...suporte), async (req, res) => {
    await storage.deleteEventEquipment(Number(req.params.equipmentId));
    res.status(204).send();
  });

  app.patch(api.events.updateEquipmentStatus.path, requireRole(...suporte), async (req, res) => {
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
  app.post(api.events.addTechnician.path, requireRole(...suporte), async (req, res) => {
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

  app.delete('/api/events/:eventId/technicians/:technicianId', requireRole(...suporte), async (req, res) => {
    await storage.deleteEventTechnician(Number(req.params.technicianId));
    res.status(204).send();
  });

  app.patch(api.events.updateTechnician.path, requireRole(...suporte), async (req, res) => {
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
  app.get(api.equipment.list.path, requireAuth, async (req, res) => {
    const eqList = await storage.getEquipmentList();
    res.json(eqList);
  });

  app.post(api.equipment.create.path, requireRole(...suporte), async (req, res) => {
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

  app.put(api.equipment.update.path, requireRole(...suporte), async (req, res) => {
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

  app.delete('/api/equipment/:id', requireRole("admin"), async (req, res) => {
    await storage.deleteEquipment(Number(req.params.id));
    res.status(204).send();
  });

  // Usuários
  app.get(api.users.list.path, requireAuth, async (req, res) => {
    const userList = await storage.getUsers();
    res.json(userList);
  });

  app.post(api.users.create.path, requireRole("admin"), async (req, res) => {
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

  app.put('/api/users/:id', requireRole("admin"), async (req, res) => {
    try {
      const user = await storage.updateUser(Number(req.params.id), req.body);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: "Erro ao atualizar servidor." });
    }
  });

  app.delete('/api/users/:id', requireRole("admin"), async (req, res) => {
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
    await storage.createUser({ username: "admin", password: "admin123", name: "Administrador DPE-GO", role: "admin" });
    await storage.createUser({ username: "joao.ti", password: "password", name: "João Silva", role: "technician" });
    await storage.createUser({ username: "maria.almo", password: "password", name: "Maria Oliveira", role: "almoxarifado" });
    await storage.createUser({ username: "defensor.silva", password: "password", name: "Dr. Carlos Silva", role: "defender" });
    await storage.createUser({ username: "assessora.lima", password: "password", name: "Dra. Ana Lima", role: "advisor" });

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
