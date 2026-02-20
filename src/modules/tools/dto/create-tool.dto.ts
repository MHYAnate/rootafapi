// src/modules/tools/dto/create-tool.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsInt, IsArray, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToolCondition, ToolListingPurpose, PricingType, LeaseRatePeriod, DepositRequirement } from '@prisma/client';

export class CreateToolDto {
  @ApiProperty() @IsString() @IsNotEmpty() categoryId: string;
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shortDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiProperty({ enum: ToolCondition }) @IsEnum(ToolCondition) condition: ToolCondition;
  @ApiPropertyOptional() @IsOptional() @IsString() brandName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() modelNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() quantityAvailable?: number;
  @ApiProperty({ enum: ToolListingPurpose }) @IsEnum(ToolListingPurpose) listingPurpose: ToolListingPurpose;
  @ApiPropertyOptional({ enum: PricingType }) @IsOptional() @IsEnum(PricingType) salePricingType?: PricingType;
  @ApiPropertyOptional() @IsOptional() @IsNumber() salePrice?: number;
  @ApiPropertyOptional({ enum: PricingType }) @IsOptional() @IsEnum(PricingType) leasePricingType?: PricingType;
  @ApiPropertyOptional() @IsOptional() @IsNumber() leaseRate?: number;
  @ApiPropertyOptional({ enum: LeaseRatePeriod }) @IsOptional() @IsEnum(LeaseRatePeriod) leaseRatePeriod?: LeaseRatePeriod;
  @ApiPropertyOptional({ enum: DepositRequirement }) @IsOptional() @IsEnum(DepositRequirement) depositRequired?: DepositRequirement;
  @ApiPropertyOptional() @IsOptional() @IsNumber() depositAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() pickupLocation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pickupLocationState?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() deliveryAvailable?: boolean;
}