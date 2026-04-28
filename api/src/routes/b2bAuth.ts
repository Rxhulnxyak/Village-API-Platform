import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, businessName } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        businessName,
        planType: 'FREE',
        status: 'PENDING'
      }
    });


    // Notify Admin of new registration
    try {
      const { adminNewUserNotificationTemplate } = await import('../emails/adminNewUserNotification');
      const { sendEmail } = await import('../lib/email');
      
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@villageapi.com',
        subject: `New Business Registration: ${businessName}`,
        html: adminNewUserNotificationTemplate({
          userId: user.id,
          businessName: user.businessName,
          email: user.email,
          createdAt: user.createdAt
        })
      });
    } catch (err) {
      console.error('Failed to send admin notification:', err);
      // Don't fail the registration if email fails
    }

    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, planType: user.planType },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, businessName: user.businessName, planType: user.planType } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
