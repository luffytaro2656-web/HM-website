import express from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getBeds,
  createBed,
  updateBed,
  deleteBed
} from '../controllers/hospitalController.js';

const router = express.Router();

// Hospital branches CRUD
router.get('/', authenticateToken, getHospitals);
router.get('/:id', authenticateToken, getHospitalById);
router.post('/', authenticateToken, requireRole(['Super Admin']), createHospital);
router.put('/:id', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), updateHospital);
router.delete('/:id', authenticateToken, requireRole(['Super Admin']), deleteHospital);

// Branch departments nested routes
router.get('/:hospitalId/departments', authenticateToken, getDepartments);
router.post('/:hospitalId/departments', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), createDepartment);
router.put('/:hospitalId/departments/:deptId', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), updateDepartment);
router.delete('/:hospitalId/departments/:deptId', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), deleteDepartment);

// Branch beds nested routes
router.get('/:hospitalId/beds', authenticateToken, getBeds);
router.post('/:hospitalId/beds', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), createBed);
router.put('/:hospitalId/beds/:bedId', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), updateBed);
router.delete('/:hospitalId/beds/:bedId', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), deleteBed);

export default router;
