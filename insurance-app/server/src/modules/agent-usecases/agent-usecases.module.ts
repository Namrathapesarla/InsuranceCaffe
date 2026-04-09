import { Module } from '@nestjs/common';
import { AgentUsecasesController } from './agent-usecases.controller';

@Module({
  controllers: [AgentUsecasesController],
})
export class AgentUsecasesModule {}
