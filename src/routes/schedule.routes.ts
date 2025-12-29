import { FastifyInstance } from 'fastify';
import { ScheduleController } from '../controllers/schedule.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createScheduleSchema,
  updateScheduleSchema,
  autoGenerateSchema,
} from '../schemas/schedule.schema';

export async function scheduleRoutes(
  fastify: FastifyInstance,
  controller: ScheduleController
) {
  // Create schedule
  fastify.post(
    '/',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
      schema: {
        body: createScheduleSchema,
      },
    },
    controller.createSchedule.bind(controller)
  );

  // Get schedule by ID
  fastify.get(
    '/:id',
    {
      preHandler: [authenticate],
    },
    controller.getSchedule.bind(controller)
  );

  // Get schedules by property
  fastify.get(
    '/property/:propertyId',
    {
      preHandler: [authenticate],
    },
    controller.getSchedulesByProperty.bind(controller)
  );

  // Update schedule
  fastify.put(
    '/:id',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
      schema: {
        body: updateScheduleSchema,
      },
    },
    controller.updateSchedule.bind(controller)
  );

  // Delete schedule
  fastify.delete(
    '/:id',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
    },
    controller.deleteSchedule.bind(controller)
  );

  // Process due schedules (manual trigger or cron job)
  fastify.post(
    '/process-due',
    {
      preHandler: [authenticate, authorize('SUPER_ADMIN')],
    },
    controller.processDueSchedules.bind(controller)
  );

  // Auto-generate tasks from reservations
  fastify.post(
    '/auto-generate',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
      schema: {
        body: autoGenerateSchema,
      },
    },
    controller.autoGenerateTasks.bind(controller)
  );
}
