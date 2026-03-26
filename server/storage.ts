import { db } from "./db";
import {
  users, events, equipment, eventEquipment, eventTechnicians,
  type User, type InsertUser,
  type Event, type InsertEvent, type UpdateEventRequest,
  type Equipment, type InsertEquipment, type UpdateEquipmentRequest,
  type AddEventEquipmentRequest, type UpdateEventEquipmentRequest,
  type AddEventTechnicianRequest, type UpdateEventTechnicianRequest,
  type EventDetailsResponse, type EventEquipmentWithDetails, type EventTechnicianWithDetails
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Usuários
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Eventos
  getEvents(): Promise<(Event & { technicianCount: number; equipmentCount: number })[]>;
  getEvent(id: number): Promise<EventDetailsResponse | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: UpdateEventRequest): Promise<Event>;

  // Equipamentos
  getEquipmentList(): Promise<Equipment[]>;
  getEquipment(id: number): Promise<Equipment | undefined>;
  createEquipment(equip: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equip: UpdateEquipmentRequest): Promise<Equipment>;
  deleteEquipment(id: number): Promise<void>;

  // Equipamentos do Evento
  addEventEquipment(data: AddEventEquipmentRequest & { eventId: number }): Promise<EventEquipmentWithDetails>;
  updateEventEquipment(id: number, data: UpdateEventEquipmentRequest): Promise<EventEquipmentWithDetails>;
  deleteEventEquipment(id: number): Promise<void>;

  // Técnicos do Evento
  addEventTechnician(data: AddEventTechnicianRequest & { eventId: number }): Promise<EventTechnicianWithDetails>;
  updateEventTechnician(id: number, data: UpdateEventTechnicianRequest): Promise<EventTechnicianWithDetails>;
  deleteEventTechnician(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Usuários
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User> {
    const [updated] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Eventos
  async getEvents(): Promise<(Event & { technicianCount: number; equipmentCount: number })[]> {
    const allEvents = await db.select().from(events);
    const allTechs = await db.select().from(eventTechnicians);
    const allEqs = await db.select().from(eventEquipment);
    return allEvents.map(ev => ({
      ...ev,
      technicianCount: allTechs.filter(t => t.eventId === ev.id).length,
      equipmentCount: allEqs.filter(e => e.eventId === ev.id).length,
    }));
  }

  async getEvent(id: number): Promise<EventDetailsResponse | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    if (!event) return undefined;

    const eventEqs = await db.select().from(eventEquipment).where(eq(eventEquipment.eventId, id));
    const allEqs = await db.select().from(equipment);

    const equipmentDetails: EventEquipmentWithDetails[] = eventEqs.map(ee => ({
      ...ee,
      equipment: allEqs.find(e => e.id === ee.equipmentId)!
    }));

    const eventTechs = await db.select().from(eventTechnicians).where(eq(eventTechnicians.eventId, id));
    const allUsers = await db.select().from(users);

    const technicianDetails: EventTechnicianWithDetails[] = eventTechs.map(et => ({
      ...et,
      technician: allUsers.find(u => u.id === et.technicianId)!
    }));

    return {
      ...event,
      equipment: equipmentDetails,
      technicians: technicianDetails
    };
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, updateData: UpdateEventRequest): Promise<Event> {
    const [updatedEvent] = await db.update(events).set(updateData).where(eq(events.id, id)).returning();
    return updatedEvent;
  }

  // Equipamentos
  async getEquipmentList(): Promise<Equipment[]> {
    return await db.select().from(equipment);
  }

  async getEquipment(id: number): Promise<Equipment | undefined> {
    const [equip] = await db.select().from(equipment).where(eq(equipment.id, id));
    return equip;
  }

  async createEquipment(equip: InsertEquipment): Promise<Equipment> {
    const [newEquip] = await db.insert(equipment).values(equip).returning();
    return newEquip;
  }

  async updateEquipment(id: number, updateData: UpdateEquipmentRequest): Promise<Equipment> {
    const [updatedEquip] = await db.update(equipment).set(updateData).where(eq(equipment.id, id)).returning();
    return updatedEquip;
  }

  async deleteEquipment(id: number): Promise<void> {
    await db.delete(equipment).where(eq(equipment.id, id));
  }

  // Equipamentos do Evento
  async addEventEquipment(data: AddEventEquipmentRequest & { eventId: number }): Promise<EventEquipmentWithDetails> {
    const [ee] = await db.insert(eventEquipment).values(data).returning();
    const [equip] = await db.select().from(equipment).where(eq(equipment.id, ee.equipmentId));
    return { ...ee, equipment: equip };
  }

  async updateEventEquipment(id: number, data: UpdateEventEquipmentRequest): Promise<EventEquipmentWithDetails> {
    const [ee] = await db.update(eventEquipment).set(data).where(eq(eventEquipment.id, id)).returning();
    const [equip] = await db.select().from(equipment).where(eq(equipment.id, ee.equipmentId));
    return { ...ee, equipment: equip };
  }

  async deleteEventEquipment(id: number): Promise<void> {
    await db.delete(eventEquipment).where(eq(eventEquipment.id, id));
  }

  // Técnicos do Evento
  async addEventTechnician(data: AddEventTechnicianRequest & { eventId: number }): Promise<EventTechnicianWithDetails> {
    const [et] = await db.insert(eventTechnicians).values(data).returning();
    const [tech] = await db.select().from(users).where(eq(users.id, et.technicianId));
    return { ...et, technician: tech };
  }

  async updateEventTechnician(id: number, data: UpdateEventTechnicianRequest): Promise<EventTechnicianWithDetails> {
    const [et] = await db.update(eventTechnicians).set(data).where(eq(eventTechnicians.id, id)).returning();
    const [tech] = await db.select().from(users).where(eq(users.id, et.technicianId));
    return { ...et, technician: tech };
  }

  async deleteEventTechnician(id: number): Promise<void> {
    await db.delete(eventTechnicians).where(eq(eventTechnicians.id, id));
  }
}

export const storage = new DatabaseStorage();
