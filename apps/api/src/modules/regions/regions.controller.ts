import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RegionsService } from './regions.service';

@ApiTags('regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all regions with event counts' })
  @ApiResponse({ status: 200, description: 'Returns all regions' })
  async findAll() {
    return this.regionsService.findAll();
  }

  @Get('geojson')
  @ApiOperation({ summary: 'Get regions as GeoJSON FeatureCollection' })
  @ApiResponse({ status: 200, description: 'Returns GeoJSON' })
  async getGeoJson() {
    return this.regionsService.getGeoJson();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get region by code with events' })
  @ApiParam({ name: 'code', example: '16' })
  @ApiResponse({ status: 200, description: 'Returns the region with events' })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async findByCode(@Param('code') code: string) {
    return this.regionsService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get region by ID with events' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Returns the region with events' })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.regionsService.findOne(id);
  }
}
