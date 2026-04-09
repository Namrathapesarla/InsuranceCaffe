import { Module } from '@nestjs/common';
import { RiskScoringController } from './risk-scoring.controller';

@Module({ controllers: [RiskScoringController] })
export class RiskScoringModule {}
