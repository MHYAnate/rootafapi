// src/modules/ratings/dto/create-rating.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RatingCategory } from '@prisma/client';

export class CreateRatingDto {
  @ApiProperty() @IsString() @IsNotEmpty() memberId: string;
  @ApiProperty({ enum: RatingCategory }) @IsEnum(RatingCategory) ratingCategory: RatingCategory;
  @ApiPropertyOptional() @IsOptional() @IsString() productId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() serviceId?: string;
  @ApiProperty() @IsInt() @Min(1) @Max(5) overallRating: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(5) qualityRating?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(5) communicationRating?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(5) valueRating?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(5) timelinessRating?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reviewTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reviewText?: string;
}