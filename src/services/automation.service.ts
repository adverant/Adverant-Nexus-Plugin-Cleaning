import { PrismaClient, CleaningTask, Cleaner } from '@prisma/client';
import { config } from '../config/config';

interface PropertyLocation {
  latitude: number;
  longitude: number;
  zipCode: string;
}

export class AutomationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Auto-assign a cleaning task to the best available cleaner
   */
  async autoAssignTask(taskId: string): Promise<CleaningTask> {
    try {
      const task = await this.prisma.cleaningTask.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (task.assignedCleanerId) {
        throw new Error('Task is already assigned');
      }

      // Get property details (in production, fetch from property management service)
      const propertyLocation: PropertyLocation = {
        latitude: 0, // Would fetch from property service
        longitude: 0,
        zipCode: '00000',
      };

      // Find available cleaners
      const availableCleaners = await this.getAvailableCleaners(
        new Date(task.scheduledDate),
        propertyLocation.zipCode,
        task.propertyId
      );

      if (availableCleaners.length === 0) {
        throw new Error('No available cleaners found');
      }

      // Score and rank cleaners
      const scoredCleaners = this.scoreCleaners(availableCleaners, task, propertyLocation);

      // Assign to best cleaner
      const bestCleaner = scoredCleaners[0];

      return await this.prisma.cleaningTask.update({
        where: { id: taskId },
        data: {
          assignedCleanerId: bestCleaner.cleaner.id,
          assignmentMethod: 'AUTO_ASSIGNED',
          status: 'ASSIGNED',
        },
        include: {
          cleaner: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to auto-assign task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create cleaning tasks from reservations
   */
  async createTasksFromReservation(
    reservationId: string,
    propertyId: string,
    checkOutDate: Date,
    checkInDate: Date
  ): Promise<CleaningTask[]> {
    try {
      const tasks: CleaningTask[] = [];

      // Create checkout cleaning task
      const checkoutTask = await this.prisma.cleaningTask.create({
        data: {
          propertyId,
          reservationId,
          taskType: 'CHECKOUT',
          priority: 'HIGH',
          status: 'SCHEDULED',
          scheduledDate: checkOutDate,
          scheduledStartTime: '11:00', // Default checkout time
          estimatedDuration: 120, // 2 hours
          checklistTemplate: 'checkout',
          checklist: [],
          assignmentMethod: 'AUTO_ASSIGNED',
        },
      });

      tasks.push(checkoutTask);

      // Auto-assign if enabled
      if (config.autoAssignment.enabled) {
        try {
          await this.autoAssignTask(checkoutTask.id);
        } catch (error) {
          console.error('Failed to auto-assign checkout task:', error);
        }
      }

      // Create mid-stay cleaning for stays longer than 7 days
      const nightsStay = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (nightsStay > 7) {
        const midStayDate = new Date(checkInDate);
        midStayDate.setDate(midStayDate.getDate() + Math.floor(nightsStay / 2));

        const midStayTask = await this.prisma.cleaningTask.create({
          data: {
            propertyId,
            reservationId,
            taskType: 'MID_STAY',
            priority: 'NORMAL',
            status: 'SCHEDULED',
            scheduledDate: midStayDate,
            scheduledStartTime: '10:00',
            estimatedDuration: 90,
            checklistTemplate: 'mid-stay',
            checklist: [],
            assignmentMethod: 'AUTO_ASSIGNED',
          },
        });

        tasks.push(midStayTask);

        if (config.autoAssignment.enabled) {
          try {
            await this.autoAssignTask(midStayTask.id);
          } catch (error) {
            console.error('Failed to auto-assign mid-stay task:', error);
          }
        }
      }

      return tasks;
    } catch (error) {
      throw new Error(`Failed to create tasks from reservation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Optimize cleaning routes for a cleaner on a specific date
   */
  async optimizeRoute(cleanerId: string, date: Date): Promise<{
    taskIds: string[];
    totalDistance: number;
    estimatedDuration: number;
  }> {
    try {
      const tasks = await this.prisma.cleaningTask.findMany({
        where: {
          assignedCleanerId: cleanerId,
          scheduledDate: date,
          status: {
            in: ['SCHEDULED', 'ASSIGNED'],
          },
        },
        orderBy: {
          priority: 'desc',
        },
      });

      if (tasks.length === 0) {
        return {
          taskIds: [],
          totalDistance: 0,
          estimatedDuration: 0,
        };
      }

      // Simple optimization: sort by priority, then by estimated duration
      // In production, would use Google Maps Distance Matrix API for real route optimization
      const optimizedTasks = tasks.sort((a, b) => {
        if (a.priority !== b.priority) {
          const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.scheduledStartTime.localeCompare(b.scheduledStartTime);
      });

      const totalDistance = 0; // Would calculate using Maps API
      const estimatedDuration = optimizedTasks.reduce(
        (sum, task) => sum + task.estimatedDuration + 15, // +15 min travel time
        0
      );

      // Store optimized route
      await this.prisma.cleaningRoute.upsert({
        where: {
          cleanerId_routeDate: {
            cleanerId,
            routeDate: date,
          },
        },
        create: {
          cleanerId,
          routeDate: date,
          taskIds: optimizedTasks.map(t => t.id) as any,
          totalDistance,
          estimatedStart: optimizedTasks[0]?.scheduledStartTime || '09:00',
          estimatedEnd: this.calculateEndTime(
            optimizedTasks[0]?.scheduledStartTime || '09:00',
            estimatedDuration
          ),
          status: 'PLANNED',
        },
        update: {
          taskIds: optimizedTasks.map(t => t.id) as any,
          totalDistance,
          estimatedStart: optimizedTasks[0]?.scheduledStartTime || '09:00',
          estimatedEnd: this.calculateEndTime(
            optimizedTasks[0]?.scheduledStartTime || '09:00',
            estimatedDuration
          ),
        },
      });

      return {
        taskIds: optimizedTasks.map(t => t.id),
        totalDistance,
        estimatedDuration,
      };
    } catch (error) {
      throw new Error(`Failed to optimize route: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check and create quality inspection tasks
   */
  async scheduleQualityChecks(): Promise<number> {
    try {
      const recentCompletedTasks = await this.prisma.cleaningTask.findMany({
        where: {
          status: 'COMPLETED',
          qualityCheckRequired: true,
          qualityCheckDone: false,
          completedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      });

      // Also select random tasks for quality check
      const allCompletedTasks = await this.prisma.cleaningTask.findMany({
        where: {
          status: 'COMPLETED',
          qualityCheckDone: false,
          completedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      const randomChecks = allCompletedTasks
        .filter(() => Math.random() < config.qualityCheck.randomCheckPercentage)
        .map(task => task.id);

      const tasksToCheck = new Set([
        ...recentCompletedTasks.map(t => t.id),
        ...randomChecks,
      ]);

      // Mark tasks as requiring quality check
      await this.prisma.cleaningTask.updateMany({
        where: {
          id: {
            in: Array.from(tasksToCheck),
          },
        },
        data: {
          qualityCheckRequired: true,
        },
      });

      return tasksToCheck.size;
    } catch (error) {
      throw new Error(`Failed to schedule quality checks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available cleaners for a specific date and location
   */
  private async getAvailableCleaners(
    date: Date,
    zipCode: string,
    propertyId: string
  ): Promise<Cleaner[]> {
    try {
      const cleaners = await this.prisma.cleaner.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          cleaningTasks: {
            where: {
              scheduledDate: date,
              status: {
                in: ['SCHEDULED', 'ASSIGNED', 'IN_PROGRESS'],
              },
            },
          },
          availabilityBlocks: {
            where: {
              date: date,
            },
          },
        },
      });

      return cleaners.filter(cleaner => {
        // Check availability blocks
        const hasUnavailability = cleaner.availabilityBlocks.some(
          block => !block.isAvailable
        );
        if (hasUnavailability) {
          return false;
        }

        // Check max tasks per day
        if (cleaner.cleaningTasks.length >= cleaner.maxTasksPerDay) {
          return false;
        }

        // Check service area
        const serviceZipCodes = cleaner.serviceZipCodes as string[];
        const serviceProperties = cleaner.serviceProperties as string[];

        if (serviceProperties.length > 0 && !serviceProperties.includes(propertyId)) {
          return false;
        }

        if (serviceZipCodes.length > 0 && !serviceZipCodes.includes(zipCode)) {
          return false;
        }

        return true;
      });
    } catch (error) {
      throw new Error(`Failed to get available cleaners: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Score cleaners based on various factors
   */
  private scoreCleaners(
    cleaners: Cleaner[],
    task: CleaningTask,
    propertyLocation: PropertyLocation
  ): Array<{ cleaner: Cleaner; score: number }> {
    const scored = cleaners.map(cleaner => {
      let score = 0;

      // Rating score (0-50 points)
      if (cleaner.averageRating) {
        score += Number(cleaner.averageRating) * 10;
      }

      // Experience score (0-20 points)
      score += Math.min(cleaner.totalTasksCompleted / 10, 20);

      // On-time rate (0-20 points)
      if (cleaner.onTimeCompletionRate) {
        score += Number(cleaner.onTimeCompletionRate) * 20;
      }

      // Workload balance (0-10 points) - prefer less loaded cleaners
      const currentLoad = (cleaner as any).cleaningTasks?.length || 0;
      score += (cleaner.maxTasksPerDay - currentLoad) * 2;

      return { cleaner, score };
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate end time given start time and duration in minutes
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }
}
