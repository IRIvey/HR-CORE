import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Get all reports
export const getReports = async (req, res) => {
  try {
    const reports = await prisma.reporting.findMany({
      orderBy: {
        generatedDate: 'desc'
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        size: true,
        downloads: true,
        generatedDate: true,
        date: true
      }
    });

    // Format the response to match frontend expectations
    const formattedReports = reports.map(report => ({
      id: report.id,
      name: report.name || `${report.type} Report`,
      type: report.type,
      date: report.date ? report.date.toISOString().split('T')[0] : report.generatedDate.toISOString().split('T')[0],
      status: report.status || 'completed',
      size: report.size || 'N/A',
      downloads: report.downloads || 0
    }));

    res.json(formattedReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Get specific report details
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await prisma.reporting.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

// Generate CSV content
const generateCSV = (reportData, reportType) => {
  let csvData = [];
  let fields = [];

  try {
    const content = typeof reportData.content === 'string' 
      ? JSON.parse(reportData.content) 
      : reportData.content;

    switch (reportType) {
      case 'attendance':
        fields = ['Employee Name', 'Days Present', 'Days Absent', 'Punctuality Score', 'Overtime Hours'];
        csvData = content.individualStats?.map(stat => ({
          'Employee Name': stat.name,
          'Days Present': stat.daysPresent,
          'Days Absent': stat.daysAbsent,
          'Punctuality Score': stat.punctualityScore,
          'Overtime Hours': stat.overtimeHours
        })) || [];
        break;

      case 'leave':
        fields = ['Employee Name', 'Annual Leave Allocated', 'Annual Leave Used', 'Annual Leave Remaining', 'Sick Leave Remaining'];
        csvData = content.employeeBalances?.map(balance => ({
          'Employee Name': balance.name,
          'Annual Leave Allocated': balance.annualLeave?.allocated || 0,
          'Annual Leave Used': balance.annualLeave?.used || 0,
          'Annual Leave Remaining': balance.annualLeave?.remaining || 0,
          'Sick Leave Remaining': balance.sickLeave?.remaining || 0
        })) || [];
        break;

      case 'payroll':
        fields = ['Employee Name', 'Base Salary', 'Overtime', 'Allowances', 'Gross Pay', 'Deductions', 'Net Pay'];
        csvData = content.employeePayroll?.map(payroll => ({
          'Employee Name': payroll.name,
          'Base Salary': payroll.baseSalary,
          'Overtime': payroll.overtime,
          'Allowances': payroll.allowances,
          'Gross Pay': payroll.grossPay,
          'Deductions': payroll.deductions,
          'Net Pay': payroll.netPay
        })) || [];
        break;

      case 'access':
        fields = ['User', 'Total Logins', 'Failed Attempts', 'Last Login', 'Avg Session Duration', 'Unique IPs'];
        csvData = content.userActivity?.map(activity => ({
          'User': activity.user,
          'Total Logins': activity.totalLogins,
          'Failed Attempts': activity.failedAttempts,
          'Last Login': activity.lastLogin,
          'Avg Session Duration': activity.avgSessionDuration,
          'Unique IPs': activity.uniqueIPs
        })) || [];
        break;

      case 'performance':
        fields = ['Employee Name', 'Rating', 'Strengths', 'Improvements', 'Goals', 'Goals Achieved'];
        csvData = content.individualReviews?.map(review => ({
          'Employee Name': review.name,
          'Rating': review.rating,
          'Strengths': review.strengths?.join(', ') || '',
          'Improvements': review.improvements?.join(', ') || '',
          'Goals': review.goals,
          'Goals Achieved': review.goalsAchieved
        })) || [];
        break;

      case 'compliance':
        fields = ['Compliance Area', 'Score', 'Status', 'Findings', 'Description'];
        csvData = content.complianceAreas?.map(area => ({
          'Compliance Area': area.area,
          'Score': area.score,
          'Status': area.status,
          'Findings': area.findings,
          'Description': area.description
        })) || [];
        break;

      default:
        fields = ['Type', 'Generated Date', 'Status'];
        csvData = [{
          'Type': reportData.type,
          'Generated Date': reportData.generatedDate,
          'Status': reportData.status || 'completed'
        }];
    }

    const parser = new Parser({ fields });
    return parser.parse(csvData);
  } catch (error) {
    console.error('Error generating CSV:', error);
    // Fallback CSV
    const parser = new Parser({ fields: ['Report Type', 'Generated Date'] });
    return parser.parse([{
      'Report Type': reportType,
      'Generated Date': reportData.generatedDate
    }]);
  }
};

// Generate PDF content
const generatePDF = (reportData, reportType) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      let buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // PDF Header
      doc.fontSize(20).text('HR Core - Report', 50, 50);
      doc.fontSize(16).text(`${reportType.toUpperCase()} REPORT`, 50, 80);
      doc.fontSize(12).text(`Generated: ${new Date(reportData.generatedDate).toLocaleDateString()}`, 50, 110);
      doc.text(`Status: ${reportData.status || 'Completed'}`, 50, 130);
      
      let yPosition = 170;

      try {
        const content = typeof reportData.content === 'string' 
          ? JSON.parse(reportData.content) 
          : reportData.content;

        switch (reportType) {
          case 'attendance':
            doc.fontSize(14).text('Attendance Summary', 50, yPosition);
            yPosition += 30;
            doc.fontSize(10).text(`Report Period: ${content.reportPeriod || 'N/A'}`, 50, yPosition);
            yPosition += 20;
            doc.text(`Total Employees: ${content.totalEmployees || 'N/A'}`, 50, yPosition);
            yPosition += 20;
            doc.text(`Overall Attendance Rate: ${content.overallAttendanceRate || 'N/A'}`, 50, yPosition);
            yPosition += 30;

            if (content.individualStats) {
              doc.fontSize(12).text('Individual Statistics:', 50, yPosition);
              yPosition += 20;
              content.individualStats.forEach(stat => {
                doc.fontSize(10).text(`${stat.name}: ${stat.daysPresent} days present, ${stat.daysAbsent} days absent`, 70, yPosition);
                yPosition += 15;
              });
            }
            break;

          case 'payroll':
            doc.fontSize(14).text('Payroll Summary', 50, yPosition);
            yPosition += 30;
            doc.fontSize(10).text(`Period: ${content.reportPeriod || 'N/A'}`, 50, yPosition);
            yPosition += 20;
            doc.text(`Total Payroll Cost: $${content.totalPayrollCost?.toLocaleString() || 'N/A'}`, 50, yPosition);
            yPosition += 20;
            doc.text(`Total Employees: ${content.totalEmployees || 'N/A'}`, 50, yPosition);
            break;

          default:
            doc.fontSize(14).text('Report Content', 50, yPosition);
            yPosition += 30;
            doc.fontSize(10).text(`Report Type: ${reportType}`, 50, yPosition);
            yPosition += 20;
            doc.text('Detailed report content available in CSV format.', 50, yPosition);
        }
      } catch (contentError) {
        console.error('Error parsing report content for PDF:', contentError);
        doc.fontSize(12).text('Report Summary', 50, yPosition);
        yPosition += 20;
        doc.fontSize(10).text('Detailed content parsing failed. Please download CSV for full data.', 50, yPosition);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Download report in specified format
export const downloadReport = async (req, res) => {
  try {
    const { id, format } = req.params;
    
    if (!['csv', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use csv or pdf.' });
    }

    const report = await prisma.reporting.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Increment download counter
    await prisma.reporting.update({
      where: { id },
      data: {
        downloads: {
          increment: 1
        }
      }
    });

    const filename = `${report.type}_report_${id}.${format}`;

    if (format === 'csv') {
      const csvContent = generateCSV(report, report.type);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } else if (format === 'pdf') {
      const pdfBuffer = await generatePDF(report, report.type);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
};

// Generate new report
export const generateReport = async (req, res) => {
  try {
    const { type, dateRange, includeDetails } = req.body;
    
    // This is a placeholder for report generation logic
    // In a real application, you would fetch data based on type and dateRange
    const newReport = await prisma.reporting.create({
      data: {
        type,
        status: 'processing',
        generatedDate: new Date(),
        content: JSON.stringify({
          dateRange,
          includeDetails,
          status: 'Generated via API'
        }),
        adminId: req.session?.adminId || 'default-admin-id'
      }
    });

    res.status(201).json({
      message: 'Report generation started',
      reportId: newReport.id,
      status: 'processing'
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

export default {
  getReports,
  getReportById,
  downloadReport,
  generateReport
};
