import { z } from 'zod';

export const createCleanerSchema = z.object({
  userId: z.string().uuid().optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  employmentType: z.enum(['EMPLOYEE', 'CONTRACTOR', 'PARTNER_COMPANY']).default('CONTRACTOR'),
  specialties: z.array(z.string()).default([]),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string().datetime().or(z.date()),
    expires: z.string().datetime().or(z.date()).optional(),
  })).default([]),
  languages: z.array(z.string()).default(['en']),
  serviceZipCodes: z.array(z.string()).default([]),
  serviceProperties: z.array(z.string().uuid()).default([]),
  workSchedule: z.record(z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }))).default({}),
  maxTasksPerDay: z.number().int().positive().default(3),
  hourlyRate: z.number().positive().optional(),
  paymentMethod: z.enum(['DIRECT_DEPOSIT', 'CHECK', 'PAYPAL', 'VENMO', 'CASH']).default('DIRECT_DEPOSIT'),
  paymentDetails: z.record(z.any()).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  photoUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
});

export const updateCleanerSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(20).optional(),
  employmentType: z.enum(['EMPLOYEE', 'CONTRACTOR', 'PARTNER_COMPANY']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED']).optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string().datetime().or(z.date()),
    expires: z.string().datetime().or(z.date()).optional(),
  })).optional(),
  languages: z.array(z.string()).optional(),
  serviceZipCodes: z.array(z.string()).optional(),
  serviceProperties: z.array(z.string().uuid()).optional(),
  workSchedule: z.record(z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }))).optional(),
  maxTasksPerDay: z.number().int().positive().optional(),
  hourlyRate: z.number().positive().optional(),
  paymentMethod: z.enum(['DIRECT_DEPOSIT', 'CHECK', 'PAYPAL', 'VENMO', 'CASH']).optional(),
  paymentDetails: z.record(z.any()).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  photoUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
});

export const queryCleanersSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED']).optional(),
  specialty: z.string().optional(),
  zipCode: z.string().optional(),
  available: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

export const availabilitySchema = z.object({
  date: z.string().datetime().or(z.date()),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isAvailable: z.boolean().default(true),
  reason: z.string().optional(),
});

export type CreateCleanerInput = z.infer<typeof createCleanerSchema>;
export type UpdateCleanerInput = z.infer<typeof updateCleanerSchema>;
export type QueryCleanersInput = z.infer<typeof queryCleanersSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
