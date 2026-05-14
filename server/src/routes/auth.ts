import type { FastifyInstance } from 'fastify';
import { getDb } from '../services/db.js';
import { signToken, requireUser } from '../services/auth.js';
import { proxiedFetch } from '../services/fetch.js';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// GitHub OAuth 回调地址必须是 GitHub App 中注册的地址
const CALLBACK_URL = process.env.OAUTH_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback';

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

export async function authRoutes(app: FastifyInstance) {
  // 1. 跳转 GitHub OAuth
  app.get('/auth/github', async (_request, reply) => {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: CALLBACK_URL,
      scope: 'read:user',
      state: Math.random().toString(36).slice(2),
    });
    reply.redirect(`https://github.com/login/oauth/authorize?${params}`);
  });

  // 2. GitHub OAuth 回调
  app.get<{ Querystring: { code?: string; state?: string } }>(
    '/auth/github/callback',
    async (request, reply) => {
      const { code } = request.query;
      if (!code) {
        return reply.status(400).send({ error: 'Missing code' });
      }

      // 用 code 换 access_token
      const tokenRes = await proxiedFetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      );
      const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
      if (!tokenData.access_token) {
        return reply.status(401).send({ error: 'Failed to get access token', detail: tokenData.error });
      }

      // 用 access_token 获取用户信息
      const userRes = await proxiedFetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const githubUser = await userRes.json() as GitHubUser;

      // 存入数据库（upsert：存在则更新，不存在则插入）
      const db = getDb();
      db.run(
        `INSERT INTO users (github_id, login, avatar_url, name, email)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(github_id) DO UPDATE SET
           login = excluded.login,
           avatar_url = excluded.avatar_url,
           name = excluded.name,
           email = excluded.email,
           updated_at = datetime('now')`,
        [githubUser.id, githubUser.login, githubUser.avatar_url, githubUser.name || null, githubUser.email || null]
      );
      const _stmt = db.prepare('SELECT id FROM users WHERE github_id = ?');
      _stmt.bind([githubUser.id]);
      _stmt.step();
      const userId = _stmt.get()[0] as number;
      _stmt.free();

      // 签发 JWT，前端通过 localStorage 管理
      const token = signToken({ userId, githubId: githubUser.id, login: githubUser.login });

      // 重定向到前端，token 通过 hash 传递（避免服务器日志记录）
      reply.redirect(`${FRONTEND_URL}/auth/callback#token=${token}`);
    }
  );

  // 3. 获取当前用户（需 Authorization header）
  app.get('/auth/me', async (request, reply) => {
    const user = requireUser(request, reply);
    if (!user) return;

    const db = getDb();
    const _stmt = db.prepare('SELECT id, github_id, login, avatar_url, name, email FROM users WHERE id = ?');
    _stmt.bind([user.userId]);
    if (!_stmt.step()) {
      _stmt.free();
      return reply.status(404).send({ error: 'User not found' });
    }
    const row = _stmt.get();
    _stmt.free();
    return {
      id: row[0],
      githubId: row[1],
      login: row[2],
      avatarUrl: row[3],
      name: row[4],
      email: row[5],
    };
  });

  // 4. 登出（无状态，前端清除 token 即可）
  app.post('/auth/logout', async () => {
    return { ok: true };
  });
}
