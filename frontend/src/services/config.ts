export interface HealthInfo {
  status: string;
  githubTokenConfigured: boolean;
}

let cachedHealth: HealthInfo | null = null;

export async function getHealth(): Promise<HealthInfo> {
  if (cachedHealth) return cachedHealth;
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data: HealthInfo = await res.json();
      cachedHealth = data;
      return data;
    }
  } catch {}
  return { status: 'unknown', githubTokenConfigured: true }; // 静默降级
}
