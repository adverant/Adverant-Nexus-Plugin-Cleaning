import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import { config } from './config/config';
import { usageTrackingPlugin, flushPendingReports } from './middleware/usage-tracking';

// Services
import { CleaningTaskService } from './services/cleaning-task.service';
import { CleanerService } from './services/cleaner.service';
import { ScheduleService } from './services/schedule.service';
import { AutomationService } from './services/automation.service';

// Controllers
import { CleaningTaskController } from './controllers/cleaning-task.controller';
import { CleanerController } from './controllers/cleaner.controller';
import { ScheduleController } from './controllers/schedule.controller';

// Routes
import { cleaningTaskRoutes } from './routes/cleaning-task.routes';
import { cleanerRoutes } from './routes/cleaner.routes';
import { scheduleRoutes } from './routes/schedule.routes';
import { healthRoutes } from './routes/health.routes';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

const server = Fastify({
  logger: {
    level: config.logLevel,
    transport: config.isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
});

// Register plugins
server.register(cors, {
  origin: config.corsOrigins,
  credentials: true,
});

server.register(helmet, {
  contentSecurityPolicy: config.isDevelopment ? false : undefined,
});

server.register(jwt, {
  secret: config.jwtSecret,
});

// Usage tracking middleware
server.register(usageTrackingPlugin);

// Decorate fastify with prisma instance
server.decorate('prisma', prisma);

// Initialize services
const cleaningTaskService = new CleaningTaskService(prisma);
const cleanerService = new CleanerService(prisma);
const scheduleService = new ScheduleService(prisma);
const automationService = new AutomationService(prisma);

// Initialize controllers
const cleaningTaskController = new CleaningTaskController(
  cleaningTaskService,
  automationService
);
const cleanerController = new CleanerController(cleanerService);
const scheduleController = new ScheduleController(
  scheduleService,
  automationService
);

// Health check routes
server.register(healthRoutes, { prefix: '/health' });

// API routes
server.register(
  async (instance) => {
    await cleaningTaskRoutes(instance, cleaningTaskController);
  },
  { prefix: '/api/v1/tasks' }
);

server.register(
  async (instance) => {
    await cleanerRoutes(instance, cleanerController);
  },
  { prefix: '/api/v1/cleaners' }
);

server.register(
  async (instance) => {
    await scheduleRoutes(instance, scheduleController);
  },
  { prefix: '/api/v1/schedule' }
);

// Graceful shutdown
const gracefulShutdown = async () => {
  server.log.info('Received shutdown signal, closing connections...');
  await flushPendingReports();
  await prisma.$disconnect();
  await server.close();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const start = async () => {
  try {
    await server.listen({
      port: config.port,
      host: config.host,
    });

    server.log.info(
      `🧹 Cleaning & Housekeeping Service running on http://${config.host}:${config.port}`
    );

    // Start background job to process due schedules (every 5 minutes)
    if (!config.isDevelopment) {
      setInterval(async () => {
        try {
          const tasksCreated = await scheduleService.processDueSchedules();
          if (tasksCreated > 0) {
            server.log.info(`Created ${tasksCreated} tasks from due schedules`);
          }
        } catch (error) {
          server.log.error('Failed to process due schedules:', error);
        }
      }, 5 * 60 * 1000); // 5 minutes
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

// Type declaration for FastifyInstance with prisma
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
