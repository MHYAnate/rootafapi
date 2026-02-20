import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType, ProductAvailability } from '@prisma/client';
import { PaginationDto } from '../../../common/dto';

export class ProductQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() memberId?: string;
  @ApiPropertyOptional({ enum: PricingType }) @IsOptional() @IsEnum(PricingType) pricingType?: PricingType;
  @ApiPropertyOptional({ enum: ProductAvailability })
  @IsOptional()
  @IsEnum(ProductAvailability)
  availability?: ProductAvailability;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() minPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}