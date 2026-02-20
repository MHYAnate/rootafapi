// src/modules/tools/dto/tool-query.dto.ts
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ToolCondition, ToolListingPurpose } from '@prisma/client';
import { PaginationDto } from '../../../common/dto';

export class ToolQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() memberId?: string;
  @ApiPropertyOptional({ enum: ToolCondition }) @IsOptional() @IsEnum(ToolCondition) condition?: ToolCondition;
  @ApiPropertyOptional({ enum: ToolListingPurpose }) @IsOptional() @IsEnum(ToolListingPurpose) listingPurpose?: ToolListingPurpose;
  @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
}