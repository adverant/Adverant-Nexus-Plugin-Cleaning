import { FastifyInstance } from 'fastify';
import { CleaningTaskController } from '../controllers/cleaning-task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createCleaningTaskSchema,
  updateCleaningTaskSchema,
  startTaskSchema,
  completeTaskSchema,
  queryTasksSchema,
} from '../schemas/cleaning-task.schema';

export async function cleaningTaskRoutes(
  fastify: FastifyInstance,
  controller: CleaningTaskController
) {
  // Create cleaning task
  fastify.post(
    '/',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
      schema: {
        body: createCleaningTaskSchema,
      },
    },
    controller.createTask.bind(controller)
  );

  // Get task by ID
  fastify.get(
    '/:id',
    {
      preHandler: [authenticate],
    },
    controller.getTask.bind(controller)
  );

  // Query tasks
  fastify.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        querystring: queryTasksSchema,
      },
    },
    controller.queryTasks.bind(controller)
  );

  // Update task
  fastify.put(
    '/:id',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN', 'CLEANER')],
      schema: {
        body: updateCleaningTaskSchema,
      },
    },
    controller.updateTask.bind(controller)
  );

  // Start task
  fastify.post(
    '/:id/start',
    {
      preHandler: [authenticate, authorize('CLEANER', 'PROPERTY_MANAGER', 'SUPER_ADMIN')],
      schema: {
        body: startTaskSchema,
      },
    },
    controller.startTask.bind(controller)
  );

  // Complete task
  fastify.post(
    '/:id/complete',
    {
      preHandler: [authenticate, authorize('CLEANER', 'PROPERTY_MANAGER', 'SUPER_ADMIN')],
      schema: {
        body: completeTaskSchema,
      },
    },
    controller.completeTask.bind(controller)
  );

  // Cancel task
  fastify.post(
    '/:id/cancel',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
    },
    controller.cancelTask.bind(controller)
  );

  // Auto-assign task
  fastify.post(
    '/:id/auto-assign',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
    },
    controller.autoAssignTask.bind(controller)
  );

  // Get cleaner performance
  fastify.get(
    '/performance/:cleanerId',
    {
      preHandler: [authenticate, authorize('PROPERTY_MANAGER', 'SUPER_ADMIN')],
    },
    controller.getCleanerPerformance.bind(controller)
  );
}
