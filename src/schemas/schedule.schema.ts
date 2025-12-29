import { z } from 'zod';

export const createScheduleSchema = z.object({
  propertyId: z.string().uuid(),
  scheduleType: z.enum(['RESERVATION_BASED', 'RECURRING', 'ONE_TIME']),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  duration: z.number().int().min(15).max(480),
  preferredCleanerId: z.string().uuid().optional(),
  autoAssign: z.boolean().default(true),
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
  checklistTemplate: z.string().default('standard'),
});

export const updateScheduleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  preferredTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: z.number().int().min(15).max(480).optional(),
  preferredCleanerId: z.string().uuid().optional(),
  autoAssign: z.boolean().optional(),
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
  checklistTemplate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const autoGenerateSchema = z.object({
  propertyId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().or(z.date()),
  dateTo: z.string().datetime().or(z.date()),
  taskTypes: z.array(z.enum([
    'CHECKOUT',
    'MID_STAY',
    'DEEP_CLEAN',
    'EMERGENCY',
    'MOVE_IN',
    'INSPECTION_PREP',
    'TURNOVER',
    'STAGING',
  ])).default(['CHECKOUT', 'MID_STAY']),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type AutoGenerateInput = z.infer<typeof autoGenerateSchema>;
