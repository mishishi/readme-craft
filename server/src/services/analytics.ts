import { appendFile, stat, rename } from 'node:fs/promises';
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
