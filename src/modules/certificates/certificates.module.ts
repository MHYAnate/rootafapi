// src/modules/certificates/certificates.module.ts
import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { AiModule } from '../ai/ai.module';
@Module({imports: [AiModule], controllers: [CertificatesController], providers: [CertificatesService], exports: [CertificatesService] })
export class CertificatesModule {}