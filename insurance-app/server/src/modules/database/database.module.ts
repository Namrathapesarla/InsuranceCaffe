import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { PgPoolService } from './pg-pool.service';

@Global()
@Module({
  providers: [PgPoolService, DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
