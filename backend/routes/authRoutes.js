import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Authentication Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticateToken, logout); // Logout requires authentication to invalidate the token

export default router;
