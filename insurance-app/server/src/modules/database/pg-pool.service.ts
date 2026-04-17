import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, type PoolConfig } from 'pg';

function localPoolConfig(): PoolConfig {
  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: parseInt(process.env.DB_POOL_MAX || '4', 10),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_MS || '10000', 10),
    connectionTimeoutMillis: parseInt(
      process.env.DB_POOL_CONNECT_TIMEOUT_MS || '5000',
      10,
    ),
  };
}

/** Returns null if remote is disabled or not configured. */
function remotePoolConfig(): PoolConfig | null {
  const remoteHost = process.env.REMOTE_DB_HOST?.trim();
  const forceLocal =
    process.env.USE_LOCAL_DB === '1' ||
    process.env.USE_LOCAL_DB === 'true';
  if (!remoteHost || forceLocal) return null;

  const sslOff =
    process.env.REMOTE_DB_SSL === '0' ||
    process.env.REMOTE_DB_SSL === 'false';
  return {
    host: remoteHost,
    port: parseInt(process.env.REMOTE_DB_PORT || '25060', 10),
    database: process.env.REMOTE_DB_NAME?.trim() || '',
    user: process.env.REMOTE_DB_USER?.trim() || '',
    password: process.env.REMOTE_DB_PASSWORD || '',
    ssl: sslOff ? undefined : { rejectUnauthorized: false },
    max: parseInt(process.env.REMOTE_DB_POOL_MAX || '2', 10),
    idleTimeoutMillis: parseInt(
      process.env.REMOTE_DB_POOL_IDLE_MS || '10000',
      10,
    ),
    connectionTimeoutMillis: parseInt(
      process.env.REMOTE_DB_POOL_CONNECT_TIMEOUT_MS || '5000',
      10,
    ),
  };
}

function wireSearchPath(pool: Pool) {
  pool.on('connect', (client) => {
    void client.query(`SET search_path TO public`);
  });
}

@Injectable()
export class PgPoolService implements OnModuleInit, OnModuleDestroy {
  /** Always localhost (or DB_*) — used when X-Schema is `local`. */
  poolLocal!: Pool;
  /** DigitalOcean etc. — used when X-Schema is `india` or `us`. */
  poolRemote: Pool | null = null;

  onModuleInit() {
    const localCfg = localPoolConfig();
    this.poolLocal = new Pool(localCfg);
    wireSearchPath(this.poolLocal);

    const remoteCfg = remotePoolConfig();
    if (remoteCfg) {
      this.poolRemote = new Pool(remoteCfg);
      wireSearchPath(this.poolRemote);
    }

    void this.poolLocal
      .query('SELECT NOW()')
      .then((r) => {
        console.log(
          'Database [local / X-Schema:local] connected at',
          r.rows[0].now,
          `→ ${localCfg.database}@${localCfg.host}:${localCfg.port}`,
        );
      })
      .catch((err: Error) => {
        console.error('Database [local] connection failed:', err.message);
      });

    if (this.poolRemote && remoteCfg) {
      void this.poolRemote
        .query('SELECT NOW()')
        .then((r) => {
          console.log(
            'Database [remote / X-Schema:india|us] connected at',
            r.rows[0].now,
            `→ ${remoteCfg.database}@${remoteCfg.host}:${remoteCfg.port}`,
          );
        })
        .catch((err: Error) => {
          console.error('Database [remote] connection failed:', err.message);
        });
    }
  }

  /**
   * `local` → poolLocal (Kimball `reporting` on DB_*).
   * `india` | `us` → poolRemote when configured, else poolLocal.
   */
  poolForXSchemaHeader(header: string | undefined): Pool {
    const key = (header || 'local').toLowerCase().trim() || 'local';
    if ((key === 'india' || key === 'us') && this.poolRemote) {
      return this.poolRemote;
    }
    return this.poolLocal;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.poolLocal.query('SELECT 1');
      if (this.poolRemote) await this.poolRemote.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy() {
    await this.poolLocal.end();
    if (this.poolRemote) await this.poolRemote.end();
  }
}
