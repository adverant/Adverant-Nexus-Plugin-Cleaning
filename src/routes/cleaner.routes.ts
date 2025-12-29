import { FastifyInstance } from 'fastify';
import { CleanerController } from '../controllers/cleaner.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createCleanerSchema,
  updateCleanerSchema,
  queryCleanersSchema,
  availabilitySchema,
} from '../schemas/cleaner.schema';

export async function cleanerRoutes(
  fastify: FastifyInstance,
  controller: CleanerController
) {
  // Create cleaner
  fastify.post(
    '/',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
      schema: {
        body: createCleanerSchema,
      },
    },
    controller.createCleaner.bind(controller)
  );

  // Get cleaner by ID
  fastify.get(
    '/:id',
    {
      preHandler: [authenticate],
    },
    controller.getCleaner.bind(controller)
  );

  // Query cleaners
  fastify.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        querystring: queryCleanersSchema,
      },
    },
    controller.queryCleaners.bind(controller)
  );

  // Update cleaner
  fastify.put(
    '/:id',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN', 'CLEANER')],
      schema: {
        body: updateCleanerSchema,
      },
    },
    controller.updateCleaner.bind(controller)
  );

  // Delete cleaner
  fastify.delete(
    '/:id',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
    },
    controller.deleteCleaner.bind(controller)
  );

  // Set cleaner availability
  fastify.post(
    '/:id/availability',
    {
      preHandler: [authenticate, authorize('CLEANER', 'PROPERTY_MANAGER', 'SUPER_ADMIN')],
      schema: {
        body: availabilitySchema,
      },
    },
    controller.setAvailability.bind(controller)
  );

  // Get cleaner availability
  fastify.get(
    '/:id/availability',
    {
      preHandler: [authenticate],
    },
    controller.getAvailability.bind(controller)
  );

  // Get available cleaners for date/location
  fastify.get(
    '/available/search',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
    },
    controller.getAvailableCleaners.bind(controller)
  );

  // Update cleaner performance metrics
  fastify.post(
    '/:id/update-metrics',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
    },
    controller.updatePerformanceMetrics.bind(controller)
  );
}
