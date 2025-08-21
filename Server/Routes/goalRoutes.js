
import express from 'express';
import {
  getEmployeeGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  bulkAction
} from '../controllers/goalController.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';

const router = express.Router();

// All employee goals endpoints require login
router.use(requireAuth);

// VIEW: admin, teamlead, employee (all can view goals)
router.get('/', allowRoles('ADMIN', 'TEAM_LEAD', 'EMPLOYEE'), getEmployeeGoals);

// CREATE/UPDATE/DELETE/BULK: admin and teamlead only
router.post('/', allowRoles('ADMIN', 'TEAM_LEAD'), createGoal);

// PUT /api/employee-goals/bulk - IMPORTANT: This must come before /:id route
router.put('/bulk', allowRoles('ADMIN', 'TEAM_LEAD'), bulkAction);

// PUT /api/employee-goals/:id
router.put('/:id', allowRoles('ADMIN', 'TEAM_LEAD'), updateGoal);

// DELETE /api/employee-goals/:id
router.delete('/:id', allowRoles('ADMIN', 'TEAM_LEAD'), deleteGoal);

export default router;
