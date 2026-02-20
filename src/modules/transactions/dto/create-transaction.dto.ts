// src/modules/transactions/dto/create-transaction.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsInt, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType }) @IsEnum(TransactionType) transactionType: TransactionType;
  @ApiPropertyOptional() @IsOptional() @IsString() productId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() serviceId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() toolId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() listingName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clientName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clientPhone?: string;
  @ApiProperty() @IsDateString() transactionDate: string;
  @ApiProperty() @IsNumber() amount: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() quantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unitOfMeasure?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}