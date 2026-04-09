import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MasterController } from './master.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [MasterController],
})
export class MasterModule {}
