// import express from 'express';
// import { getAllReports } from '../controllers/reportingController.js';

// const router = express.Router();

// // GET /api/reports
// router.get('/', getAllReports);

// export default router;
import express from 'express';
import { downloadReportsCSV, downloadReportsPDF,getAllReports } from '../controllers/reportingController.js';

const router = express.Router();
router.get('/', getAllReports);
// Route to download report as CSV
router.get('/:reportId/download/csv', downloadReportsCSV);

// Route to download report as PDF
router.get('/:reportId/download/pdf', downloadReportsPDF);

export default router;
