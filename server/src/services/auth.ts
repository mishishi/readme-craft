import jwt from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const TOKEN_EXPIRY = '30d'; // 30 天

export interface JwtPayload {
  userId: number;
  githubId: number;
  login: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// Fastify 装饰器：从请求中提取用户
export function getUser(request: FastifyRequest): JwtPayload | null {
  const token = parseCookieToken(request) || parseAuthHeader(request);
  if (!token) return null;
  return verifyToken(token);
}

export function requireUser(request: FastifyRequest, reply: FastifyReply): JwtPayload | false {
  const user = getUser(request);
  if (!user) {
    reply.status(401).send({ error: 'Unauthorized', message: '请先登录' });
    return false;
  }
  return user;
}

function parseCookieToken(request: FastifyRequest): string | null {
  const cookie = request.cookies?.['token'];
  return cookie || null;
}

function parseAuthHeader(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}
