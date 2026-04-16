import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AiModule } from '../ai/ai.module'; // ADD THIS

@Module({
  imports: [AiModule], // ADD THIS
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}