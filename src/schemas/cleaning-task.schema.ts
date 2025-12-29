import { z } from 'zod';

export const createCleaningTaskSchema = z.object({
  propertyId: z.string().uuid(),
  unitId: z.string().uuid().optional(),
  reservationId: z.string().uuid().optional(),
  assignedCleanerId: z.string().uuid().optional(),
  taskType: z.enum([
    'CHECKOUT',
    'MID_STAY',
    'DEEP_CLEAN',
    'EMERGENCY',
    'MOVE_IN',
    'INSPECTION_PREP',
    'TURNOVER',
    'STAGING',
  ]),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  scheduledDate: z.string().datetime().or(z.date()),
  scheduledStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  estimatedDuration: z.number().int().min(15).max(480),
  checklistTemplate: z.string().default('standard'),
  accessCode: z.string().optional(),
  accessMethod: z.enum([
    'SMART_LOCK_CODE',
    'KEY_LOCKBOX',
    'MEET_OWNER',
    'KEY_ON_SITE',
    'OTHER',
  ]).optional(),
  coordinationNotes: z.string().optional(),
});

export const updateCleaningTaskSchema = z.object({
  assignedCleanerId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  status: z.enum([
    'SCHEDULED',
    'ASSIGNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'FAILED',
    'REQUIRES_REVIEW',
  ]).optional(),
  scheduledDate: z.string().datetime().or(z.date()).optional(),
  scheduledStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  estimatedDuration: z.number().int().min(15).max(480).optional(),
  cleanerNotes: z.string().optional(),
  managerNotes: z.string().optional(),
  accessCode: z.string().optional(),
  coordinationNotes: z.string().optional(),
});

export const startTaskSchema = z.object({
  actualStartTime: z.string().datetime().or(z.date()).optional(),
});

export const completeTaskSchema = z.object({
  actualEndTime: z.string().datetime().or(z.date()).optional(),
  checklist: z.array(z.object({
    room: z.string(),
    task: z.string(),
    completed: z.boolean(),
    photoUrl: z.string().url().optional(),
    notes: z.string().optional(),
    timestamp: z.string().datetime().or(z.date()),
  })),
  photosAfter: z.array(z.string().url()).default([]),
  suppliesUsed: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().int().positive(),
    cost: z.number().positive(),
  })).default([]),
  issuesReported: z.array(z.object({
    type: z.string(),
    description: z.string(),
    severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']),
    photo: z.string().url().optional(),
  })).default([]),
  cleanerNotes: z.string().optional(),
});

export const queryTasksSchema = z.object({
  propertyId: z.string().uuid().optional(),
  assignedCleanerId: z.string().uuid().optional(),
  status: z.enum([
    'SCHEDULED',
    'ASSIGNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'FAILED',
    'REQUIRES_REVIEW',
  ]).optional(),
  taskType: z.enum([
    'CHECKOUT',
    'MID_STAY',
    'DEEP_CLEAN',
    'EMERGENCY',
    'MOVE_IN',
    'INSPECTION_PREP',
    'TURNOVER',
    'STAGING',
  ]).optional(),
  dateFrom: z.string().datetime().or(z.date()).optional(),
  dateTo: z.string().datetime().or(z.date()).optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

export type CreateCleaningTaskInput = z.infer<typeof createCleaningTaskSchema>;
export type UpdateCleaningTaskInput = z.infer<typeof updateCleaningTaskSchema>;
export type StartTaskInput = z.infer<typeof startTaskSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
export type QueryTasksInput = z.infer<typeof queryTasksSchema>;
