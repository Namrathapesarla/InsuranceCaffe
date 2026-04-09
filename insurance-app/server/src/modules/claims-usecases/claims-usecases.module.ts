import { Module } from '@nestjs/common';
import { ClaimsUsecasesController } from './claims-usecases.controller';

@Module({
  controllers: [ClaimsUsecasesController],
})
export class ClaimsUsecasesModule {}
