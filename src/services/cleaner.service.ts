import { PrismaClient, Cleaner, CleanerAvailability, Prisma } from '@prisma/client';
import {
  CreateCleanerInput,
  UpdateCleanerInput,
  QueryCleanersInput,
  AvailabilityInput,
} from '../schemas/cleaner.schema';

export class CleanerService {
  constructor(private prisma: PrismaClient) {}

  async createCleaner(data: CreateCleanerInput): Promise<Cleaner> {
    try {
      const existingCleaner = await this.prisma.cleaner.findUnique({
        where: { email: data.email },
      });

      if (existingCleaner) {
        throw new Error('Cleaner with this email already exists');
      }

      return await this.prisma.cleaner.create({
        data: {
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          employmentType: data.employmentType,
          specialties: data.specialties as any,
          certifications: data.certifications as any,
          languages: data.languages as any,
          serviceZipCodes: data.serviceZipCodes as any,
          serviceProperties: data.serviceProperties as any,
          workSchedule: data.workSchedule as any,
          maxTasksPerDay: data.maxTasksPerDay,
          hourlyRate: data.hourlyRate,
          paymentMethod: data.paymentMethod,
          paymentDetails: data.paymentDetails as any,
          emergencyContact: data.emergencyContact as any,
          photoUrl: data.photoUrl,
          bio: data.bio,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create cleaner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCleanerById(cleanerId: string): Promise<Cleaner | null> {
    try {
      return await this.prisma.cleaner.findUnique({
        where: { id: cleanerId },
        include: {
          cleaningTasks: {
            where: {
              status: {
                in: ['SCHEDULED', 'ASSIGNED', 'IN_PROGRESS'],
              },
            },
            orderBy: {
              scheduledDate: 'asc',
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch cleaner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async queryCleaners(query: QueryCleanersInput): Promise<{ cleaners: Cleaner[]; total: number }> {
    try {
      const where: Prisma.CleanerWhereInput = {};

      if (query.status) {
        where.status = query.status;
      }

      if (query.specialty) {
        where.specialties = {
          array_contains: [query.specialty],
        };
      }

      if (query.zipCode) {
        where.serviceZipCodes = {
          array_contains: [query.zipCode],
        };
      }

      if (query.minRating !== undefined) {
        where.averageRating = {
          gte: query.minRating,
        };
      }

      const [cleaners, total] = await Promise.all([
        this.prisma.cleaner.findMany({
          where,
          orderBy: {
            averageRating: 'desc',
          },
          take: query.limit,
          skip: query.offset,
        }),
        this.prisma.cleaner.count({ where }),
      ]);

      return { cleaners, total };
    } catch (error) {
      throw new Error(`Failed to query cleaners: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateCleaner(cleanerId: string, data: UpdateCleanerInput): Promise<Cleaner> {
    try {
      const updateData: Prisma.CleanerUpdateInput = {};

      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.email) updateData.email = data.email;
      if (data.phone) updateData.phone = data.phone;
      if (data.employmentType) updateData.employmentType = data.employmentType;
      if (data.status) updateData.status = data.status;
      if (data.specialties) updateData.specialties = data.specialties as any;
      if (data.certifications) updateData.certifications = data.certifications as any;
      if (data.languages) updateData.languages = data.languages as any;
      if (data.serviceZipCodes) updateData.serviceZipCodes = data.serviceZipCodes as any;
      if (data.serviceProperties) updateData.serviceProperties = data.serviceProperties as any;
      if (data.workSchedule) updateData.workSchedule = data.workSchedule as any;
      if (data.maxTasksPerDay) updateData.maxTasksPerDay = data.maxTasksPerDay;
      if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
      if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
      if (data.paymentDetails) updateData.paymentDetails = data.paymentDetails as any;
      if (data.emergencyContact) updateData.emergencyContact = data.emergencyContact as any;
      if (data.photoUrl) updateData.photoUrl = data.photoUrl;
      if (data.bio) updateData.bio = data.bio;

      return await this.prisma.cleaner.update({
        where: { id: cleanerId },
        data: updateData,
      });
    } catch (error) {
      throw new Error(`Failed to update cleaner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteCleaner(cleanerId: string): Promise<Cleaner> {
    try {
      // Check if cleaner has active tasks
      const activeTasks = await this.prisma.cleaningTask.count({
        where: {
          assignedCleanerId: cleanerId,
          status: {
            in: ['SCHEDULED', 'ASSIGNED', 'IN_PROGRESS'],
          },
        },
      });

      if (activeTasks > 0) {
        throw new Error('Cannot delete cleaner with active tasks');
      }

      // Soft delete by setting status to TERMINATED
      return await this.prisma.cleaner.update({
        where: { id: cleanerId },
        data: {
          status: 'TERMINATED',
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete cleaner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async setAvailability(cleanerId: string, data: AvailabilityInput): Promise<CleanerAvailability> {
    try {
      return await this.prisma.cleanerAvailability.upsert({
        where: {
          cleanerId_date_startTime: {
            cleanerId,
            date: new Date(data.date),
            startTime: data.startTime,
          },
        },
        create: {
          cleanerId,
          date: new Date(data.date),
          startTime: data.startTime,
          endTime: data.endTime,
          isAvailable: data.isAvailable,
          reason: data.reason,
        },
        update: {
          endTime: data.endTime,
          isAvailable: data.isAvailable,
          reason: data.reason,
        },
      });
    } catch (error) {
      throw new Error(`Failed to set availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAvailability(
    cleanerId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<CleanerAvailability[]> {
    try {
      return await this.prisma.cleanerAvailability.findMany({
        where: {
          cleanerId,
          date: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAvailableCleaners(
    date: Date,
    zipCode?: string,
    propertyId?: string
  ): Promise<Cleaner[]> {
    try {
      const where: Prisma.CleanerWhereInput = {
        status: 'ACTIVE',
      };

      if (zipCode) {
        where.serviceZipCodes = {
          array_contains: [zipCode],
        };
      }

      if (propertyId) {
        where.OR = [
          {
            serviceProperties: {
              array_contains: [propertyId],
            },
          },
          {
            serviceProperties: {
              equals: [],
            },
          },
        ];
      }

      const cleaners = await this.prisma.cleaner.findMany({
        where,
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

      // Filter cleaners who are available and not overbooked
      return cleaners.filter(cleaner => {
        // Check availability blocks
        const hasAvailabilityBlock = cleaner.availabilityBlocks.some(
          block => block.isAvailable
        );
        const hasUnavailabilityBlock = cleaner.availabilityBlocks.some(
          block => !block.isAvailable
        );

        if (hasUnavailabilityBlock) {
          return false;
        }

        // Check max tasks per day
        if (cleaner.cleaningTasks.length >= cleaner.maxTasksPerDay) {
          return false;
        }

        return true;
      });
    } catch (error) {
      throw new Error(`Failed to fetch available cleaners: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updatePerformanceMetrics(cleanerId: string): Promise<Cleaner> {
    try {
      const completedTasks = await this.prisma.cleaningTask.findMany({
        where: {
          assignedCleanerId: cleanerId,
          status: 'COMPLETED',
        },
      });

      const ratedTasks = completedTasks.filter(t => t.qualityRating !== null);
      const averageRating = ratedTasks.length > 0
        ? ratedTasks.reduce((sum, t) => sum + (t.qualityRating || 0), 0) / ratedTasks.length
        : null;

      const tasksWithEndTime = completedTasks.filter(t => t.actualEndTime && t.scheduledDate);
      const onTimeTasks = tasksWithEndTime.filter(t => {
        const scheduled = new Date(t.scheduledDate);
        const ended = new Date(t.actualEndTime!);
        return ended <= scheduled;
      });

      const onTimeCompletionRate = tasksWithEndTime.length > 0
        ? onTimeTasks.length / tasksWithEndTime.length
        : null;

      return await this.prisma.cleaner.update({
        where: { id: cleanerId },
        data: {
          averageRating,
          totalRatings: ratedTasks.length,
          totalTasksCompleted: completedTasks.length,
          onTimeCompletionRate,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
