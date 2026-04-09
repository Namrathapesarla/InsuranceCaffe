import { Module } from '@nestjs/common';
import { ProductionReportController } from './production-report.controller';

@Module({ controllers: [ProductionReportController] })
export class ProductionReportModule {}
