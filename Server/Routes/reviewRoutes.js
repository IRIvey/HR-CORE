import express from 'express';
import { getPerformanceReviews } from '../controllers/reviewController.js';

const router = express.Router();
router.get('/', getPerformanceReviews);
export default router;
