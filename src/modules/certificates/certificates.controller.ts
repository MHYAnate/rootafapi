// src/modules/certificates/certificates.controller.ts
import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto';
import { JwtAuthGuard, VerifiedUserGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly service: CertificatesService) {}
  @Public() @Get('member/:memberId') findByMember(@Param('memberId') memberId: string) { return this.service.findByMember(memberId); }
  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Get('me') @ApiBearerAuth('user-jwt')
  getMy(@CurrentUser('id') uid: string) { return this.service.getMyCertificates(uid); }
  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Post() @ApiBearerAuth('user-jwt')
  create(@CurrentUser('id') uid: string, @Body() dto: CreateCertificateDto) { return this.service.create(uid, dto); }
  @UseGuards(JwtAuthGuard, VerifiedUserGuard) @Delete(':id') @ApiBearerAuth('user-jwt')
  remove(@CurrentUser('id') uid: string, @Param('id') id: string) { return this.service.remove(uid, id); }
}