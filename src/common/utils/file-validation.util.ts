import { BadRequestException } from '@nestjs/common';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class FileValidationUtil {
  static validateImage(file: Express.Multer.File): void {
    if (!file) throw new BadRequestException('File is required');
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size must be less than 5MB');
    }
  }

  static validateImages(files: Express.Multer.File[], max: number = 10): void {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }
    if (files.length > max) {
      throw new BadRequestException(`Maximum ${max} images allowed`);
    }
    files.forEach((file) => this.validateImage(file));
  }
}