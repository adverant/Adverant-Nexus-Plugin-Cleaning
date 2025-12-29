import { PrismaClient, CleaningSchedule, Prisma } from '@prisma/client';
import {
  CreateScheduleInput,
  UpdateScheduleInput,
  AutoGenerateInput,
} from '../schemas/schedule.schema';

export class ScheduleService {
  constructor(private prisma: PrismaClient) {}

  async createSchedule(data: CreateScheduleInput): Promise<CleaningSchedule> {
    try {
      const nextExecution = this.calculateNextExecution(
        data.scheduleType,
        data.frequency,
        data.dayOfWeek,
        data.dayOfMonth,
        data.preferredTime
      );

      return await this.prisma.cleaningSchedule.create({
        data: {
          propertyId: data.propertyId,
          scheduleType: data.scheduleType,
          frequency: data.frequency,
          dayOfWeek: data.dayOfWeek,
          dayOfMonth: data.dayOfMonth,
          preferredTime: data.preferredTime,
          duration: data.duration,
          preferredCleanerId: data.preferredCleanerId,
          autoAssign: data.autoAssign,
          taskType: data.taskType,
          checklistTemplate: data.checklistTemplate,
          nextExecution,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getScheduleById(scheduleId: string): Promise<CleaningSchedule | null> {
    try {
      return await this.prisma.cleaningSchedule.findUnique({
        where: { id: scheduleId },
      });
    } catch (error) {
      throw new Error(`Failed to fetch schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSchedulesByProperty(propertyId: string): Promise<CleaningSchedule[]> {
    try {
      return await this.prisma.cleaningSchedule.findMany({
        where: {
          propertyId,
          isActive: true,
        },
        orderBy: {
          nextExecution: 'asc',
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch property schedules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateSchedule(scheduleId: string, data: UpdateScheduleInput): Promise<CleaningSchedule> {
    try {
      const schedule = await this.prisma.cleaningSchedule.findUnique({
        where: { id: scheduleId },
      });

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      const updateData: Prisma.CleaningScheduleUpdateInput = {};

      if (data.frequency) updateData.frequency = data.frequency;
      if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
      if (data.dayOfMonth !== undefined) updateData.dayOfMonth = data.dayOfMonth;
      if (data.preferredTime) updateData.preferredTime = data.preferredTime;
      if (data.duration) updateData.duration = data.duration;
      if (data.preferredCleanerId !== undefined) updateData.preferredCleanerId = data.preferredCleanerId;
      if (data.autoAssign !== undefined) updateData.autoAssign = data.autoAssign;
      if (data.taskType) updateData.taskType = data.taskType;
      if (data.checklistTemplate) updateData.checklistTemplate = data.checklistTemplate;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      // Recalculate next execution if relevant fields changed
      if (data.frequency || data.dayOfWeek !== undefined || data.dayOfMonth !== undefined || data.preferredTime) {
        updateData.nextExecution = this.calculateNextExecution(
          schedule.scheduleType,
          data.frequency || schedule.frequency,
          data.dayOfWeek !== undefined ? data.dayOfWeek : schedule.dayOfWeek,
          data.dayOfMonth !== undefined ? data.dayOfMonth : schedule.dayOfMonth,
          data.preferredTime || schedule.preferredTime
        );
      }

      return await this.prisma.cleaningSchedule.update({
        where: { id: scheduleId },
        data: updateData,
      });
    } catch (error) {
      throw new Error(`Failed to update schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteSchedule(scheduleId: string): Promise<CleaningSchedule> {
    try {
      return await this.prisma.cleaningSchedule.update({
        where: { id: scheduleId },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processDueSchedules(): Promise<number> {
    try {
      const now = new Date();

      const dueSchedules = await this.prisma.cleaningSchedule.findMany({
        where: {
          isActive: true,
          nextExecution: {
            lte: now,
          },
        },
      });

      let tasksCreated = 0;

      for (const schedule of dueSchedules) {
        try {
          // Create cleaning task from schedule
          await this.prisma.cleaningTask.create({
            data: {
              propertyId: schedule.propertyId,
              assignedCleanerId: schedule.preferredCleanerId || undefined,
              assignmentMethod: schedule.autoAssign ? 'AUTO_ASSIGNED' : 'MANUAL',
              taskType: schedule.taskType,
              priority: 'NORMAL',
              status: schedule.preferredCleanerId ? 'ASSIGNED' : 'SCHEDULED',
              scheduledDate: schedule.nextExecution!,
              scheduledStartTime: schedule.preferredTime,
              estimatedDuration: schedule.duration,
              checklistTemplate: schedule.checklistTemplate,
              checklist: [],
            },
          });

          // Update schedule with next execution
          const nextExecution = this.calculateNextExecution(
            schedule.scheduleType,
            schedule.frequency,
            schedule.dayOfWeek,
            schedule.dayOfMonth,
            schedule.preferredTime
          );

          await this.prisma.cleaningSchedule.update({
            where: { id: schedule.id },
            data: {
              lastExecuted: now,
              nextExecution,
            },
          });

          tasksCreated++;
        } catch (error) {
          console.error(`Failed to process schedule ${schedule.id}:`, error);
        }
      }

      return tasksCreated;
    } catch (error) {
      throw new Error(`Failed to process due schedules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private calculateNextExecution(
    scheduleType: string,
    frequency: string | null,
    dayOfWeek: number | null,
    dayOfMonth: number | null,
    preferredTime: string
  ): Date | null {
    if (scheduleType === 'ONE_TIME') {
      return null;
    }

    const now = new Date();
    const next = new Date(now);
    const [hours, minutes] = preferredTime.split(':').map(Number);

    next.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'daily':
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;

      case 'weekly':
        if (dayOfWeek !== null) {
          const currentDay = next.getDay();
          let daysUntilNext = dayOfWeek - currentDay;
          if (daysUntilNext < 0 || (daysUntilNext === 0 && next <= now)) {
            daysUntilNext += 7;
          }
          next.setDate(next.getDate() + daysUntilNext);
        }
        break;

      case 'biweekly':
        if (dayOfWeek !== null) {
          const currentDay = next.getDay();
          let daysUntilNext = dayOfWeek - currentDay;
          if (daysUntilNext < 0 || (daysUntilNext === 0 && next <= now)) {
            daysUntilNext += 14;
          }
          next.setDate(next.getDate() + daysUntilNext);
        }
        break;

      case 'monthly':
        if (dayOfMonth !== null) {
          next.setDate(dayOfMonth);
          if (next <= now) {
            next.setMonth(next.getMonth() + 1);
          }
        }
        break;

      default:
        return null;
    }

    return next;
  }
}
