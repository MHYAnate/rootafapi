import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';

export class UpdateAdminDto {
  @ApiPropertyOptional() @IsOptional() @IsString() fullName?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phoneNumber?: string;
  @ApiPropertyOptional({ enum: AdminRole })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canVerifyMembers?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canVerifyClients?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canResetPasswords?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canManageContent?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canManageEvents?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canManageAdmins?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canExportData?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canAccessReports?: boolean;
}