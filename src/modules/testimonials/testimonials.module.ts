// src/modules/testimonials/testimonials.module.ts
import { Module } from '@nestjs/common';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
@Module({ controllers: [TestimonialsController], providers: [TestimonialsService] })
export class TestimonialsModule {}