import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { MemberQueryDto, UpdateMemberProfileDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(private readonly service: MembersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all verified members (public)' })
  findAll(@Query() query: MemberQueryDto) {
    return this.service.findAllPublic(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get member profile (public)' })
  findOne(@Param('id') id: string) {
    return this.service.findOnePublic(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Get my profile' })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.service.getMyProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Update my profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateMemberProfileDto) {
    return this.service.updateProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/specializations')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Add specialization' })
  addSpec(
    @CurrentUser('id') userId: string,
    @Body() body: { categoryId: string; isPrimary?: boolean; specificSkills?: string[]; description?: string },
  ) {
    return this.service.addSpecialization(userId, body.categoryId, body.isPrimary, body.specificSkills, body.description);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/specializations/:specId')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Remove specialization' })
  removeSpec(@CurrentUser('id') userId: string, @Param('specId') specId: string) {
    return this.service.removeSpecialization(userId, specId);
  }
}