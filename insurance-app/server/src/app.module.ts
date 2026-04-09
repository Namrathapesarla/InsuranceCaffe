import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProductionReportModule } from './modules/production-report/production-report.module';
import { RiskScoringModule } from './modules/risk-scoring/risk-scoring.module';
import { UwUsecasesModule } from './modules/uw-usecases/uw-usecases.module';
import { PolicyUsecasesModule } from './modules/policy-usecases/policy-usecases.module';
import { BillingUsecasesModule } from './modules/billing-usecases/billing-usecases.module';
import { ClaimsUsecasesModule } from './modules/claims-usecases/claims-usecases.module';
import { AgentUsecasesModule } from './modules/agent-usecases/agent-usecases.module';
import { MasterModule } from './modules/master/master.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    ReportingModule,
    DashboardModule,
    ProductionReportModule,
    RiskScoringModule,
    UwUsecasesModule,
    PolicyUsecasesModule,
    BillingUsecasesModule,
    ClaimsUsecasesModule,
    AgentUsecasesModule,
    MasterModule,
  ],
})
export class AppModule {}
