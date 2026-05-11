import type { HistoryEntry } from '../types';

export type { HistoryEntry };

const STORAGE_KEY = 'readme-craft-history';
const MAX_ENTRIES = 50;

function loadAll(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(entries: HistoryEntry[]): void {
  try {
    // Keep newest MAX_ENTRIES
    const trimmed = entries.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/** Save a new generation entry (dedup by repo+template+time proximity). */
export function saveEntry(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): void {
  const entries = loadAll();

  // Dedup: if same repo+template within 60 seconds, update in place
  const now = Date.now();
  const duplicateIndex = entries.findIndex(
    (e) =>
      e.repoFullName === entry.repoFullName &&
      e.templateId === entry.templateId &&
      now - e.createdAt < 60_000
  );

  const fullEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: now,
  };

  if (duplicateIndex !== -1) {
    entries[duplicateIndex] = fullEntry;
  } else {
    entries.unshift(fullEntry); // newest first
  }

  saveAll(entries);
}

/** Get all history entries, newest first. */
export function getEntries(): HistoryEntry[] {
  return loadAll();
}

/** Delete a single entry by id. */
export function deleteEntry(id: string): void {
  const entries = loadAll().filter((e) => e.id !== id);
  saveAll(entries);
}

/** Clear all history. */
export function clearAll(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
