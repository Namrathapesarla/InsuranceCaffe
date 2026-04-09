import { Module } from '@nestjs/common';
import { PolicyUsecasesController } from './policy-usecases.controller';

@Module({ controllers: [PolicyUsecasesController] })
export class PolicyUsecasesModule {}
