import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private db: DatabaseService) {}

  @Get()
  async check() {
    const connected = await this.db.isConnected();
    return {
      status: connected ? 'ok' : 'error',
      database: connected ? 'connected' : 'disconnected',
    };
  }
}
