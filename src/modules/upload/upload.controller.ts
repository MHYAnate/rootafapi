// src/modules/upload/upload.controller.ts
import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('user-jwt')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadImage(@UploadedFile() file: Express.Multer.File, @Query('folder') folder: string, @CurrentUser('id') uid: string) {
    return this.service.uploadImage(file, folder || 'general', uid, 'user');
  }

  @Post('images')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadImages(@UploadedFiles() files: Express.Multer.File[], @Query('folder') folder: string, @CurrentUser('id') uid: string) {
    return this.service.uploadMultipleImages(files, folder || 'general', uid, 'user');
  }
}