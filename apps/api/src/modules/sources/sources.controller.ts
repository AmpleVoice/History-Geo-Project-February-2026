import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SourcesService, CreateSourceDto } from './sources.service';
import { IsString, IsEnum, IsOptional, IsInt, Min, Max, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum SourceTypeDto {
  BOOK = 'BOOK',
  ARTICLE = 'ARTICLE',
  ARCHIVE = 'ARCHIVE',
  ENCYCLOPEDIA = 'ENCYCLOPEDIA',
  THESIS = 'THESIS',
  WEBSITE = 'WEBSITE',
  DOCUMENT = 'DOCUMENT',
}

class CreateSourceRequestDto implements CreateSourceDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  author?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1500)
  @Max(2030)
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  publisher?: string;

  @ApiProperty({ enum: SourceTypeDto })
  @IsEnum(SourceTypeDto)
  type: SourceTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

@ApiTags('sources')
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sources' })
  async findAll() {
    return this.sourcesService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search sources by title or author' })
  async search(@Query('q') query: string) {
    return this.sourcesService.search(query || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get source by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new source' })
  async create(@Body() dto: CreateSourceRequestDto) {
    return this.sourcesService.create(dto as any);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a source' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateSourceRequestDto>,
  ) {
    return this.sourcesService.update(id, dto as any);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a source' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.sourcesService.delete(id);
  }
}
