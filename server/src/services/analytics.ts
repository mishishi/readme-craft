import { appendFile, stat, rename, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(__dirname, '../../data');
const LOG_FILE = join(LOG_DIR, 'events.ndjson');
const MAX_SIZE = 1 * 1024 * 1024; // 1MB — auto-rotate

async function ensureDir(): Promise<void> {
  try {
    const { mkdir } = await import('node:fs/promises');
    await mkdir(LOG_DIR, { recursive: true });
  } catch {
    // directory already exists
  }
}

async function rotateIfNeeded(): Promise<void> {
  try {
    const stats = await stat(LOG_FILE);
    if (stats.size > MAX_SIZE) {
      const timestamp = Date.now();
      await rename(LOG_FILE, join(LOG_DIR, `events-${timestamp}.ndjson`));
    }
  } catch {
    // file doesn't exist yet — OK
  }
}

export async function trackEvent(event: {
  name: string;
  sessionId?: string;
  timestamp: number;
  data?: Record<string, unknown>;
}): Promise<void> {
  try {
    await ensureDir();
    await rotateIfNeeded();
    const line = JSON.stringify(event) + '\n';
    await appendFile(LOG_FILE, line, 'utf-8');
  } catch (err) {
    // Analytics must never crash the app — silent fail
    console.warn('[analytics] Failed to log event:', err);
  }
}

interface EventLine {
  name: string;
  sessionId?: string;
  timestamp: number;
  data?: Record<string, unknown>;
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

export async function getStats(): Promise<StatsResponse> {
  const empty: StatsResponse = {
    totalEvents: 0, totalSessions: 0,
    totalGenerations: 0, successfulGenerations: 0, failedGenerations: 0, generationRate: 0,
    templatePopularity: [], feedbackPositive: 0, feedbackNegative: 0,
    demoStarted: 0, demoFetched: 0, demoSucceeded: 0, demoFailed: 0,
    dailyEvents: [], totalPageViews: 0, uniqueRepos: 0,
  };

  let text: string;
  try {
    text = await readFile(LOG_FILE, 'utf-8');
  } catch {
    return empty; // file doesn't exist yet
  }

  if (!text.trim()) return empty;

  const lines = text.trim().split('\n');
  const events: EventLine[] = [];
  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch {
      // skip malformed lines
    }
  }

  const sessions = new Set<string>();
  const templateCount = new Map<string, number>();
  const repos = new Set<string>();
  const dailyMap = new Map<string, number>();
  const now = new Date();
  const DAY_MS = 86400000;

  // Initialize last 14 days
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, 0);
  }

  const stats = {
    totalGenerations: 0, successfulGenerations: 0, failedGenerations: 0,
    feedbackPositive: 0, feedbackNegative: 0,
    demoStarted: 0, demoFetched: 0, demoSucceeded: 0, demoFailed: 0,
    totalPageViews: 0,
  };

  for (const ev of events) {
    if (ev.sessionId) sessions.add(ev.sessionId);

    // Daily events (last 14 days)
    if (ev.timestamp) {
      const day = new Date(ev.timestamp).toISOString().slice(0, 10);
      if (dailyMap.has(day)) {
        dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
      }
    }

    switch (ev.name) {
      case 'page_view':
        stats.totalPageViews++;
        break;
      case 'generation_started':
        stats.totalGenerations++;
        break;
      case 'generation_succeeded':
        stats.successfulGenerations++;
        break;
      case 'generation_failed':
        stats.failedGenerations++;
        break;
      case 'template_selected': {
        const tid = (ev.data as Record<string, unknown> | undefined)?.templateId as string | undefined;
        if (tid) templateCount.set(tid, (templateCount.get(tid) || 0) + 1);
        break;
      }
      case 'feedback':
        if ((ev.data as Record<string, unknown> | undefined)?.rating === 'positive') {
          stats.feedbackPositive++;
        } else {
          stats.feedbackNegative++;
        }
        break;
      case 'demo_started':
        stats.demoStarted++;
        break;
      case 'demo_repo_fetched':
        stats.demoFetched++;
        break;
      case 'demo_failed':
        stats.demoFailed++;
        break;
      case 'repo_fetched': {
        const fullName = (ev.data as Record<string, unknown> | undefined)?.fullName as string | undefined;
        if (fullName) repos.add(fullName);
        break;
      }
    }
  }

  const totalAttempts = stats.successfulGenerations + stats.failedGenerations;

  return {
    totalEvents: events.length,
    totalSessions: sessions.size,
    totalGenerations: stats.totalGenerations,
    successfulGenerations: stats.successfulGenerations,
    failedGenerations: stats.failedGenerations,
    generationRate: totalAttempts > 0 ? Math.round((stats.successfulGenerations / totalAttempts) * 100) : 0,
    templatePopularity: [...templateCount.entries()]
      .map(([templateId, count]) => ({ templateId, count }))
      .sort((a, b) => b.count - a.count),
    feedbackPositive: stats.feedbackPositive,
    feedbackNegative: stats.feedbackNegative,
    demoStarted: stats.demoStarted,
    demoFetched: stats.demoFetched,
    demoSucceeded: stats.successfulGenerations,
    demoFailed: stats.demoFailed,
    dailyEvents: [...dailyMap.entries()].map(([date, count]) => ({ date, count })),
    totalPageViews: stats.totalPageViews,
    uniqueRepos: repos.size,
  };
}
