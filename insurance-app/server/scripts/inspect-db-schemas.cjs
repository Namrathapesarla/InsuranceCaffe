/* Lists schemas (matches app routing: local vs remote pools). Run: node scripts/inspect-db-schemas.cjs */
require('dotenv').config();
const { Client } = require('pg');

function localCfg() {
  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

function remoteCfg() {
  const rh = (process.env.REMOTE_DB_HOST || '').trim();
  const forceLocal =
    process.env.USE_LOCAL_DB === '1' || process.env.USE_LOCAL_DB === 'true';
  if (!rh || forceLocal) return null;
  const sslOff =
    process.env.REMOTE_DB_SSL === '0' ||
    process.env.REMOTE_DB_SSL === 'false';
  return {
    host: rh,
    port: parseInt(process.env.REMOTE_DB_PORT || '25060', 10),
    database: (process.env.REMOTE_DB_NAME || '').trim(),
    user: (process.env.REMOTE_DB_USER || '').trim(),
    password: process.env.REMOTE_DB_PASSWORD || '',
    ssl: sslOff ? undefined : { rejectUnauthorized: false },
  };
}

const targets = [
  'Reporting_IND',
  'Reporting_US',
  'reporting',
  'Reporting_layer_India',
  'public',
];

async function inspect(label, cfg) {
  const c = new Client(cfg);
  await c.connect();
  console.log('\n==========', label, '==========');
  console.log('Database:', cfg.database, '@', cfg.host + ':' + cfg.port);

  const s = await c.query(`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name NOT LIKE 'pg\\_%' ESCAPE '\\'
      AND schema_name <> 'information_schema'
    ORDER BY schema_name
  `);
  console.log('Schemas (' + s.rows.length + '):', s.rows.map((r) => r.schema_name).join(', '));

  for (const sch of targets) {
    const t = await c.query(
      `SELECT COUNT(*)::int AS n FROM information_schema.tables
       WHERE table_schema = $1 AND table_type = 'BASE TABLE'`,
      [sch],
    );
    const n = t.rows[0].n;
    if (n > 0) console.log('  tables in "' + sch + '":', n);
  }

  await c.end();
}

(async () => {
  try {
    await inspect('LOCAL (X-Schema: local)', localCfg());
    const r = remoteCfg();
    if (r) await inspect('REMOTE (X-Schema: india | us)', r);
    else console.log('\n(No REMOTE_DB_HOST — only local pool)');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
