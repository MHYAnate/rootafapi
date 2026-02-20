import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType, ServiceAvailability } from '@prisma/client';
import { PaginationDto } from '../../../common/dto';

export class ServiceQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() memberId?: string;
  @ApiPropertyOptional({ enum: PricingType }) @IsOptional() @IsEnum(PricingType) pricingType?: PricingType;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}