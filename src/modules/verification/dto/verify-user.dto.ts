// src/modules/verification/dto/verify-user.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class VerifyUserDto {
  @ApiProperty() @IsString() @IsNotEmpty() userId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}