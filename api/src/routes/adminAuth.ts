import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@villageapi.com";
  const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || "$2a$10$/KXSvzhe.8yU5.toLW6lCOiLv7XMeQGfkIaT943aFHYVC7.czxBGq";
  const JWT_SECRET = process.env.JWT_SECRET || "d8974be39f395aca694f7420ac4f89538a180a7531be0f65495cd3517195c2f4";

  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, ADMIN_HASH);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { email, role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, email });
});

export default router;
