import { FastifyRequest, FastifyReply } from 'fastify';
import { CleaningTaskService } from '../services/cleaning-task.service';
import { AutomationService } from '../services/automation.service';
import {
  CreateCleaningTaskInput,
  UpdateCleaningTaskInput,
  StartTaskInput,
  CompleteTaskInput,
  QueryTasksInput,
} from '../schemas/cleaning-task.schema';

export class CleaningTaskController {
  constructor(
    private taskService: CleaningTaskService,
    private automationService: AutomationService
  ) {}

  async createTask(
    request: FastifyRequest<{ Body: CreateCleaningTaskInput }>,
    reply: FastifyReply
  ) {
    try {
      const task = await this.taskService.createTask(request.body);
      reply.status(201).send({
        success: true,
        data: task,
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      });
    }
  }

  async getTask(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const task = await this.taskService.getTaskById(request.params.id);

      if (!task) {
        reply.status(404).send({
          success: false,
          error: 'Task not found',
        });
        return;
      }

      reply.send({
        success: true,
        data: task,
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch task',
      });
    }
  }

  async queryTasks(
    request: FastifyRequest<{ Querystring: QueryTasksInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await this.taskService.queryTasks(request.query);
      reply.send({
        success: true,
        data: result.tasks,
        pagination: {
          total: result.total,
          limit: request.query.limit,
          offset: request.query.offset,
        },
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query tasks',
      });
    }
  }

  async updateTask(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateCleaningTaskInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const task = await this.taskService.updateTask(request.params.id, request.body);
      reply.send({
        success: true,
        data: task,
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task',
      });
    }
  }

  async startTask(
    request: FastifyRequest<{
      Params: { id: string };
      Body: StartTaskInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const task = await this.taskService.startTask(request.params.id, request.body);
      reply.send({
        success: true,
        data: task,
        message: 'Task started successfully',
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start task',
      });
    }
  }

  async completeTask(
    request: FastifyRequest<{
      Params: { id: string };
      Body: CompleteTaskInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      const task = await this.taskService.completeTask(request.params.id, request.body);
      reply.send({
        success: true,
        data: task,
        message: 'Task completed successfully',
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete task',
      });
    }
  }

  async cancelTask(
    request: FastifyRequest<{
      Params: { id: string };
      Body: { reason?: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const task = await this.taskService.cancelTask(
        request.params.id,
        request.body.reason
      );
      reply.send({
        success: true,
        data: task,
        message: 'Task cancelled successfully',
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel task',
      });
    }
  }

  async autoAssignTask(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const task = await this.automationService.autoAssignTask(request.params.id);
      reply.send({
        success: true,
        data: task,
        message: 'Task auto-assigned successfully',
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to auto-assign task',
      });
    }
  }

  async getCleanerPerformance(
    request: FastifyRequest<{
      Params: { cleanerId: string };
      Querystring: { periodDays?: number };
    }>,
    reply: FastifyReply
  ) {
    try {
      const performance = await this.taskService.getCleanerPerformance(
        request.params.cleanerId,
        request.query.periodDays
      );
      reply.send({
        success: true,
        data: performance,
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch performance',
      });
    }
  }
}
