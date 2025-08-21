
import express from 'express';
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  bulkDeleteReviews,
  getAnalytics,
  getReviewsByEmployee,
  exportReviews
} from '../controllers/reviewController.js';

const router = express.Router();




router.get('/', getAllReviews);


router.get('/analytics', getAnalytics);


router.get('/export', exportReviews);


router.get('/employee/:employeeId', getReviewsByEmployee);


router.get('/:id', getReviewById);


router.post('/', createReview);


router.put('/:id', updateReview);


router.delete('/:id', deleteReview);


router.post('/bulk-delete', bulkDeleteReviews);

export default router;
