import express from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import {
  getUsers,
  createUser,
  approveUser,
  updateStatus,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

// All user management routes require login session and administrative roles
router.get('/', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), getUsers);
router.post('/', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), createUser);
router.patch('/:id/approve', authenticateToken, requireRole(['Super Admin']), approveUser);
router.patch('/:id/status', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), updateStatus);
router.delete('/:id', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), deleteUser);

export default router;
