import express from 'express';
import { getPerformanceReviews, addPerformanceReview } from '../controllers/reviewController.js';

const router = express.Router();


router.get('/', getPerformanceReviews);


router.post('/', addPerformanceReview);

export default router;
