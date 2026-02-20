// src/modules/certificates/dto/create-certificate.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateType } from '@prisma/client';

export class CreateCertificateDto {
  @ApiProperty() @IsString() @IsNotEmpty() certificatePhotoUrl: string;
  @ApiProperty() @IsString() @IsNotEmpty() certificateName: string;
  @ApiProperty({ enum: CertificateType }) @IsEnum(CertificateType) certificateType: CertificateType;
  @ApiProperty() @IsString() @IsNotEmpty() issuingOrganization: string;
  @ApiProperty() @IsDateString() dateIssued: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiryDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() certificateNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() verificationLink?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}