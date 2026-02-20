import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';

export class CreateAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ enum: AdminRole })
  @IsEnum(AdminRole)
  role: AdminRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canVerifyMembers?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canVerifyClients?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canResetPasswords?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canManageContent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canManageEvents?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canManageAdmins?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canExportData?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canAccessReports?: boolean;
}