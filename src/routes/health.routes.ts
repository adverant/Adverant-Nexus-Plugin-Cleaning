import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check database connection
      await fastify.prisma.$queryRaw`SELECT 1`;

      reply.send({
        status: 'healthy',
        service: 'nexus-cleaning',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
      });
    } catch (error) {
      reply.status(503).send({
        status: 'unhealthy',
        service: 'nexus-cleaning',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  fastify.get('/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      reply.send({ ready: true });
    } catch (error) {
      reply.status(503).send({ ready: false });
    }
  });

  fastify.get('/live', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send({ alive: true });
  });
}
