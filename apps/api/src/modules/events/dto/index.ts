import {
  IsString,
  IsEnum,
  IsUUID,
  IsDateString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// Event types enum matching Prisma
export enum EventTypeDto {
  REVOLUTION = 'REVOLUTION',
  UPRISING = 'UPRISING',
  BATTLE = 'BATTLE',
  SIEGE = 'SIEGE',
  RESISTANCE = 'RESISTANCE',
  RAID = 'RAID',
}

export enum ReviewStatusDto {
  CONFIRMED = 'CONFIRMED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  UNVERIFIED = 'UNVERIFIED',
  DRAFT = 'DRAFT',
}

// Nested DTO for person assignment
class PersonAssignmentDto {
  @ApiProperty()
  @IsUUID()
  personId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  role: string;
}

// Coordinates DTO
class CoordinatesDto {
  @ApiProperty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

// Parties DTO
class PartiesDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resistance?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colonial?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  other?: string[];
}

/**
 * DTO for creating a new event
 */
export class CreateEventDto {
  @ApiProperty({ description: 'Event title in Arabic', example: 'ثورة الأمير عبد القادر' })
  @IsString()
  @MinLength(5, { message: 'العنوان يجب أن يكون 5 أحرف على الأقل' })
  @MaxLength(500, { message: 'العنوان يجب ألا يتجاوز 500 حرف' })
  title: string;

  @ApiProperty({ enum: EventTypeDto, description: 'Event type' })
  @IsEnum(EventTypeDto)
  type: EventTypeDto;

  @ApiProperty({ description: 'Region ID (String)' })
  @IsString()
  regionId: string;

  @ApiProperty({ description: 'Start date (YYYY-MM-DD)', example: '1832-11-22' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)', example: '1847-12-23' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Short description in Arabic' })
  @IsString()
  @MinLength(20, { message: 'الوصف يجب أن يكون 20 حرفاً على الأقل' })
  @MaxLength(1000, { message: 'الوصف يجب ألا يتجاوز 1000 حرف' })
  description: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  detailedDescription?: string;

  @ApiPropertyOptional({ type: CoordinatesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @ApiPropertyOptional({ description: 'Outcome/impact of the event' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  outcome?: string;

  @ApiPropertyOptional({ description: 'Casualties description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  casualtiesText?: string;

  @ApiPropertyOptional({ description: 'Estimated casualties number' })
  @IsOptional()
  @IsInt()
  @Min(0)
  casualtiesEstimated?: number;

  @ApiPropertyOptional({ type: PartiesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartiesDto)
  parties?: PartiesDto;

  @ApiPropertyOptional({ type: [String], description: 'Source IDs to link' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sourceIds?: string[];

  @ApiPropertyOptional({ type: [PersonAssignmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonAssignmentDto)
  personIds?: PersonAssignmentDto[];

  @ApiPropertyOptional({ type: [String], description: 'Tag IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}

/**
 * DTO for updating an event
 */
export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiPropertyOptional({ enum: ReviewStatusDto })
  @IsOptional()
  @IsEnum(ReviewStatusDto)
  reviewStatus?: ReviewStatusDto;
}

/**
 * DTO for event list query parameters
 */
export class EventListQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 'startDate' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'startDate';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({ description: 'Search in title and description' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by region ID' })
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiPropertyOptional({ enum: EventTypeDto, description: 'Filter by event type' })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  type?: EventTypeDto | EventTypeDto[];

  @ApiPropertyOptional({ minimum: 1830, maximum: 1954 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1830)
  @Max(1954)
  startYear?: number;

  @ApiPropertyOptional({ minimum: 1830, maximum: 1954 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1830)
  @Max(1954)
  endYear?: number;

  @ApiPropertyOptional({ enum: ReviewStatusDto })
  @IsOptional()
  @IsEnum(ReviewStatusDto)
  reviewStatus?: ReviewStatusDto;
}

/**
 * DTO for updating review status
 */
export class UpdateStatusDto {
  @ApiProperty({ enum: ReviewStatusDto })
  @IsEnum(ReviewStatusDto)
  status: ReviewStatusDto;
}
