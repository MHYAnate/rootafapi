// src/modules/verification/dto/reject-user.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RejectUserDto {
  @ApiProperty() @IsString() @IsNotEmpty() userId: string;
  @ApiProperty() @IsString() @IsNotEmpty() reason: string;
  @ApiProperty() @IsString() @IsNotEmpty() details: string;
}