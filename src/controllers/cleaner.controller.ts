import { FastifyRequest, FastifyReply } from 'fastify';
import { CleanerService } from '../services/cleaner.service';
import {
  CreateCleanerInput,
  UpdateCleanerInput,
  QueryCleanersInput,
  AvailabilityInput,
} from '../schemas/cleaner.schema';

export class CleanerController {
  constructor(private cleanerService: CleanerService) {}

  async createCleaner(
    request: FastifyRequest<{ Body: CreateCleanerInput }>,
    reply: FastifyReply
  ) {
    try {
      const cleaner = await this.cleanerService.createCleaner(request.body);
      reply.status(201).send({
        success: true,
        data: cleaner,
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create cleaner',
      });
    }
  }

  async getCleaner(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const cleaner = await this.cleanerService.getCleanerById(request.params.id);

      if (!cleaner) {
        reply.status(404).send({
          success: false,
          error: 'Cleaner not found',
        });
        return;
      }

      reply.send({
        success: true,
        data: cleaner,
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch cleaner',
      });
    }
  }

  async queryCleaners(
    request: FastifyRequest<{ Querystring: QueryCleanersInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.cleanerService.queryCleaners(request.query);
      reply.send({
        success: true,
        data: result.cleaners,
        pagination: {
          total: result.total,
          limit: request.query.limit,
          offset: request.query.offset,
        },
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query cleaners',
      });
    }
  }

  async updateCleaner(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateCleanerInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const cleaner = await this.cleanerService.updateCleaner(
        request.params.id,
        request.body
      );
      reply.send({
        success: true,
        data: cleaner,
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update cleaner',
      });
    }
  }

  async deleteCleaner(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const cleaner = await this.cleanerService.deleteCleaner(request.params.id);
      reply.send({
        success: true,
        data: cleaner,
        message: 'Cleaner deleted successfully',
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete cleaner',
      });
    }
  }

  async setAvailability(
    request: FastifyRequest<{
      Params: { id: string };
      Body: AvailabilityInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const availability = await this.cleanerService.setAvailability(
        request.params.id,
        request.body
      );
      reply.send({
        success: true,
        data: availability,
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set availability',
      });
    }
  }

  async getAvailability(
    request: FastifyRequest<{
      Params: { id: string };
      Querystring: { dateFrom: string; dateTo: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const availability = await this.cleanerService.getAvailability(
        request.params.id,
        new Date(request.query.dateFrom),
        new Date(request.query.dateTo)
      );
      reply.send({
        success: true,
        data: availability,
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch availability',
      });
    }
  }

  async getAvailableCleaners(
    request: FastifyRequest<{
      Querystring: {
        date: string;
        zipCode?: string;
        propertyId?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const cleaners = await this.cleanerService.getAvailableCleaners(
        new Date(request.query.date),
        request.query.zipCode,
        request.query.propertyId
      );
      reply.send({
        success: true,
        data: cleaners,
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch available cleaners',
      });
    }
  }

  async updatePerformanceMetrics(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const cleaner = await this.cleanerService.updatePerformanceMetrics(
        request.params.id
      );
      reply.send({
        success: true,
        data: cleaner,
        message: 'Performance metrics updated successfully',
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update performance metrics',
      });
    }
  }
}
