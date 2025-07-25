import express from 'express';
import { getEmployeeGoals, createGoal } from '../controllers/goalController.js';

const router = express.Router();
router.get('/', getEmployeeGoals);
router.post('/', createGoal); 
export default router;
