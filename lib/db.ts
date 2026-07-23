import { Pool, PoolClient } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _marajoPool: Pool | undefined;
}

type DbConnection = PoolClient & {
  execute(sql: string, params?: any[]): Promise<any>;
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
    const normalized = sql.trim().toUpperCase();
    const isInsert = sql.trim().toUpperCase().startsWith("INSERT");
    const finalSql =
      isInsert && !sql.toUpperCase().includes("RETURNING")
        ? `${sql} RETURNING id`
        : sql;
    const result = await client.query(convertParams(finalSql), params);
    const meta = {
      insertId: isInsert ? (result.rows[0]?.id ?? 0) : 0,
      affectedRows: result.rowCount ?? 0,
    };
    if (normalized.startsWith("SELECT") || normalized.startsWith("WITH")) {
      return [result.rows, []];
    }
    return [meta, []];
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
    const production = process.env.NODE_ENV === "production";
    const databaseCa = process.env.DATABASE_CA_CERT_BASE64
      ? Buffer.from(process.env.DATABASE_CA_CERT_BASE64, "base64").toString("utf8").trim()
      : process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n").trim();
    if (production && !databaseCa) {
      throw new Error("DATABASE_CA_CERT_BASE64 is required in production.");
    }

    global._marajoPool = new Pool({
      connectionString: process.env.DATABASE_URL || "",
      ssl: production
        ? { ca: databaseCa, rejectUnauthorized: true }
        : process.env.DATABASE_SSL === "disable"
          ? false
          : { ca: databaseCa || undefined, rejectUnauthorized: true },
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
