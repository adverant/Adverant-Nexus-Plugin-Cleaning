import { FastifyRequest, FastifyReply } from 'fastify';
import { ScheduleService } from '../services/schedule.service';
import { AutomationService } from '../services/automation.service';
import {
  CreateScheduleInput,
  UpdateScheduleInput,
  AutoGenerateInput,
} from '../schemas/schedule.schema';

export class ScheduleController {
  constructor(
    private scheduleService: ScheduleService,
    private automationService: AutomationService
  ) {}

  async createSchedule(
    request: FastifyRequest<{ Body: CreateScheduleInput }>,
    reply: FastifyReply
  ) {
    try {
      const schedule = await this.scheduleService.createSchedule(request.body);
      reply.status(201).send({
        success: true,
        data: schedule,
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create schedule',
      });
    }
  }

  async getSchedule(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const schedule = await this.scheduleService.getScheduleById(request.params.id);

      if (!schedule) {
        reply.status(404).send({
          success: false,
          error: 'Schedule not found',
        });
        return;
      }

      reply.send({
        success: true,
        data: schedule,
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch schedule',
      });
    }
  }

  async getSchedulesByProperty(
    request: FastifyRequest<{ Params: { propertyId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const schedules = await this.scheduleService.getSchedulesByProperty(
        request.params.propertyId
      );
      reply.send({
        success: true,
        data: schedules,
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch schedules',
      });
    }
  }

  async updateSchedule(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateScheduleInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const schedule = await this.scheduleService.updateSchedule(
        request.params.id,
        request.body
      );
      reply.send({
        success: true,
        data: schedule,
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update schedule',
      });
    }
  }

  async deleteSchedule(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const schedule = await this.scheduleService.deleteSchedule(request.params.id);
      reply.send({
        success: true,
        data: schedule,
        message: 'Schedule deleted successfully',
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete schedule',
      });
    }
  }

  async processDueSchedules(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const tasksCreated = await this.scheduleService.processDueSchedules();
      reply.send({
        success: true,
        data: {
          tasksCreated,
        },
        message: `${tasksCreated} tasks created from due schedules`,
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process due schedules',
      });
    }
  }

  async autoGenerateTasks(
    request: FastifyRequest<{ Body: AutoGenerateInput }>,
    reply: FastifyReply
  ) {
    try {
      // This would integrate with property management service to fetch reservations
      // For now, return a placeholder response
      reply.send({
        success: true,
        message: 'Auto-generate tasks endpoint - would integrate with property management service',
        data: {
          dateFrom: request.body.dateFrom,
          dateTo: request.body.dateTo,
          taskTypes: request.body.taskTypes,
        },
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to auto-generate tasks',
      });
    }
  }
}
