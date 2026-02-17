import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SourceType } from '@prisma/client';

export interface CreateSourceDto {
  title: string;
  author?: string;
  year?: number;
  publisher?: string;
  type: SourceType;
  url?: string;
  isbn?: string;
  notes?: string;
}

@Injectable()
export class SourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.source.findMany({
      orderBy: { title: 'asc' },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const source = await this.prisma.source.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            event: {
              select: { id: true, title: true, type: true },
            },
          },
        },
      },
    });

    if (!source) {
      throw new NotFoundException(`Source with ID "${id}" not found`);
    }

    return source;
  }

  async create(dto: CreateSourceDto) {
    return this.prisma.source.create({
      data: dto,
    });
  }

  async update(id: string, dto: Partial<CreateSourceDto>) {
    await this.findOne(id);
    return this.prisma.source.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.source.delete({ where: { id } });
    return { message: 'Source deleted successfully' };
  }

  async search(query: string) {
    return this.prisma.source.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
  }
}
