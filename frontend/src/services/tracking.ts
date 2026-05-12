/**
 * Minimal analytics tracking — fire-and-forget events to POST /api/events.
 * Never blocks the UI, never throws. Best-effort only.
 */

const SESSION_KEY = 'readme-craft-session-id';
const VISITOR_KEY = 'readme-craft-visitor-id';

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

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function isNewVisitor(): boolean {
  try {
    return !localStorage.getItem(VISITOR_KEY);
  } catch {
    return false;
  }
}

let sessionStartTime = Date.now();

export function initSessionTracking(): void {
  const visitorId = getVisitorId();
  sessionStartTime = Date.now();

  // Fire session_started once per session
  trackEvent('session_started', {
    isNewVisitor: isNewVisitor(),
    userAgent: navigator.userAgent.slice(0, 120),
  });

  // Fire session_ended on page unload
  const handleUnload = () => {
    const duration = Math.round((Date.now() - sessionStartTime) / 1000);
    trackEvent('session_ended', { durationSeconds: duration });
  };
  window.addEventListener('beforeunload', handleUnload);
}

export function trackEvent(name: string, data?: Record<string, unknown>): void {
  try {
    const enriched = {
      ...data,
      url: window.location.href,
      referrer: document.referrer || undefined,
    };
    const body = JSON.stringify({
      event: name,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      timestamp: Date.now(),
      data: enriched,
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
