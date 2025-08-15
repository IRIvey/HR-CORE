import express from 'express';
import {
  getEmployeeGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  bulkAction
} from '../controllers/goalController.js';

const router = express.Router();

// GET /api/employee-goals
router.get('/', getEmployeeGoals);

// POST /api/employee-goals
router.post('/', createGoal);

// PUT /api/employee-goals/bulk
router.put('/bulk', bulkAction);

// PUT /api/employee-goals/:id
router.put('/:id', updateGoal);

// DELETE /api/employee-goals/:id
router.delete('/:id', deleteGoal);

export default router;
