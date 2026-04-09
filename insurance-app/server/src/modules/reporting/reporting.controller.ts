import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const allowedTables = [
  'dim_product',
  'dim_agent',
  'dim_geography',
  'dim_policy',
  'dim_coverage',
  'dim_claim_status',
  'dim_policy_status',
  'dim_line_of_business',
  'dim_insured',
  'dim_book_month',
  'dim_account',
  'dim_adjuster',
  'dim_agency',
  'fact_policy_transaction',
  'fact_policy_measure',
  'fact_claim_transaction',
  'fact_claim_component',
];

@Controller('reporting')
export class ReportingController {
  constructor(private db: DatabaseService) {}

  @Get(':table')
  async getTable(
    @Param('table') table: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (!allowedTables.includes(table)) {
      throw new BadRequestException(`Table "${table}" is not allowed`);
    }

    const l = Math.min(parseInt(limit) || 100, 1000);
    const o = parseInt(offset) || 0;

    const result = await this.db.queryWithEnterprise(
      `SELECT * FROM reporting.${table} LIMIT $1 OFFSET $2`,
      [l, o],
    );
    return result.rows;
  }
}
