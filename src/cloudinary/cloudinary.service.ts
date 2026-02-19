import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

export interface UploadResult {
  imageUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  publicId: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: `urafd/${folder}`,
          resource_type: 'auto',
          transformation: [
            { width: 1200, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Upload failed: ${error.message}`);
            reject(new BadRequestException(`Upload failed: ${error.message}`));
          } else {
            resolve(result as UploadApiResponse);
          }
        },
      );
      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  async uploadWithThumbnail(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<UploadResult> {
    const result = await this.uploadFile(file, folder);

    const thumbnailUrl = cloudinary.url(result.public_id, {
      width: 150,
      height: 150,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });

    const mediumUrl = cloudinary.url(result.public_id, {
      width: 600,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto',
    });

    return {
      imageUrl: result.secure_url,
      thumbnailUrl,
      mediumUrl,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      fileSize: result.bytes,
      format: result.format,
    };
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      this.logger.error(`Delete failed: ${error.message}`);
      return false;
    }
  }

  async deleteMultipleFiles(publicIds: string[]): Promise<void> {
    if (publicIds.length === 0) return;
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      this.logger.error(`Bulk delete failed: ${error.message}`);
    }
  }
}