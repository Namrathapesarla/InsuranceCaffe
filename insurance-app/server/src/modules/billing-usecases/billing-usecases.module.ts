import { Module } from '@nestjs/common';
import { BillingUsecasesController } from './billing-usecases.controller';

@Module({ controllers: [BillingUsecasesController] })
export class BillingUsecasesModule {}
