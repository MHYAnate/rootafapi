import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ToolsService } from './tools.service';
import { CreateToolDto, UpdateToolDto, ToolQueryDto } from './dto';
import { JwtAuthGuard, VerifiedUserGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Tools')
@Controller('tools')
export class ToolsController {
  constructor(private readonly service: ToolsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all tools (public)' })
  findAll(@Query() q: ToolQueryDto) {
    return this.service.findAllPublic(q);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get tool by ID (public)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Get('me/list')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Get my tools' })
  getMyTools(
    @CurrentUser('id') uid: string,
    @Query() q: ToolQueryDto,
  ) {
    return this.service.getMyTools(uid, q);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Post()
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Create tool' })
  create(
    @CurrentUser('id') uid: string,
    @Body() dto: CreateToolDto,
  ) {
    return this.service.create(uid, dto);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Put(':id')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Update tool' })
  update(
    @CurrentUser('id') uid: string,
    @Param('id') id: string,
    @Body() dto: UpdateToolDto,
  ) {
    return this.service.update(uid, id, dto);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Delete(':id')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Delete tool (soft)' })
  remove(
    @CurrentUser('id') uid: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(uid, id);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Post(':id/images')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Add tool image' })
  addImage(
    @CurrentUser('id') uid: string,
    @Param('id') id: string,
    @Body()
    body: {
      imageUrl: string;
      thumbnailUrl: string;
      mediumUrl?: string;
      isPrimary?: boolean;
    },
  ) {
    return this.service.addImage(
      uid,
      id,
      body.imageUrl,
      body.thumbnailUrl,
      body.isPrimary,
    );
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Delete(':toolId/images/:imageId')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Remove tool image' })
  removeImage(
    @CurrentUser('id') uid: string,
    @Param('toolId') toolId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.service.removeImage(uid, toolId, imageId);
  }
}