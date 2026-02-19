// src/app.module.ts

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

import { AuthModule } from './modules/auth/auth.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { UsersModule } from './modules/users/users.module';
import { MembersModule } from './modules/members/members.module';
import { ClientsModule } from './modules/clients/clients.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ServicesModule } from './modules/services/services.module';
import { ToolsModule } from './modules/tools/tools.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { VerificationModule } from './modules/verification/verification.module';
import { AboutModule } from './modules/about/about.module';
import { SponsorsModule } from './modules/sponsors/sponsors.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { EventsModule } from './modules/events/events.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { UploadModule } from './modules/upload/upload.module';
import { SettingsModule } from './modules/settings/settings.module';
import { LocationModule } from './modules/location/location.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { HealthModule } from './modules/health/health.module';

import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
      limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    }]),
    PrismaModule,
    CloudinaryModule,
    HealthModule,
    AuthModule,
    AdminAuthModule,
    UsersModule,
    MembersModule,
    ClientsModule,
    CategoriesModule,
    ProductsModule,
    ServicesModule,
    ToolsModule,
    CertificatesModule,
    RatingsModule,
    TransactionsModule,
    VerificationModule,
    AboutModule,
    SponsorsModule,
    TestimonialsModule,
    EventsModule,
    NotificationsModule,
    SearchModule,
    UploadModule,
    SettingsModule,
    LocationModule,
    AnalyticsModule,
    AdminDashboardModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}