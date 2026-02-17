import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const regions = await this.prisma.region.findMany({
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    return regions.map((region) => ({
      ...region,
      eventCount: region._count.events,
      _count: undefined,
    }));
  }

  async findOne(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { startDate: 'asc' },
          take: 20,
          include: {
            people: {
              include: { person: { select: { id: true, nameAr: true } } },
              take: 3,
            },
          },
        },
        _count: {
          select: { events: true },
        },
      },
    });

    if (!region) {
      throw new NotFoundException(`Region with ID "${id}" not found`);
    }

    return {
      ...region,
      eventCount: region._count.events,
      _count: undefined,
    };
  }

  async findByCode(code: string) {
    const region = await this.prisma.region.findUnique({
      where: { code },
      include: {
        events: {
          orderBy: { startDate: 'asc' },
          include: {
            people: {
              include: { person: { select: { id: true, nameAr: true } } },
              take: 3,
            },
          },
        },
        _count: {
          select: { events: true },
        },
      },
    });

    if (!region) {
      throw new NotFoundException(`Region with code "${code}" not found`);
    }

    return {
      ...region,
      eventCount: region._count.events,
      _count: undefined,
    };
  }

  async getGeoJson() {
    const regions = await this.prisma.region.findMany({
      where: {
        geometry: { not: Prisma.JsonNull },
      },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    return {
      type: 'FeatureCollection',
      features: regions.map((region) => ({
        type: 'Feature',
        properties: {
          id: region.id,
          code: region.code,
          name_ar: region.nameAr,
          name_en: region.nameEn,
          event_count: region._count.events,
        },
        geometry: region.geometry,
      })),
    };
  }
}
