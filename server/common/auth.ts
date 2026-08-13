import * as crypto from 'crypto';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'training-order-secret-2024';
const TOKEN_EXPIRE_HOURS = 72;

export interface TokenPayload {
  userId: string;
  username: string;
  realName: string;
  role: 'super_admin' | 'admin' | 'staff';
  team?: string;
  expiresAt: number;
}

// 密码哈希
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
}

// Token生成和验证
export function generateToken(payload: Omit<TokenPayload, 'expiresAt'>): string {
  const fullPayload: TokenPayload = {
    ...payload,
    expiresAt: Date.now() + TOKEN_EXPIRE_HOURS * 60 * 60 * 1000,
  };
  const payloadStr = JSON.stringify(fullPayload);
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadStr).digest('hex');
  return Buffer.from(`${payloadStr}.${signature}`).toString('base64');
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const data = Buffer.from(token, 'base64').toString('utf-8');
    const [payloadStr, signature] = data.split('.');
    if (!payloadStr || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(payloadStr) as TokenPayload;
    if (Date.now() > payload.expiresAt) return null;

    return payload;
  } catch {
    return null;
  }
}
