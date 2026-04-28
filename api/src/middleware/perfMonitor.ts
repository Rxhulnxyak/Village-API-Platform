import { Request, Response, NextFunction } from 'express';

export const perfMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    (req as any).responseTimeMs = parseFloat(timeInMs);
    
    // In dev, log to console
    if (process.env.NODE_ENV === 'development') {
      const status = res.statusCode;
      const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
      console.log(`${color}${req.method} ${req.originalUrl} ${status} \x1b[0m- ${timeInMs}ms`);
    }
  });

  next();
};
