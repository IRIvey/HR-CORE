// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// // GET /api/reports
// export const getAllReports = async (req, res) => {
//   try {
//     const reports = await prisma.reporting.findMany({
//       orderBy: {
//         generatedDate: 'desc'
//       }
//     });
//     res.status(200).json(reports);
//   } catch (error) {
//     console.error('Error fetching reports:', error);
//     res.status(500).json({ error: 'Failed to fetch reports' });
//   }
// };
import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// GET /api/reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await prisma.reporting.findMany({
      orderBy: {
        generatedDate: 'desc',
      },
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Handle downloading reports in CSV format
export const downloadReportsCSV = async (req, res) => {
  const { reportId } = req.params;  // Get report ID from URL parameters
  try {
    // Fetch the report by ID from the database
    const report = await prisma.reporting.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Convert the report data into CSV format using json2csv
    const parser = new Parser();
    const csvData = parser.parse([report]);

    // Set headers to prompt download as CSV
    res.header('Content-Type', 'text/csv');
    res.attachment(`report_${reportId}.csv`);
    res.send(csvData);

  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Failed to generate CSV' });
  }
};

// Handle downloading reports in PDF format
export const downloadReportsPDF = async (req, res) => {
  const { reportId } = req.params;  // Get report ID from URL parameters
  try {
    // Fetch the report by ID from the database
    const report = await prisma.reporting.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Create a PDF document using PDFKit
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'reports', `report_${reportId}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));

    // Add report details to the PDF
    doc.fontSize(20).text('Report Summary', { align: 'center' });
    doc.text(`Name: ${report.name}`);
    doc.text(`Type: ${report.type}`);
    doc.text(`Date: ${report.generatedDate}`);
    doc.text(`Content: ${report.content}`);
    doc.text('-----------------------');

    doc.end();

    // After finishing the PDF document, download it
    doc.on('finish', () => {
      res.download(filePath, `report_${reportId}.pdf`, (err) => {
        if (err) {
          console.error('Error downloading PDF:', err);
          res.status(500).json({ error: 'Failed to download PDF' });
        }
      });
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};