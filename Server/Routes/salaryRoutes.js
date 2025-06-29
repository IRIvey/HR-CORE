import express from 'express';
import { getSalaries } from '../controllers/salaryController.js';

const router = express.Router();
router.get('/', getSalaries);
export default router;
