import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType, ProductAvailability } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty() @IsString() @IsNotEmpty() categoryId: string;
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shortDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiProperty() @IsString() @IsNotEmpty() unitOfMeasure: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) minimumOrderQuantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() availableQuantity?: number;
  @ApiProperty({ enum: PricingType }) @IsEnum(PricingType) pricingType: PricingType;
  @ApiPropertyOptional() @IsOptional() @IsNumber() priceAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() pricePerUnit?: string;
  @ApiPropertyOptional({ enum: ProductAvailability })
  @IsOptional()
  @IsEnum(ProductAvailability)
  availability?: ProductAvailability;
  @ApiPropertyOptional() @IsOptional() @IsString() seasonalInfo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() externalVideoLink?: string;
}