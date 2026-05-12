import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { readFile, writeFile, mkdir, rename, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, '../../data');
const DB_FILE = join(DB_DIR, 'analytics.db');
const NDJSON_FILE = join(DB_DIR, 'events.ndjson');

let db: SqlJsDatabase | null = null;
let initialized = false;

async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initSqlJs();

  try {
    await mkdir(DB_DIR, { recursive: true });
  } catch { /* exists */ }

  if (existsSync(DB_FILE)) {
    const buffer = await readFile(DB_FILE);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sessionId TEXT,
    timestamp INTEGER NOT NULL,
    data TEXT DEFAULT NULL
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_events_name ON events(name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)`);

  await persistDb();
  initialized = true;
  return db;
}

async function persistDb(): Promise<void> {
  if (!db) return;
  const data = db.export();
  await writeFile(DB_FILE, Buffer.from(data));
}

async function migrateFromNdjson(): Promise<void> {
  try {
    await access(NDJSON_FILE);
  } catch {
    return; // No NDJSON file to migrate
  }

  console.log('[analytics] Migrating existing NDJSON data to SQLite...');
  const text = await readFile(NDJSON_FILE, 'utf-8').catch(() => '');
  if (!text.trim()) return;

  const lines = text.trim().split('\n');
  if (lines.length === 0) return;

  const database = await getDb();
  let imported = 0;

  const stmt = database.prepare(
    'INSERT INTO events (name, sessionId, timestamp, data) VALUES (?, ?, ?, ?)'
  );

  for (const line of lines) {
    try {
      const ev = JSON.parse(line);
      stmt.run([ev.name, ev.sessionId || null, ev.timestamp, ev.data ? JSON.stringify(ev.data) : null]);
      imported++;
    } catch { /* skip malformed lines */ }
  }

  stmt.free();
  await persistDb();

  // Archive the NDJSON file so it won't be migrated again
  try {
    await rename(NDJSON_FILE, NDJSON_FILE + '.bak');
  } catch { /* OK */ }

  console.log(`[analytics] Migrated ${imported} events from NDJSON to SQLite`);
}

// Auto-migrate on first module load (fire-and-forget)
migrateFromNdjson().catch((err) => {
  console.warn('[analytics] Migration error:', err);
});

export async function trackEvent(event: {
  name: string;
  sessionId?: string;
  timestamp: number;
  data?: Record<string, unknown>;
}): Promise<void> {
  try {
    const database = await getDb();
    database.run(
      'INSERT INTO events (name, sessionId, timestamp, data) VALUES (?, ?, ?, ?)',
      [event.name, event.sessionId || null, event.timestamp, event.data ? JSON.stringify(event.data) : null]
    );
    await persistDb();
  } catch (err) {
    // Analytics must never crash the app — silent fail
    console.warn('[analytics] Failed to log event:', err);
  }
}

interface EventRow {
  name: string;
  sessionId: string | null;
  timestamp: number;
  data: string | null;
}

export interface StatsResponse {
  totalEvents: number;
  totalSessions: number;
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  generationRate: number;
  templatePopularity: { templateId: string; count: number }[];
  feedbackPositive: number;
  feedbackNegative: number;
  demoStarted: number;
  demoFetched: number;
  demoSucceeded: number;
  demoFailed: number;
  dailyEvents: { date: string; count: number }[];
  totalPageViews: number;
  uniqueRepos: number;
}

const emptyStats: StatsResponse = {
  totalEvents: 0, totalSessions: 0,
  totalGenerations: 0, successfulGenerations: 0, failedGenerations: 0, generationRate: 0,
  templatePopularity: [], feedbackPositive: 0, feedbackNegative: 0,
  demoStarted: 0, demoFetched: 0, demoSucceeded: 0, demoFailed: 0,
  dailyEvents: [], totalPageViews: 0, uniqueRepos: 0,
};

export async function getStats(): Promise<StatsResponse> {
  try {
    const database = await getDb();

    const totalEvents = (database.exec('SELECT COUNT(*) FROM events')[0]?.values[0]?.[0] as number) ?? 0;
    if (totalEvents === 0) return emptyStats;

    const totalSessions = (database.exec('SELECT COUNT(DISTINCT sessionId) FROM events WHERE sessionId IS NOT NULL')[0]?.values[0]?.[0] as number) ?? 0;
    const totalGenerations = (database.exec("SELECT COUNT(*) FROM events WHERE name = 'generation_started'")[0]?.values[0]?.[0] as number) ?? 0;
    const successfulGenerations = (database.exec("SELECT COUNT(*) FROM events WHERE name = 'generation_succeeded'")[0]?.values[0]?.[0] as number) ?? 0;
    const failedGenerations = (database.exec("SELECT COUNT(*) FROM events WHERE name = 'generation_failed'")[0]?.values[0]?.[0] as number) ?? 0;
    const totalAttempts = successfulGenerations + failedGenerations;

    const feedbackPositive = (database.exec("SELECT COUNT(*) FROM events WHERE name = 'feedback' AND json_extract(data, '$.rating') = 'positive'")[0]?.values[0]?.[0] as number) ?? 0;
    const feedbackNegative = (database.exec("SELECT COUNT(*) FROM events WHERE name = 'feedback' AND (json_extract(data, '$.rating') IS NULL OR json_extract(data, '$.rating') != 'positive')")[0]?.values[0]?.[0] as number) ?? 0;
    const demoStarted = (database.exec("SELECT COUNT(*) FROM events WHERE name = 'demo_started'")[0]?.values[0]?.[0] as number) ?? 0;
    const demoFetched = (database.exec("SELECT COUNT(*) FROM events WHERE name = 'demo_repo_fetched'")[0]?.values[0]?.[0] as number) ?? 0;
    const demoSucceeded = (database.exec("SELECT COUNT(*) FROM events WHERE name = 'demo_succeeded'")[0]?.values[0]?.[0] as number) ?? 0;
    const demoFailed = (database.exec("SELECT COUNT(*) FROM events WHERE name = 'demo_failed'")[0]?.values[0]?.[0] as number) ?? 0;
    const totalPageViews = (database.exec("SELECT COUNT(*) FROM events WHERE name = 'page_view'")[0]?.values[0]?.[0] as number) ?? 0;

    // Unique repos
    const uniqueReposResult = database.exec("SELECT COUNT(DISTINCT json_extract(data, '$.fullName')) FROM events WHERE name = 'repo_fetched' AND json_extract(data, '$.fullName') IS NOT NULL");
    const uniqueRepos = (uniqueReposResult[0]?.values[0]?.[0] as number) ?? 0;

    // Template popularity
    const templatePopularity: { templateId: string; count: number }[] = [];
    const tpRows = database.exec("SELECT json_extract(data, '$.templateId') as templateId, COUNT(*) as count FROM events WHERE name = 'template_selected' AND json_extract(data, '$.templateId') IS NOT NULL GROUP BY templateId ORDER BY count DESC");
    for (const row of tpRows[0]?.values ?? []) {
      templatePopularity.push({ templateId: row[0] as string, count: row[1] as number });
    }

    // Daily events (last 14 days)
    const now = Date.now();
    const DAY_MS = 86400000;
    const dailyMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * DAY_MS);
      dailyMap.set(d.toISOString().slice(0, 10), 0);
    }

    const fourteenDaysAgo = now - 13 * DAY_MS;
    const dailyRows = database.exec(
      `SELECT DATE(timestamp / 1000, 'unixepoch') as date, COUNT(*) as count FROM events WHERE timestamp >= ? GROUP BY date ORDER BY date`,
      [fourteenDaysAgo]
    );
    for (const row of dailyRows[0]?.values ?? []) {
      dailyMap.set(row[0] as string, row[1] as number);
    }

    return {
      totalEvents,
      totalSessions,
      totalGenerations,
      successfulGenerations,
      failedGenerations,
      generationRate: totalAttempts > 0 ? Math.round((successfulGenerations / totalAttempts) * 100) : 0,
      templatePopularity,
      feedbackPositive,
      feedbackNegative,
      demoStarted,
      demoFetched,
      demoSucceeded,
      demoFailed,
      dailyEvents: [...dailyMap.entries()].map(([date, count]) => ({ date, count })),
      totalPageViews,
      uniqueRepos,
    };
  } catch (err) {
    console.warn('[analytics] Failed to get stats:', err);
    return emptyStats;
  }
}
