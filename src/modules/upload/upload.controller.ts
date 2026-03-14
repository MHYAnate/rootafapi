// src/modules/upload/upload.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard, AdminJwtAuthGuard } from '../../common/guards';
import { CurrentUser, CurrentAdmin } from '../../common/decorators';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  // ═══════════════════════════════════════════════════════════
  // USER UPLOAD ENDPOINTS (Protected by user JWT)
  // ═══════════════════════════════════════════════════════════

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('user-jwt')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload single image (user)' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string,
    @CurrentUser('id') uid: string,
  ) {
    return this.service.uploadImage(file, folder || 'general', uid, 'user');
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('user-jwt')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple images (user)' })
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder: string,
    @CurrentUser('id') uid: string,
  ) {
    return this.service.uploadMultipleImages(
      files,
      folder || 'general',
      uid,
      'user',
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ADMIN UPLOAD ENDPOINTS (Protected by admin JWT)
  // ═══════════════════════════════════════════════════════════

  @Post('admin/image')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload single image (admin)' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  adminUploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.uploadImage(
      file,
      folder || 'general',
      adminId,
      'admin',
    );
  }

  @Post('admin/images')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth('admin-jwt')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple images (admin)' })
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  adminUploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.service.uploadMultipleImages(
      files,
      folder || 'general',
      adminId,
      'admin',
    );
  }
}