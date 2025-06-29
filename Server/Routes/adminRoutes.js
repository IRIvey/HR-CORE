import express from 'express';
import { getAdminProfile } from '../controllers/adminController.js';

const router = express.Router();
router.get('/profile', getAdminProfile);
export default router;
