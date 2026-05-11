/**
 * Minimal analytics tracking — fire-and-forget events to POST /api/events.
 * Never blocks the UI, never throws. Best-effort only.
 */

const SESSION_KEY = 'readme-craft-session-id';

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function trackEvent(name: string, data?: Record<string, unknown>): void {
  try {
    const body = JSON.stringify({
      event: name,
      sessionId: getSessionId(),
      data,
    });
    // Use sendBeacon for reliable delivery on page unload, fallback to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        // Keepalive ensures the request completes even if page navigates away
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // silently ignore
  }
}
