import { z } from 'zod';
import { 
  insertUserSchema, 
  insertEventSchema, 
  insertEquipmentSchema, 
  insertEventEquipmentSchema, 
  insertEventTechnicianSchema,
  users, events, equipment, eventEquipment, eventTechnicians
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// Schemas de resposta para rotas com relações
const equipmentResponseSchema = z.custom<typeof equipment.$inferSelect>();
const userResponseSchema = z.custom<typeof users.$inferSelect>();

const eventEquipmentWithDetailsSchema = z.custom<typeof eventEquipment.$inferSelect & { equipment: typeof equipment.$inferSelect }>();
const eventTechnicianWithDetailsSchema = z.custom<typeof eventTechnicians.$inferSelect & { technician: typeof users.$inferSelect }>();

const eventDetailsResponseSchema = z.custom<typeof events.$inferSelect & {
  equipment: (typeof eventEquipment.$inferSelect & { equipment: typeof equipment.$inferSelect })[];
  technicians: (typeof eventTechnicians.$inferSelect & { technician: typeof users.$inferSelect })[];
}>();

export const api = {
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events' as const,
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/events/:id' as const,
      responses: {
        200: eventDetailsResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events' as const,
      input: insertEventSchema.extend({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      }),
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/events/:id' as const,
      input: insertEventSchema.partial().extend({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
      }),
      responses: {
        200: z.custom<typeof events.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    addEquipment: {
      method: 'POST' as const,
      path: '/api/events/:id/equipment' as const,
      input: insertEventEquipmentSchema.omit({ eventId: true }),
      responses: {
        201: eventEquipmentWithDetailsSchema,
        400: errorSchemas.validation,
      },
    },
    updateEquipmentStatus: {
      method: 'PATCH' as const,
      // equipmentId refere-se ao ID da linha em event_equipment, não do equipamento em si
      path: '/api/events/:eventId/equipment/:equipmentId' as const,
      input: insertEventEquipmentSchema.pick({ status: true }),
      responses: {
        200: eventEquipmentWithDetailsSchema,
        404: errorSchemas.notFound,
      },
    },
    addTechnician: {
      method: 'POST' as const,
      path: '/api/events/:id/technicians' as const,
      input: insertEventTechnicianSchema.omit({ eventId: true }),
      responses: {
        201: eventTechnicianWithDetailsSchema,
        400: errorSchemas.validation,
      },
    },
    updateTechnician: {
      method: 'PATCH' as const,
      // technicianId refere-se ao ID da linha em event_technicians
      path: '/api/events/:eventId/technicians/:technicianId' as const,
      input: insertEventTechnicianSchema.partial(),
      responses: {
        200: eventTechnicianWithDetailsSchema,
        404: errorSchemas.notFound,
      },
    },
  },
  equipment: {
    list: {
      method: 'GET' as const,
      path: '/api/equipment' as const,
      responses: {
        200: z.array(equipmentResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/equipment' as const,
      input: insertEquipmentSchema,
      responses: {
        201: equipmentResponseSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/equipment/:id' as const,
      input: insertEquipmentSchema.partial(),
      responses: {
        200: equipmentResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    }
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      responses: {
        200: z.array(userResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/users' as const,
      input: insertUserSchema,
      responses: {
        201: userResponseSchema,
        400: errorSchemas.validation,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
