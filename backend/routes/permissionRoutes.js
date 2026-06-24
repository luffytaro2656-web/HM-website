import express from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import {
  getPermissions,
  updatePermission,
  resetPermissions,
} from '../controllers/permissionController.js';

const router = express.Router();

router.get('/', authenticateToken, getPermissions);
router.put('/', authenticateToken, requireRole(['Super Admin']), updatePermission);
router.post('/reset', authenticateToken, requireRole(['Super Admin']), resetPermissions);

export default router;
