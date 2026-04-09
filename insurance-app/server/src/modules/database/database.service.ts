import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { kimballSqlToEnterprise } from '../../common/to-enterprise-sql';
import { isEnterpriseWarehouseSchema } from '../../common/warehouse-style';
import {
  quoteSchemaForSql,
  resolveSchemaFromHeader,
} from '../../common/request-schema';
import { PgPoolService } from './pg-pool.service';

@Injectable({ scope: Scope.REQUEST })
export class DatabaseService {
  constructor(
    @Inject(REQUEST) private readonly req: Request,
    private readonly pg: PgPoolService,
  ) {}

  private xSchemaHeader(): string | undefined {
    const raw = this.req.headers['x-schema'];
    const header = Array.isArray(raw) ? raw[0] : raw;
    return typeof header === 'string' ? header : undefined;
  }

  private activeSchema(): string {
    return resolveSchemaFromHeader(this.xSchemaHeader());
  }

  async query(sql: string, params: any[] = []) {
    const schema = quoteSchemaForSql(this.activeSchema());
    const rewritten = sql.replace(/\breporting\./g, `${schema}.`);
    const pool = this.pg.poolForXSchemaHeader(this.xSchemaHeader());
    return pool.query(rewritten, params);
  }

  /** Kimball (`reporting`) vs enterprise (`Reporting_layer_*`, env list) SQL variants. */
  async queryWarehouse(
    kimballSql: string,
    enterpriseSql: string,
    params: any[] = [],
  ) {
    const useEnt = isEnterpriseWarehouseSchema(this.activeSchema());
    return this.query(useEnt ? enterpriseSql : kimballSql, params);
  }

  /** Single Kimball SQL string auto-adapted for enterprise warehouses (UW / policy / billing / etc.). */
  async queryWithEnterprise(sql: string, params: any[] = []) {
    if (!isEnterpriseWarehouseSchema(this.activeSchema())) {
      return this.query(sql, params);
    }
    return this.query(kimballSqlToEnterprise(sql), params);
  }

  async isConnected(): Promise<boolean> {
    return this.pg.healthCheck();
  }

  /** Build a book_month date-range WHERE clause with parameterized indices */
  bmFilter(from: string, to: string, alias = 'bm', startIdx = 1) {
    const clauses: string[] = [];
    const params: any[] = [];
    let idx = startIdx;
    if (from) {
      clauses.push(`${alias}.book_start_date >= $${idx++}`);
      params.push(from);
    }
    if (to) {
      clauses.push(`${alias}.book_end_date <= $${idx++}`);
      params.push(to);
    }
    return {
      where: clauses.length ? 'AND ' + clauses.join(' AND ') : '',
      params,
      nextIdx: idx,
    };
  }
}
