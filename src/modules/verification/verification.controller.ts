import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { AdminJwtAuthGuard } from '../../common/guards';
import { CurrentAdmin } from '../../common/decorators';
import { DocumentVerificationStatus } from '@prisma/client';

@ApiTags('Verification')
@Controller('admin/verification')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth('admin-jwt')
export class VerificationController {
  constructor(private readonly service: VerificationService) {}

  // ─── Pending Verifications ──────────────────────────────────
  @Get('pending')
  @ApiOperation({ summary: 'Get all pending verifications' })
  getPending(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('userType') userType?: string,
  ) {
    return this.service.getPendingVerifications(page, limit, userType);
  }

  @Get('under-review')
  @ApiOperation({ summary: 'Get verifications under review' })
  getUnderReview(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getUnderReview(page, limit);
  }

  // ─── Single User Verification Detail ───────────────────────
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get full verification detail for user' })
  getDetail(@Param('userId') userId: string) {
    return this.service.getVerificationDetail(userId);
  }

  // ─── Start Review ──────────────────────────────────────────
  @Post('user/:userId/start-review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark user as "under review"' })
  startReview(
    @Param('userId') userId: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.startReview(userId, adminId);
  }

  // ─── Approve ───────────────────────────────────────────────
  @Post('user/:userId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve user verification' })
  approve(
    @Param('userId') userId: string,
    @CurrentAdmin('id') adminId: string,
    @Body('notes') notes?: string,
  ) {
    return this.service.approveUser(userId, adminId, notes);
  }

  // ─── Reject ────────────────────────────────────────────────
  @Post('user/:userId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject user verification' })
  reject(
    @Param('userId') userId: string,
    @CurrentAdmin('id') adminId: string,
    @Body() body: { reason: string; details: string },
  ) {
    return this.service.rejectUser(userId, adminId, body.reason, body.details);
  }

  // ─── Request Resubmission ─────────────────────────────────
  @Post('user/:userId/request-resubmission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request document resubmission from user' })
  requestResubmission(
    @Param('userId') userId: string,
    @CurrentAdmin('id') adminId: string,
    @Body() body: { reason: string; documentIds?: string[] },
  ) {
    return this.service.requestResubmission(
      userId,
      adminId,
      body.reason,
      body.documentIds,
    );
  }

  // ─── Verify Individual Document ────────────────────────────
  @Post('document/:documentId/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify or reject individual document' })
  verifyDocument(
    @Param('documentId') documentId: string,
    @CurrentAdmin('id') adminId: string,
    @Body() body: { status: DocumentVerificationStatus; reason?: string },
  ) {
    return this.service.verifyDocument(
      documentId,
      adminId,
      body.status,
      body.reason,
    );
  }

  // ─── Suspend User ─────────────────────────────────────────
  @Post('user/:userId/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a verified user' })
  suspend(
    @Param('userId') userId: string,
    @CurrentAdmin('id') adminId: string,
    @Body('reason') reason: string,
  ) {
    return this.service.suspendUser(userId, adminId, reason);
  }

  // ─── Reactivate User ──────────────────────────────────────
  @Post('user/:userId/reactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate a suspended user' })
  reactivate(
    @Param('userId') userId: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.reactivateUser(userId, adminId);
  }

  // ─── Direct Password Reset ────────────────────────────────
  @Post('user/:userId/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin directly resets user password' })
  resetUserPassword(
    @Param('userId') userId: string,
    @CurrentAdmin('id') adminId: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.service.adminResetUserPassword(userId, adminId, newPassword);
  }

  // ─── Password Reset Requests ──────────────────────────────
  @Get('password-resets')
  @ApiOperation({ summary: 'Get pending password reset requests' })
  getPasswordResets(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getPendingPasswordResets(page, limit);
  }

  @Post('password-resets/:requestId/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process a password reset request' })
  processReset(
    @Param('requestId') requestId: string,
    @CurrentAdmin('id') adminId: string,
    @Body() body: { temporaryPassword: string; notes?: string },
  ) {
    return this.service.processPasswordReset(
      requestId,
      adminId,
      body.temporaryPassword,
      body.notes,
    );
  }

  @Post('password-resets/:requestId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a password reset request' })
  rejectReset(
    @Param('requestId') requestId: string,
    @CurrentAdmin('id') adminId: string,
    @Body('reason') reason: string,
  ) {
    return this.service.rejectPasswordReset(requestId, adminId, reason);
  }

  // ─── Statistics ────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'Get verification statistics' })
  getStats() {
    return this.service.getVerificationStats();
  }
}