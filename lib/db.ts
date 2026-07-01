import { Pool, PoolClient } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _marajoPool: Pool | undefined;
}

type DbConnection = PoolClient & {
  execute(sql: string, params?: any[]): Promise<{ insertId: number; affectedRows: number }>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
};

/** Convert MySQL ? placeholders to PostgreSQL $1, $2, ... */
function convertParams(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function createConnection(client: PoolClient): DbConnection {
  const wrapped = client as DbConnection;

  wrapped.execute = async (sql: string, params: any[] = []) => {
    const isInsert = sql.trim().toUpperCase().startsWith("INSERT");
    const finalSql =
      isInsert && !sql.toUpperCase().includes("RETURNING")
        ? `${sql} RETURNING id`
        : sql;
    const result = await client.query(convertParams(finalSql), params);
    return {
      insertId: isInsert ? (result.rows[0]?.id ?? 0) : 0,
      affectedRows: result.rowCount ?? 0,
    };
  };

  wrapped.beginTransaction = async () => {
    await client.query("BEGIN");
  };

  wrapped.commit = async () => {
    await client.query("COMMIT");
  };

  wrapped.rollback = async () => {
    await client.query("ROLLBACK");
  };

  return wrapped;
}

export function getPool(): Pool {
  if (!global._marajoPool) {
    // Convert direct database URL to connection pooler for serverless (Vercel)
    let connString = process.env.DATABASE_URL || "";
    if (connString.includes("db.oeurruejbzoaukpscldb.supabase.co")) {
      // Replace direct connection with pooler for Vercel serverless
      connString = connString.replace(
        "db.oeurruejbzoaukpscldb.supabase.co:5432",
        "aws-0-ap-northeast-1.pooler.supabase.com:6543"
      );
    }
    
    global._marajoPool = new Pool({
      connectionString: connString,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  return global._marajoPool;
}

export const db = {
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const pool = getPool();
    const result = await pool.query(convertParams(sql), params);
    return result.rows as T[];
  },
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await db.query<T>(sql, params);
    return rows[0] ?? null;
  },
  async execute(sql: string, params: any[] = []): Promise<{ insertId: number; affectedRows: number }> {
    const pool = getPool();
    const isInsert = sql.trim().toUpperCase().startsWith("INSERT");
    const finalSql =
      isInsert && !sql.toUpperCase().includes("RETURNING")
        ? `${sql} RETURNING id`
        : sql;
    const result = await pool.query(convertParams(finalSql), params);
    return {
      insertId: isInsert ? (result.rows[0]?.id ?? 0) : 0,
      affectedRows: result.rowCount ?? 0,
    };
  },
  async getConnection(): Promise<DbConnection> {
    const pool = getPool();
    const client = await pool.connect();
    return createConnection(client);
  },
};
