import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email !== process.env.ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || '');
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { email, role: 'ADMIN' },
    (process.env.JWT_SECRET || 'secret') as string,
    { expiresIn: '7d' }
  );

  res.json({ token, email });
});

export default router;
