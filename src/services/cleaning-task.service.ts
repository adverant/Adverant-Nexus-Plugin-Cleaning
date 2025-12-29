import { PrismaClient, CleaningTask, Prisma } from '@prisma/client';
import {
  CreateCleaningTaskInput,
  UpdateCleaningTaskInput,
  StartTaskInput,
  CompleteTaskInput,
  QueryTasksInput,
} from '../schemas/cleaning-task.schema';

export class CleaningTaskService {
  constructor(private prisma: PrismaClient) {}

  async createTask(data: CreateCleaningTaskInput): Promise<CleaningTask> {
    try {
      const task = await this.prisma.cleaningTask.create({
        data: {
          propertyId: data.propertyId,
          unitId: data.unitId,
          reservationId: data.reservationId,
          assignedCleanerId: data.assignedCleanerId,
          taskType: data.taskType,
          priority: data.priority,
          status: data.assignedCleanerId ? 'ASSIGNED' : 'SCHEDULED',
          scheduledDate: new Date(data.scheduledDate),
          scheduledStartTime: data.scheduledStartTime,
          estimatedDuration: data.estimatedDuration,
          checklistTemplate: data.checklistTemplate,
          checklist: [],
          accessCode: data.accessCode,
          accessMethod: data.accessMethod,
          coordinationNotes: data.coordinationNotes,
        },
        include: {
          cleaner: true,
        },
      });

      return task;
    } catch (error) {
      throw new Error(`Failed to create cleaning task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTaskById(taskId: string): Promise<CleaningTask | null> {
    try {
      return await this.prisma.cleaningTask.findUnique({
        where: { id: taskId },
        include: {
          cleaner: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async queryTasks(query: QueryTasksInput): Promise<{ tasks: CleaningTask[]; total: number }> {
    try {
      const where: Prisma.CleaningTaskWhereInput = {};

      if (query.propertyId) {
        where.propertyId = query.propertyId;
      }

      if (query.assignedCleanerId) {
        where.assignedCleanerId = query.assignedCleanerId;
      }

      if (query.status) {
        where.status = query.status;
      }

      if (query.taskType) {
        where.taskType = query.taskType;
      }

      if (query.dateFrom || query.dateTo) {
        where.scheduledDate = {};
        if (query.dateFrom) {
          where.scheduledDate.gte = new Date(query.dateFrom);
        }
        if (query.dateTo) {
          where.scheduledDate.lte = new Date(query.dateTo);
        }
      }

      const [tasks, total] = await Promise.all([
        this.prisma.cleaningTask.findMany({
          where,
          include: {
            cleaner: true,
          },
          orderBy: {
            scheduledDate: 'asc',
          },
          take: query.limit,
          skip: query.offset,
        }),
        this.prisma.cleaningTask.count({ where }),
      ]);

      return { tasks, total };
    } catch (error) {
      throw new Error(`Failed to query tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateTask(taskId: string, data: UpdateCleaningTaskInput): Promise<CleaningTask> {
    try {
      const updateData: Prisma.CleaningTaskUpdateInput = {};

      if (data.assignedCleanerId !== undefined) {
        updateData.assignedCleanerId = data.assignedCleanerId;
        if (data.assignedCleanerId && !data.status) {
          updateData.status = 'ASSIGNED';
        }
      }

      if (data.priority) {
        updateData.priority = data.priority;
      }

      if (data.status) {
        updateData.status = data.status;
      }

      if (data.scheduledDate) {
        updateData.scheduledDate = new Date(data.scheduledDate);
      }

      if (data.scheduledStartTime) {
        updateData.scheduledStartTime = data.scheduledStartTime;
      }

      if (data.estimatedDuration) {
        updateData.estimatedDuration = data.estimatedDuration;
      }

      if (data.cleanerNotes) {
        updateData.cleanerNotes = data.cleanerNotes;
      }

      if (data.managerNotes) {
        updateData.managerNotes = data.managerNotes;
      }

      if (data.accessCode) {
        updateData.accessCode = data.accessCode;
      }

      if (data.coordinationNotes) {
        updateData.coordinationNotes = data.coordinationNotes;
      }

      return await this.prisma.cleaningTask.update({
        where: { id: taskId },
        data: updateData,
        include: {
          cleaner: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async startTask(taskId: string, data: StartTaskInput): Promise<CleaningTask> {
    try {
      const task = await this.prisma.cleaningTask.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (task.status !== 'SCHEDULED' && task.status !== 'ASSIGNED') {
        throw new Error(`Cannot start task with status: ${task.status}`);
      }

      return await this.prisma.cleaningTask.update({
        where: { id: taskId },
        data: {
          status: 'IN_PROGRESS',
          actualStartTime: data.actualStartTime ? new Date(data.actualStartTime) : new Date(),
        },
        include: {
          cleaner: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to start task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async completeTask(taskId: string, data: CompleteTaskInput): Promise<CleaningTask> {
    try {
      const task = await this.prisma.cleaningTask.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (task.status !== 'IN_PROGRESS') {
        throw new Error(`Cannot complete task with status: ${task.status}`);
      }

      const endTime = data.actualEndTime ? new Date(data.actualEndTime) : new Date();
      const startTime = task.actualStartTime || new Date();
      const actualDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60);

      // Calculate checklist completion rate
      const completedTasks = data.checklist.filter(item => item.completed).length;
      const checklistCompletionRate = data.checklist.length > 0
        ? completedTasks / data.checklist.length
        : 0;

      // Calculate total supply cost
      const totalSupplyCost = data.suppliesUsed.reduce((sum, item) => sum + item.cost, 0);

      return await this.prisma.cleaningTask.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          actualEndTime: endTime,
          actualDuration,
          checklist: data.checklist as any,
          checklistCompletionRate,
          photosAfter: data.photosAfter as any,
          suppliesUsed: data.suppliesUsed as any,
          totalSupplyCost,
          issuesReported: data.issuesReported as any,
          cleanerNotes: data.cleanerNotes,
          completedAt: endTime,
        },
        include: {
          cleaner: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to complete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cancelTask(taskId: string, reason?: string): Promise<CleaningTask> {
    try {
      return await this.prisma.cleaningTask.update({
        where: { id: taskId },
        data: {
          status: 'CANCELLED',
          managerNotes: reason,
        },
        include: {
          cleaner: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to cancel task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTasksByDateRange(
    dateFrom: Date,
    dateTo: Date,
    propertyId?: string
  ): Promise<CleaningTask[]> {
    try {
      const where: Prisma.CleaningTaskWhereInput = {
        scheduledDate: {
          gte: dateFrom,
          lte: dateTo,
        },
      };

      if (propertyId) {
        where.propertyId = propertyId;
      }

      return await this.prisma.cleaningTask.findMany({
        where,
        include: {
          cleaner: true,
        },
        orderBy: {
          scheduledDate: 'asc',
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch tasks by date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCleanerPerformance(cleanerId: string, periodDays: number = 30): Promise<{
    totalTasks: number;
    completedTasks: number;
    averageRating: number;
    onTimeRate: number;
    averageDuration: number;
  }> {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - periodDays);

      const tasks = await this.prisma.cleaningTask.findMany({
        where: {
          assignedCleanerId: cleanerId,
          createdAt: {
            gte: dateFrom,
          },
        },
      });

      const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
      const ratedTasks = completedTasks.filter(t => t.qualityRating !== null);
      const averageRating = ratedTasks.length > 0
        ? ratedTasks.reduce((sum, t) => sum + (t.qualityRating || 0), 0) / ratedTasks.length
        : 0;

      const onTimeTasks = completedTasks.filter(t => {
        if (!t.actualEndTime || !t.scheduledDate) return false;
        const scheduled = new Date(t.scheduledDate);
        const ended = new Date(t.actualEndTime);
        return ended <= scheduled;
      });

      const onTimeRate = completedTasks.length > 0
        ? onTimeTasks.length / completedTasks.length
        : 0;

      const tasksWithDuration = completedTasks.filter(t => t.actualDuration !== null);
      const averageDuration = tasksWithDuration.length > 0
        ? tasksWithDuration.reduce((sum, t) => sum + (t.actualDuration || 0), 0) / tasksWithDuration.length
        : 0;

      return {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        averageRating,
        onTimeRate,
        averageDuration,
      };
    } catch (error) {
      throw new Error(`Failed to calculate cleaner performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
