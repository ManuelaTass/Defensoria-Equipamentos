import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const equipmentStatusEnum = pgEnum('equipment_status', ['available', 'in_use', 'maintenance', 'borrowed']);
export const eventEquipmentStatusEnum = pgEnum('event_equipment_status', ['requested', 'testing', 'ready', 'deployed', 'returned']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default('technician'),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default('planning'),
  glpiTicket: text("glpi_ticket"),
  processNumber: text("process_number"),
});

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  serialNumber: text("serial_number").notNull().unique(),
  status: equipmentStatusEnum("status").notNull().default('available'),
  isBorrowed: boolean("is_borrowed").notNull().default(false),
  currentLocation: text("current_location"),
});

export const eventEquipment = pgTable("event_equipment", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  equipmentId: integer("equipment_id").notNull(),
  status: eventEquipmentStatusEnum("status").notNull().default('requested'),
});

export const eventTechnicians = pgTable("event_technicians", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  technicianId: integer("technician_id").notNull(),
  daysParticipating: integer("days_participating").notNull().default(1),
  ticketCreated: boolean("ticket_created").notNull().default(false),
  attended: boolean("attended").notNull().default(false),
});

// Esquemas de inserção
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export const insertEquipmentSchema = createInsertSchema(equipment).omit({ id: true });
export const insertEventEquipmentSchema = createInsertSchema(eventEquipment).omit({ id: true });
export const insertEventTechnicianSchema = createInsertSchema(eventTechnicians).omit({ id: true });

// Tipos base
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

export type EventEquipment = typeof eventEquipment.$inferSelect;
export type InsertEventEquipment = z.infer<typeof insertEventEquipmentSchema>;

export type EventTechnician = typeof eventTechnicians.$inferSelect;
export type InsertEventTechnician = z.infer<typeof insertEventTechnicianSchema>;

// Tipos de requisição e resposta da API
export type CreateEventRequest = InsertEvent;
export type UpdateEventRequest = Partial<InsertEvent>;

export type CreateEquipmentRequest = InsertEquipment;
export type UpdateEquipmentRequest = Partial<InsertEquipment>;

export type AddEventEquipmentRequest = Omit<InsertEventEquipment, 'eventId'>;
export type UpdateEventEquipmentRequest = Partial<InsertEventEquipment>;

export type AddEventTechnicianRequest = Omit<InsertEventTechnician, 'eventId'>;
export type UpdateEventTechnicianRequest = Partial<InsertEventTechnician>;

// Tipos com relações (joins)
export type EventEquipmentWithDetails = EventEquipment & { equipment: Equipment };
export type EventTechnicianWithDetails = EventTechnician & { technician: User };
export type EventDetailsResponse = Event & {
  equipment: EventEquipmentWithDetails[];
  technicians: EventTechnicianWithDetails[];
};
