import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType, ServiceAvailability } from '@prisma/client';

export class CreateServiceDto {
  @ApiProperty() @IsString() @IsNotEmpty() categoryId: string;
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shortDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() serviceArea?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() servicesLocations?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() estimatedDuration?: string;
  @ApiProperty({ enum: PricingType }) @IsEnum(PricingType) pricingType: PricingType;
  @ApiPropertyOptional() @IsOptional() @IsNumber() startingPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maximumPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() priceBasis?: string;
  @ApiPropertyOptional({ enum: ServiceAvailability })
  @IsOptional()
  @IsEnum(ServiceAvailability)
  availability?: ServiceAvailability;
  @ApiPropertyOptional() @IsOptional() @IsArray() workingDays?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() workingHoursStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() workingHoursEnd?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() materialsCostIncluded?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() externalVideoLink?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() portfolioLink?: string;
}