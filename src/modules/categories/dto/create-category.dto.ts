import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsInt, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty() @IsString() @IsNotEmpty() categoryCode: string;
  @ApiProperty({ enum: CategoryType }) @IsEnum(CategoryType) categoryType: CategoryType;
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() parentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() examples?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() iconName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() colorCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() displayOrder?: number;
}