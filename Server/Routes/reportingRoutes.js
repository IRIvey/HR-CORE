
import express from 'express';
import {
  getReports,
  getReportById,
  downloadReport,
  generateReport
} from '../controllers/reportingController.js';

const router = express.Router();

// GET /api/reports - Get all reports
router.get('/', getReports);

// GET /api/reports/:id - Get specific report details
router.get('/:id', getReportById);

// GET /api/reports/:id/download/:format - Download report in specified format (csv/pdf)
router.get('/:id/download/:format', downloadReport);

// POST /api/reports/generate - Generate new report
router.post('/generate', generateReport);

export default router;
