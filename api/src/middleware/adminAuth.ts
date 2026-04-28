import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    (req as any).admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
