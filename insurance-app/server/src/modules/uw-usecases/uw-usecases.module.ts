import { Module } from '@nestjs/common';
import { UwUsecasesController } from './uw-usecases.controller';

@Module({ controllers: [UwUsecasesController] })
export class UwUsecasesModule {}
