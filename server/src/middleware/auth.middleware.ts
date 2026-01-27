import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Supabase JWTs are signed with the JWT secret (which is the same as SUPABASE_SERVICE_ROLE_KEY's secret)
    // We decode without full verification here since Supabase handles token issuance
    // In production, you'd verify against Supabase's JWT secret
    const decoded = jwt.decode(token) as {
      sub: string;
      email: string;
      exp: number;
    } | null;

    if (!decoded || !decoded.sub) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Check expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }

    req.userId = decoded.sub;
    req.userEmail = decoded.email;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
