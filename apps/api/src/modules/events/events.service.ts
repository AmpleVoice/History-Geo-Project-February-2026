import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma, EventType, ReviewStatus } from "@prisma/client";
import { CreateEventDto, UpdateEventDto, EventListQueryDto } from "./dto";

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all events with filters and pagination
   */
  async findAll(query: EventListQueryDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = "startDate",
      sortOrder = "asc",
      search,
      regionId,
      type,
      startYear,
      endYear,
      reviewStatus,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.EventWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { detailedDescription: { contains: search, mode: "insensitive" } },
        { outcome: { contains: search, mode: "insensitive" } },
        {
          people: {
            some: {
              person: {
                nameAr: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
        {
          region: {
            nameAr: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (regionId) {
      where.region = {
        code: regionId,
      };
    }

    if (type) {
      if (Array.isArray(type)) {
        where.type = { in: type as EventType[] };
      } else {
        where.type = type as EventType;
      }
    }

    if (startYear) {
      where.startDate = {
        ...((where.startDate as Prisma.DateTimeFilter) || {}),
        gte: new Date(`${startYear}-01-01`),
      };
    }

    if (endYear) {
      where.startDate = {
        ...((where.startDate as Prisma.DateTimeFilter) || {}),
        lte: new Date(`${endYear}-12-31`),
      };
    }

    if (reviewStatus) {
      where.reviewStatus = reviewStatus as ReviewStatus;
    }

    // Execute query
    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          region: {
            select: { id: true, nameAr: true, code: true },
          },
          people: {
            include: {
              person: {
                select: { id: true, nameAr: true, role: true },
              },
            },
          },
          sources: {
            include: {
              source: true,
            },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find event by ID
   */
  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        region: true,
        people: {
          include: {
            person: true,
          },
        },
        sources: {
          include: {
            source: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    return event;
  }

  /**
   * Create new event
   */
  async create(dto: CreateEventDto, userId: string) {
    // 1. Destructure coordinates AND parties out of the dto
    const { sourceIds, personIds, tagIds, coordinates, parties, ...eventData } =
      dto;

    const event = await this.prisma.event.create({
      data: {
        ...eventData,
        // 2. Cast BOTH to InputJsonValue
        coordinates: coordinates as unknown as Prisma.InputJsonValue,
        parties: parties as unknown as Prisma.InputJsonValue,

        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        createdById: userId,
        reviewStatus: "DRAFT",

        sources: sourceIds?.length
          ? {
              create: sourceIds.map((sourceId) => ({
                sourceId,
              })),
            }
          : undefined,
        // ... (rest of your code for people and tags)
      },
      include: {
        region: true,
        sources: { include: { source: true } },
        people: { include: { person: true } },
      },
    });

    return event;
  }

  /**
   * Update event
   */
  async update(id: string, dto: UpdateEventDto, userId: string) {
    // Check event exists
    await this.findOne(id);

    // 1. Destructure JSON fields (coordinates, parties) to handle types
    const { sourceIds, personIds, tagIds, coordinates, parties, ...eventData } =
      dto;

    // 2. Build the update object carefully
    const updateData: Prisma.EventUpdateInput = {
      ...eventData,
      // Fix: Use the relation name 'updatedBy' instead of 'updatedById'
      updatedBy: { connect: { id: userId } },
    };

    // 3. Cast JSON fields if they exist in the DTO
    if (coordinates) {
      updateData.coordinates = coordinates as unknown as Prisma.InputJsonValue;
    }
    if (parties) {
      updateData.parties = parties as unknown as Prisma.InputJsonValue;
    }

    if (dto.startDate) {
      updateData.startDate = new Date(dto.startDate);
    }

    if (dto.endDate !== undefined) {
      updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }

    // Update event
    const event = await this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        region: true,
        sources: { include: { source: true } },
        people: { include: { person: true } },
      },
    });

    // ... (rest of your relation logic remains the same)

    return this.findOne(id);
  }

  /**
   * Delete event
   */
  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return { message: "Event deleted successfully" };
  }

  /**
   * Update review status
   */
  async updateStatus(id: string, status: ReviewStatus, userId: string) {
    await this.findOne(id);

    return this.prisma.event.update({
      where: { id },
      data: {
        reviewStatus: status,
        updatedById: userId,
      },
    });
  }

  /**
   * Get events by region
   */
  async findByRegion(regionId: string) {
    return this.prisma.event.findMany({
      where: {
        region: {
          code: regionId, // Now it expects "31", "16", etc.
        },
      },
      orderBy: { startDate: "asc" },
      include: {
        region: {
          select: { id: true, nameAr: true, code: true },
        },
        people: {
          include: {
            person: {
              select: { id: true, nameAr: true },
            },
          },
          take: 3,
        },
      },
    });
  }

  /**
   * Get event statistics
   */
  async getStatistics() {
    const [total, byType, byStatus, byRegion] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.event.groupBy({
        by: ["type"],
        _count: true,
      }),
      this.prisma.event.groupBy({
        by: ["reviewStatus"],
        _count: true,
      }),
      this.prisma.event.groupBy({
        by: ["regionId"],
        _count: true,
      }),
    ]);

    return {
      total,
      byType: byType.map((t) => ({ type: t.type, count: t._count })),
      byStatus: byStatus.map((s) => ({
        status: s.reviewStatus,
        count: s._count,
      })),
      regionsWithEvents: byRegion.length,
    };
  }
}
