// src/modules/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FileValidationUtil } from '../../common/utils';

@Injectable()
export class UploadService {
  constructor(private cloudinary: CloudinaryService, private prisma: PrismaService) {}

  async uploadImage(file: Express.Multer.File, folder: string, uploaderId: string, uploaderType: string) {
    FileValidationUtil.validateImage(file);
    const result = await this.cloudinary.uploadWithThumbnail(file, folder);

    await this.prisma.fileUpload.create({
      data: {
        originalName: file.originalname,
        storedName: result.publicId,
        fileUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl,
        mimeType: file.mimetype,
        fileSize: file.size,
        width: result.width,
        height: result.height,
        uploadedById: uploaderId,
        uploadedByType: uploaderType,
      },
    });

    return { message: 'Image uploaded', data: result };
  }

  async uploadMultipleImages(files: Express.Multer.File[], folder: string, uploaderId: string, uploaderType: string) {
    FileValidationUtil.validateImages(files);
    const results = await Promise.all(files.map((f) => this.cloudinary.uploadWithThumbnail(f, folder)));
    return { message: `${results.length} images uploaded`, data: results };
  }
}