// /api/auth: register, login, logout and the current user. Handlers stay thin; rules live in the service.
import { Router } from 'express';
import { clearSessionCookie, setSessionCookie } from '../lib/jwt.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiters.js';
import { requireAuth } from '../middleware/requireAuth.js';
import * as authService from '../services/auth.service.js';

export const authRoutes = Router();

authRoutes.post('/register', registerLimiter, async (req, res) => {
  const user = await authService.register(req.body);
  setSessionCookie(res, user);
  res.status(201).json({ user });
});

authRoutes.post('/login', loginLimiter, async (req, res) => {
  const user = await authService.login(req.body);
  setSessionCookie(res, user);
  res.json({ user });
});

authRoutes.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

authRoutes.get('/me', requireAuth, async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ user });
});
