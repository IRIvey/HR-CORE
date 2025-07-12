import express from 'express';
import { login, logout, status } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/status', status);

export default router;
