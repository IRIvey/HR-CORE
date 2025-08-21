import express from 'express';
import { login, logout, status } from '../controllers/authController.js';
import { requireAuth, allowRoles } from '../middleware/auth.js'; // fixed path

const router = express.Router();

// ✅ Public routes
router.post('/login', login);

// ✅ Protected routes
router.post('/logout', requireAuth, logout); // must be logged in to logout
router.get('/status', requireAuth, status); // must be logged in to see status

// ✅ Example: only ADMIN can check system health or admin dashboard
router.get('/admin-only', requireAuth, allowRoles('ADMIN'), (req, res) => {
  res.json({ message: `Hello ${req.session.user.name}, you are an ADMIN.` });
});

export default router;


