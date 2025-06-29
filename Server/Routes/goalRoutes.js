import express from 'express';
import { getEmployeeGoals } from '../controllers/goalController.js';

const router = express.Router();
router.get('/', getEmployeeGoals);
export default router;
