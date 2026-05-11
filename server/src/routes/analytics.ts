import type { FastifyInstance } from 'fastify';
import { trackEvent } from '../services/analytics.js';

interface TrackBody {
  event: string;
  sessionId?: string;
  data?: Record<string, unknown>;
}

export async function analyticsRoutes(app: FastifyInstance) {
  app.post<{ Body: TrackBody }>('/events', async (request, reply) => {
    const { event, sessionId, data } = request.body;

    if (!event) {
      return reply.status(400).send({ error: 'Missing event name' });
    }

    // Fire-and-forget: don't block response
    trackEvent({ name: event, sessionId, timestamp: Date.now(), data }).catch(() => {});

    return { ok: true };
  });
}
