import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Track active report generations to prevent conflicts
const activeGenerations = new Set();

// Get all reports with pagination and filtering
export const getAllReports = async (req, res) => {
  console.log('🔍 [getAllReports] Starting with query:', req.query);
  
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      adminId,
      search 
    } = req.query;

    const skip = (page - 1) * limit;
    console.log('📊 [getAllReports] Pagination params:', { page, limit, skip });
    
    const where = {};
    if (type && type !== 'all') {
      where.reportType = type;
      console.log('🔧 [getAllReports] Applied type filter:', type);
    }
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
      console.log('🔧 [getAllReports] Applied status filter:', status.toUpperCase());
    }
    if (adminId) {
      where.adminId = parseInt(adminId);
      console.log('🔧 [getAllReports] Applied adminId filter:', parseInt(adminId));
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
      console.log('🔧 [getAllReports] Applied search filter:', search);
    }

    console.log('🎯 [getAllReports] Final where clause:', JSON.stringify(where, null, 2));

    const [reports, total] = await Promise.all([
      prisma.reporting.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          admin: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.reporting.count({ where })
    ]);

    console.log('✅ [getAllReports] Successfully fetched:', { reportsCount: reports.length, total });
    res.json(reports);
  } catch (error) {
    console.error('❌ [getAllReports] Error fetching reports:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Get report statistics
export const getReportStats = async (req, res) => {
  console.log('📈 [getReportStats] Starting stats calculation');
  
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    console.log('📅 [getReportStats] Date ranges:', { currentDate, firstDayOfMonth });

    const [
      totalReports,
      monthlyReports,
      processingReports,
      completedReports
    ] = await Promise.all([
      prisma.reporting.count(),
      prisma.reporting.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      }),
      prisma.reporting.count({
        where: { status: 'GENERATING' }
      }),
      prisma.reporting.count({
        where: { status: 'COMPLETED' }
      })
    ]);

    console.log('📊 [getReportStats] Raw counts:', {
      totalReports,
      monthlyReports,
      processingReports,
      completedReports
    });

    const stats = {
      totalReports,
      monthlyReports,
      processingReports,
      totalDownloads: completedReports * 3
    };

    console.log('✅ [getReportStats] Final stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ [getReportStats] Error fetching stats:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Generate a new report
export const generateReport = async (req, res) => {
  console.log('🚀 [generateReport] Starting report generation with body:', JSON.stringify(req.body, null, 2));
  
  try {
    const {
      reportType,
      title,
      description,
      parameters,
      adminId
    } = req.body;

    console.log('🔍 [generateReport] Extracted params:', { reportType, title, adminId, parameters });

    // Validate required fields
    if (!reportType || !title || !parameters?.dateFrom || !parameters?.dateTo || !adminId) {
      console.error('❌ [generateReport] Missing required fields:', {
        reportType: !!reportType,
        title: !!title,
        dateFrom: !!parameters?.dateFrom,
        dateTo: !!parameters?.dateTo,
        adminId: !!adminId
      });
      return res.status(400).json({ 
        error: 'Missing required fields: reportType, title, dateFrom, dateTo, adminId' 
      });
    }

    console.log('🔍 [generateReport] Checking admin existence for adminId:', adminId);
    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: parseInt(adminId) }
    });

    if (!admin) {
      console.error('❌ [generateReport] Admin not found for ID:', adminId);
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    console.log('✅ [generateReport] Admin found:', { id: admin.id, name: admin.name });

    console.log('💾 [generateReport] Creating report record in database');
    // Create the report record
    const report = await prisma.reporting.create({
      data: {
        reportType,
        title,
        description: description || null,
        parameters,
        status: 'GENERATING',
        adminId: parseInt(adminId)
      }
    });

    console.log('✅ [generateReport] Report record created successfully:', {
      reportId: report.id,
      status: report.status,
      createdAt: report.createdAt
    });

    // Start report generation in background
    console.log('⚡ [generateReport] Starting background generation for report:', report.id);
    setImmediate(() => {
      generateReportData(report.id).catch(error => {
        console.error('💥 [generateReport] Background generation failed catastrophically:', {
          reportId: report.id,
          error: error.message,
          stack: error.stack
        });
      });
    });

    console.log('🎯 [generateReport] Responding with success for report:', report.id);
    res.status(201).json({
      message: 'Report generation started',
      reportId: report.id
    });

  } catch (error) {
    console.error('💥 [generateReport] Critical error in main function:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).json({ error: 'Failed to start report generation: ' + error.message });
  }
};

// Background report generation
const generateReportData = async (reportId) => {
  console.log('🔄 [generateReportData] Starting background generation for report:', reportId);
  
  // Prevent duplicate processing
  if (activeGenerations.has(reportId)) {
    console.log('⚠️ [generateReportData] Report generation already in progress for:', reportId);
    return;
  }

  activeGenerations.add(reportId);
  console.log('✅ [generateReportData] Added to active generations set. Current active:', Array.from(activeGenerations));

  try {
    console.log('🔍 [generateReportData] Fetching report record for:', reportId);
    
    const report = await prisma.reporting.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      console.error('❌ [generateReportData] Report not found in database:', reportId);
      throw new Error('Report not found');
    }

    console.log('✅ [generateReportData] Report found:', {
      id: report.id,
      type: report.reportType,
      title: report.title,
      status: report.status,
      parameters: report.parameters
    });

    const { reportType, parameters } = report;
    console.log('🎯 [generateReportData] Generating report type:', reportType, 'with parameters:', parameters);
    
    let reportData;

    // Generate different types of reports
    switch (reportType) {
      case 'ATTENDANCE_SUMMARY':
        console.log('👥 [generateReportData] Processing ATTENDANCE_SUMMARY');
        reportData = await generateAttendanceReport(parameters);
        break;
      case 'LEAVE_SUMMARY':
        console.log('🏖️ [generateReportData] Processing LEAVE_SUMMARY');
        reportData = await generateLeaveReport(parameters);
        break;
      case 'PAYROLL_SUMMARY':
        console.log('💰 [generateReportData] Processing PAYROLL_SUMMARY');
        reportData = await generatePayrollReport(parameters);
        break;
      case 'EMPLOYEE_PERFORMANCE':
        console.log('⭐ [generateReportData] Processing EMPLOYEE_PERFORMANCE');
        reportData = await generatePerformanceReport(parameters);
        break;
      case 'DEPARTMENT_ANALYTICS':
        console.log('🏢 [generateReportData] Processing DEPARTMENT_ANALYTICS');
        reportData = await generateDepartmentReport(parameters);
        break;
      case 'MONTHLY_OVERVIEW':
        console.log('📊 [generateReportData] Processing MONTHLY_OVERVIEW');
        reportData = await generateMonthlyOverview(parameters);
        break;
      default:
        console.error('❌ [generateReportData] Unknown report type:', reportType);
        throw new Error('Unknown report type: ' + reportType);
    }

    console.log('✅ [generateReportData] Report data generated successfully:', {
      type: reportData.type,
      recordCount: reportData.totalRecords,
      hasDetails: !!reportData.details,
      detailsLength: reportData.details?.length
    });

    console.log('📄 [generateReportData] Starting PDF creation for report:', reportId);
    // Generate PDF
    const filePath = await createPDFReport(reportId, reportData, report);
    console.log('✅ [generateReportData] PDF created at:', filePath);

    // Check if file actually exists and get stats
    if (!fs.existsSync(filePath)) {
      console.error('❌ [generateReportData] PDF file was not created at expected path:', filePath);
      throw new Error('PDF file creation failed - file not found at path');
    }

    const fileStats = fs.statSync(filePath);
    console.log('📊 [generateReportData] File stats:', {
      size: fileStats.size,
      path: filePath,
      created: fileStats.birthtime
    });

    console.log('💾 [generateReportData] Updating report status to COMPLETED');
    // Update report with completion
    const updatedReport = await prisma.reporting.update({
      where: { id: reportId },
      data: {
        status: 'COMPLETED',
        filePath,
        fileSize: fileStats.size,
        generatedAt: new Date()
      }
    });

    console.log('✅ [generateReportData] Report updated successfully:', {
      id: updatedReport.id,
      status: updatedReport.status,
      filePath: updatedReport.filePath,
      fileSize: updatedReport.fileSize,
      generatedAt: updatedReport.generatedAt
    });

    // Create notification
    try {
      console.log('🔔 [generateReportData] Creating success notification');
      const notification = await prisma.notification.create({
        data: {
          reportId,
          title: 'Report Generated',
          message: `Your report "${report.title}" has been generated successfully`,
          type: 'REPORT_READY'
        }
      });
      console.log('✅ [generateReportData] Notification created:', notification.id);
    } catch (notificationError) {
      console.error('⚠️ [generateReportData] Failed to create notification (non-critical):', {
        error: notificationError.message,
        reportId
      });
    }

    console.log('🎉 [generateReportData] Report generation completed successfully for:', reportId);

  } catch (error) {
    console.error('💥 [generateReportData] Error generating report:', {
      reportId,
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name
    });
    
    try {
      console.log('🔄 [generateReportData] Updating report status to FAILED');
      
      const failedReport = await prisma.reporting.update({
        where: { id: reportId },
        data: { status: 'FAILED' }
      });

      console.log('✅ [generateReportData] Report status updated to FAILED:', failedReport.id);

      // Create error notification
      console.log('🔔 [generateReportData] Creating error notification');
      const errorNotification = await prisma.notification.create({
        data: {
          reportId,
          title: 'Report Generation Failed',
          message: `Failed to generate report: ${error.message}`,
          type: 'ERROR'
        }
      });
      console.log('✅ [generateReportData] Error notification created:', errorNotification.id);
      
    } catch (updateError) {
      console.error('💥 [generateReportData] Failed to update report status or create notification:', {
        reportId,
        updateError: updateError.message,
        updateStack: updateError.stack
      });
    }
  } finally {
    activeGenerations.delete(reportId);
    console.log('🔄 [generateReportData] Removed from active generations. Remaining active:', Array.from(activeGenerations));
  }
};

// Enhanced attendance report with detailed information
const generateAttendanceReport = async (parameters) => {
  console.log('👥 [generateAttendanceReport] Starting with parameters:', parameters);
  
  const { dateFrom, dateTo, departmentId } = parameters;
  console.log('📅 [generateAttendanceReport] Date range:', { dateFrom, dateTo, departmentId });
  
  try {
    const where = {
      date: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      }
    };

    if (departmentId && departmentId !== '') {
      where.employee = {
        departmentId: parseInt(departmentId)
      };
      console.log('🏢 [generateAttendanceReport] Added department filter:', departmentId);
    }

    console.log('🎯 [generateAttendanceReport] Final where clause:', JSON.stringify(where, null, 2));

    console.log('🔍 [generateAttendanceReport] Fetching attendance data');
    const attendanceData = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          include: {
            department: true
          }
        }
      },
      orderBy: [
        { employee: { name: 'asc' } },
        { date: 'desc' }
      ]
    });

    console.log('✅ [generateAttendanceReport] Attendance records found:', {
      count: attendanceData.length,
      sampleRecord: attendanceData[0] ? {
        id: attendanceData[0].id,
        employeeName: attendanceData[0].employee?.name,
        date: attendanceData[0].date,
        status: attendanceData[0].status
      } : 'No records'
    });

    // Get additional statistics
    console.log('📊 [generateAttendanceReport] Fetching additional statistics');
    const [totalEmployees, departmentBreakdown] = await Promise.all([
      prisma.employee.count(),
      prisma.attendance.groupBy({
        by: ['employeeId'],
        where,
        _count: { id: true },
        _sum: { totalHours: true, overtime: true }
      })
    ]);

    console.log('📈 [generateAttendanceReport] Statistics:', {
      totalEmployees,
      departmentBreakdownCount: departmentBreakdown.length,
      sampleBreakdown: departmentBreakdown[0]
    });

    console.log('🔄 [generateAttendanceReport] Processing attendance data');
    const summary = processAttendanceData(attendanceData);
    
    // Enhanced summary with detailed statistics
    summary.totalEmployeesInSystem = totalEmployees;
    summary.uniqueEmployeesInReport = departmentBreakdown.length;
    summary.totalOvertimeHours = departmentBreakdown.reduce((sum, emp) => 
      sum + (emp._sum.overtime || 0), 0).toFixed(2);
    summary.averageHoursPerEmployee = departmentBreakdown.length > 0 ? 
      (departmentBreakdown.reduce((sum, emp) => sum + (emp._sum.totalHours || 0), 0) / departmentBreakdown.length).toFixed(2) : '0';

    console.log('✅ [generateAttendanceReport] Enhanced summary created:', summary);

    console.log('🏢 [generateAttendanceReport] Getting department breakdown');
    const departmentAttendanceBreakdown = await getDepartmentAttendanceBreakdown(where);
    console.log('📊 [generateAttendanceReport] Department breakdown count:', departmentAttendanceBreakdown.length);

    const result = {
      type: 'Attendance Summary',
      period: `${dateFrom} to ${dateTo}`,
      summary,
      details: attendanceData.slice(0, 100),
      totalRecords: attendanceData.length,
      departmentBreakdown: departmentAttendanceBreakdown
    };

    console.log('🎉 [generateAttendanceReport] Report data prepared successfully');
    return result;
    
  } catch (error) {
    console.error('💥 [generateAttendanceReport] Error:', {
      error: error.message,
      stack: error.stack,
      parameters
    });
    throw error;
  }
};

// Enhanced payroll report with detailed salary breakdown
const generatePayrollReport = async (parameters) => {
  console.log('💰 [generatePayrollReport] Starting with parameters:', parameters);
  
  const { dateFrom, dateTo, departmentId } = parameters;
  console.log('📅 [generatePayrollReport] Date range:', { dateFrom, dateTo, departmentId });
  
  try {
    const where = {
      payDate: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      }
    };

    if (departmentId && departmentId !== '') {
      where.employee = {
        departmentId: parseInt(departmentId)
      };
      console.log('🏢 [generatePayrollReport] Added department filter:', departmentId);
    }

    console.log('🎯 [generatePayrollReport] Final where clause:', JSON.stringify(where, null, 2));

    console.log('🔍 [generatePayrollReport] Fetching payroll data');
    const payrollData = await prisma.salary.findMany({
      where,
      include: {
        employee: {
          include: {
            department: true
          }
        }
      },
      orderBy: [
        { employee: { name: 'asc' } },
        { payDate: 'desc' }
      ]
    });

    console.log('✅ [generatePayrollReport] Payroll records found:', {
      count: payrollData.length,
      sampleRecord: payrollData[0] ? {
        id: payrollData[0].id,
        employeeName: payrollData[0].employee?.name,
        baseSalary: payrollData[0].baseSalary,
        payDate: payrollData[0].payDate
      } : 'No records'
    });

    // Get detailed payroll analytics
    console.log('📊 [generatePayrollReport] Getting payroll analytics');
    const payrollAnalytics = await getPayrollAnalytics(where);
    console.log('📈 [generatePayrollReport] Analytics:', payrollAnalytics);

    console.log('🏢 [generatePayrollReport] Getting department breakdown');
    const departmentPayrollBreakdown = await getDepartmentPayrollBreakdown(where);
    console.log('📊 [generatePayrollReport] Department breakdown count:', departmentPayrollBreakdown.length);

    console.log('🔄 [generatePayrollReport] Processing payroll data');
    const summary = processPayrollData(payrollData);
    
    // Enhanced summary with detailed payroll information
    summary.departmentCount = departmentPayrollBreakdown.length;
    summary.highestSalary = payrollData.length > 0 ? 
      Math.max(...payrollData.map(p => p.baseSalary + p.allowances - p.deductions)).toFixed(2) : '0';
    summary.lowestSalary = payrollData.length > 0 ? 
      Math.min(...payrollData.map(p => p.baseSalary + p.allowances - p.deductions)).toFixed(2) : '0';
    summary.totalTaxDeductions = payrollData.reduce((sum, p) => sum + (p.deductions || 0), 0).toFixed(2);
    summary.totalBonusAllowances = payrollData.reduce((sum, p) => sum + (p.allowances || 0), 0).toFixed(2);

    console.log('✅ [generatePayrollReport] Enhanced summary created:', summary);

    const result = {
      type: 'Payroll Summary',
      period: `${dateFrom} to ${dateTo}`,
      summary,
      details: payrollData.slice(0, 100),
      totalRecords: payrollData.length,
      departmentPayrollBreakdown,
      payrollAnalytics
    };

    console.log('🎉 [generatePayrollReport] Report data prepared successfully');
    return result;
    
  } catch (error) {
    console.error('💥 [generatePayrollReport] Error:', {
      error: error.message,
      stack: error.stack,
      parameters
    });
    throw error;
  }
};

// Enhanced leave report
const generateLeaveReport = async (parameters) => {
  console.log('🏖️ [generateLeaveReport] Starting with parameters:', parameters);
  
  const { dateFrom, dateTo, departmentId } = parameters;
  console.log('📅 [generateLeaveReport] Date range:', { dateFrom, dateTo, departmentId });
  
  try {
    const where = {
      createdAt: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      }
    };

    if (departmentId && departmentId !== '') {
      where.employee = {
        departmentId: parseInt(departmentId)
      };
      console.log('🏢 [generateLeaveReport] Added department filter:', departmentId);
    }

    console.log('🎯 [generateLeaveReport] Final where clause:', JSON.stringify(where, null, 2));

    console.log('🔍 [generateLeaveReport] Fetching leave data');
    const leaveData = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          include: {
            department: true
          }
        }
      },
      orderBy: [
        { employee: { name: 'asc' } },
        { startDate: 'desc' }
      ]
    });

    console.log('✅ [generateLeaveReport] Leave records found:', {
      count: leaveData.length,
      sampleRecord: leaveData[0] ? {
        id: leaveData[0].id,
        employeeName: leaveData[0].employee?.name,
        leaveType: leaveData[0].leaveType,
        status: leaveData[0].status
      } : 'No records'
    });

    // Get leave type breakdown
    console.log('📊 [generateLeaveReport] Getting leave type breakdown');
    const leaveTypeBreakdown = await getLeaveTypeBreakdown(where);
    console.log('📈 [generateLeaveReport] Leave type breakdown:', leaveTypeBreakdown);

    console.log('🏢 [generateLeaveReport] Getting department breakdown');
    const departmentLeaveBreakdown = await getDepartmentLeaveBreakdown(where);
    console.log('📊 [generateLeaveReport] Department breakdown count:', departmentLeaveBreakdown.length);

    console.log('🔄 [generateLeaveReport] Processing leave data');
    const summary = processLeaveData(leaveData);
    
    // Enhanced summary
    summary.leaveTypeBreakdown = leaveTypeBreakdown;
    summary.averageLeavePerEmployee = departmentLeaveBreakdown.reduce((sum, dept) => 
      sum + dept.averageDays, 0) / (departmentLeaveBreakdown.length || 1);

    console.log('✅ [generateLeaveReport] Enhanced summary created:', summary);

    const result = {
      type: 'Leave Summary',
      period: `${dateFrom} to ${dateTo}`,
      summary,
      details: leaveData.slice(0, 100),
      totalRecords: leaveData.length,
      departmentLeaveBreakdown,
      leaveTypeBreakdown
    };

    console.log('🎉 [generateLeaveReport] Report data prepared successfully');
    return result;
    
  } catch (error) {
    console.error('💥 [generateLeaveReport] Error:', {
      error: error.message,
      stack: error.stack,
      parameters
    });
    throw error;
  }
};

// Enhanced performance report
const generatePerformanceReport = async (parameters) => {
  console.log('⭐ [generatePerformanceReport] Starting with parameters:', parameters);
  
  const { dateFrom, dateTo, departmentId } = parameters;
  console.log('📅 [generatePerformanceReport] Date range:', { dateFrom, dateTo, departmentId });
  
  try {
    const where = {
      reviewDate: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      }
    };

    if (departmentId && departmentId !== '') {
      where.employee = {
        departmentId: parseInt(departmentId)
      };
      console.log('🏢 [generatePerformanceReport] Added department filter:', departmentId);
    }

    console.log('🎯 [generatePerformanceReport] Final where clause:', JSON.stringify(where, null, 2));

    console.log('🔍 [generatePerformanceReport] Fetching performance data');
    const performanceData = await prisma.performanceReview.findMany({
      where,
      include: {
        employee: {
          include: {
            department: true,
            goals: {
              where: {
                createdAt: {
                  gte: new Date(dateFrom),
                  lte: new Date(dateTo)
                }
              }
            }
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { employee: { name: 'asc' } }
      ]
    });

    console.log('✅ [generatePerformanceReport] Performance records found:', {
      count: performanceData.length,
      sampleRecord: performanceData[0] ? {
        id: performanceData[0].id,
        employeeName: performanceData[0].employee?.name,
        rating: performanceData[0].rating,
        reviewDate: performanceData[0].reviewDate
      } : 'No records'
    });

    console.log('🔄 [generatePerformanceReport] Processing performance data');
    const summary = processPerformanceData(performanceData);
    
    // Enhanced summary with goal tracking
    const goalData = performanceData.flatMap(p => p.employee.goals);
    summary.totalGoals = goalData.length;
    summary.completedGoals = goalData.filter(g => g.status === 'Completed').length;
    summary.goalCompletionRate = goalData.length > 0 ? 
      `${((summary.completedGoals / goalData.length) * 100).toFixed(1)}%` : '0%';

    // Fix: Convert ratingDistribution object to a readable string for summary
    if (summary.ratingDistribution && typeof summary.ratingDistribution === 'object') {
      summary.ratingDistribution = Object.entries(summary.ratingDistribution)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    }

    console.log('✅ [generatePerformanceReport] Enhanced summary created:', {
      ...summary,
      goalDataLength: goalData.length
    });

    const result = {
      type: 'Performance Review Summary',
      period: `${dateFrom} to ${dateTo}`,
      summary,
      details: performanceData.slice(0, 100),
      totalRecords: performanceData.length,
      goalData: goalData.slice(0, 50)
    };

    console.log('🎉 [generatePerformanceReport] Report data prepared successfully');
    return result;
    
  } catch (error) {
    console.error('💥 [generatePerformanceReport] Error:', {
      error: error.message,
      stack: error.stack,
      parameters
    });
    throw error;
  }
};

// Department analytics
const generateDepartmentReport = async (parameters) => {
  console.log('🏢 [generateDepartmentReport] Starting with parameters:', parameters);
  
  const { dateFrom, dateTo } = parameters;
  console.log('📅 [generateDepartmentReport] Date range:', { dateFrom, dateTo });

  try {
    console.log('🔍 [generateDepartmentReport] Fetching departments, employees, and attendance');
    const [departments, employees, attendanceData] = await Promise.all([
      prisma.department.findMany({
        include: {
          employees: true
        }
      }),
      prisma.employee.count(),
      prisma.attendance.findMany({
        where: {
          date: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo)
          }
        },
        include: {
          employee: {
            include: {
              department: true
            }
          }
        }
      })
    ]);

    console.log('✅ [generateDepartmentReport] Data fetched:', { 
      departments: departments.length, 
      employees, 
      attendance: attendanceData.length 
    });

    console.log('🔄 [generateDepartmentReport] Processing department data');
    const summary = processDepartmentData(departments, attendanceData);

    const result = {
      type: 'Department Analytics',
      period: `${dateFrom} to ${dateTo}`,
      summary: summary,
      totalDepartments: departments.length,
      totalEmployees: employees,
      details: departments.map(dept => ({
        name: dept.name,
        employeeCount: dept.employees.length,
        attendanceRecords: attendanceData.filter(a => a.employee.departmentId === dept.id).length
      }))
    };

    console.log('✅ [generateDepartmentReport] Report data prepared successfully');
    return result;
    
  } catch (error) {
    console.error('💥 [generateDepartmentReport] Error:', {
      error: error.message,
      stack: error.stack,
      parameters
    });
    throw error;
  }
};

// Monthly overview
const generateMonthlyOverview = async (parameters) => {
  console.log('📊 [generateMonthlyOverview] Starting with parameters:', parameters);
  
  const { dateFrom, dateTo } = parameters;
  console.log('📅 [generateMonthlyOverview] Date range:', { dateFrom, dateTo });

  try {
    console.log('🔍 [generateMonthlyOverview] Fetching overview data');
    const [
      totalEmployees,
      attendanceCount,
      leaveCount,
      payrollCount,
      performanceCount
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.attendance.count({
        where: { date: { gte: new Date(dateFrom), lte: new Date(dateTo) } }
      }),
      prisma.leaveRequest.count({
        where: { createdAt: { gte: new Date(dateFrom), lte: new Date(dateTo) } }
      }),
      prisma.salary.count({
        where: { payDate: { gte: new Date(dateFrom), lte: new Date(dateTo) } }
      }),
      prisma.performanceReview.count({
        where: { reviewDate: { gte: new Date(dateFrom), lte: new Date(dateTo) } }
      })
    ]);

    console.log('✅ [generateMonthlyOverview] Overview data fetched:', {
      totalEmployees,
      attendanceCount,
      leaveCount,
      payrollCount,
      performanceCount
    });

    const result = {
      type: 'Monthly Overview',
      period: `${dateFrom} to ${dateTo}`,
      overview: {
        totalEmployees,
        attendanceRecords: attendanceCount,
        leaveRequests: leaveCount,
        payrollRecords: payrollCount,
        performanceReviews: performanceCount
      }
    };

    console.log('🎉 [generateMonthlyOverview] Report data prepared successfully');
    return result;
    
  } catch (error) {
    console.error('💥 [generateMonthlyOverview] Error:', {
      error: error.message,
      stack: error.stack,
      parameters
    });
    throw error;
  }
};

// Helper functions for detailed breakdowns
const getDepartmentAttendanceBreakdown = async (where) => {
  console.log('🏢 [getDepartmentAttendanceBreakdown] Getting department attendance breakdown with where:', where);
  
  try {
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          include: {
            attendances: { where }
          }
        }
      }
    });

    console.log('✅ [getDepartmentAttendanceBreakdown] Departments fetched:', departments.length);

    const breakdown = departments.map(dept => {
      const result = {
        department: dept.name,
        totalEmployees: dept.employees.length,
        totalAttendanceRecords: dept.employees.reduce((sum, emp) => sum + emp.attendances.length, 0),
        averageAttendanceRate: calculateDepartmentAttendanceRate(dept.employees)
      };
      console.log('📊 [getDepartmentAttendanceBreakdown] Department breakdown:', result);
      return result;
    });

    return breakdown;
  } catch (error) {
    console.error('💥 [getDepartmentAttendanceBreakdown] Error:', error.message);
    throw error;
  }
};

const getDepartmentPayrollBreakdown = async (where) => {
  console.log('💰 [getDepartmentPayrollBreakdown] Getting department payroll breakdown with where:', where);
  
  try {
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          include: {
            salaries: { where }
          }
        }
      }
    });

    console.log('✅ [getDepartmentPayrollBreakdown] Departments fetched:', departments.length);

    const breakdown = departments.map(dept => {
      const allSalaries = dept.employees.flatMap(emp => emp.salaries);
      const totalPayout = allSalaries.reduce((sum, sal) => 
        sum + sal.baseSalary + sal.allowances - sal.deductions, 0);
      
      const result = {
        department: dept.name,
        employeeCount: dept.employees.length,
        totalPayout: totalPayout.toFixed(2),
        averageSalary: allSalaries.length > 0 ? (totalPayout / allSalaries.length).toFixed(2) : '0',
        payrollRecords: allSalaries.length
      };
      console.log('📊 [getDepartmentPayrollBreakdown] Department breakdown:', result);
      return result;
    });

    return breakdown;
  } catch (error) {
    console.error('💥 [getDepartmentPayrollBreakdown] Error:', error.message);
    throw error;
  }
};

const getDepartmentLeaveBreakdown = async (where) => {
  console.log('🏖️ [getDepartmentLeaveBreakdown] Getting department leave breakdown with where:', where);
  
  try {
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          include: {
            leaveRequests: { where }
          }
        }
      }
    });

    console.log('✅ [getDepartmentLeaveBreakdown] Departments fetched:', departments.length);

    const breakdown = departments.map(dept => {
      const allLeaves = dept.employees.flatMap(emp => emp.leaveRequests);
      const totalDays = allLeaves.reduce((sum, leave) => {
        const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        return sum + (days > 0 ? days : 1);
      }, 0);
      
      const result = {
        department: dept.name,
        totalRequests: allLeaves.length,
        totalDays,
        averageDays: allLeaves.length > 0 ? (totalDays / allLeaves.length).toFixed(1) : '0',
        approvedRequests: allLeaves.filter(l => l.status === 'Approved').length
      };
      console.log('📊 [getDepartmentLeaveBreakdown] Department breakdown:', result);
      return result;
    });

    return breakdown;
  } catch (error) {
    console.error('💥 [getDepartmentLeaveBreakdown] Error:', error.message);
    throw error;
  }
};

const getLeaveTypeBreakdown = async (where) => {
  console.log('📋 [getLeaveTypeBreakdown] Getting leave type breakdown with where:', where);
  
  try {
    const leaveTypes = await prisma.leaveRequest.groupBy({
      by: ['leaveType'],
      where,
      _count: { id: true }
    });

    console.log('✅ [getLeaveTypeBreakdown] Leave types fetched:', leaveTypes.length);

    const breakdown = leaveTypes.map(type => {
      const result = {
        type: type.leaveType,
        count: type._count.id
      };
      console.log('📊 [getLeaveTypeBreakdown] Type breakdown:', result);
      return result;
    });

    return breakdown;
  } catch (error) {
    console.error('💥 [getLeaveTypeBreakdown] Error:', error.message);
    throw error;
  }
};

const getPayrollAnalytics = async (where) => {
  console.log('📈 [getPayrollAnalytics] Getting payroll analytics with where:', where);
  
  try {
    const analytics = await prisma.salary.aggregate({
      where,
      _avg: {
        baseSalary: true,
        allowances: true,
        deductions: true,
        overtimeHours: true
      },
      _sum: {
        baseSalary: true,
        allowances: true,
        deductions: true,
        overtimeHours: true
      },
      _count: { id: true }
    });

    console.log('✅ [getPayrollAnalytics] Analytics calculated:', analytics);

    const result = {
      averageBaseSalary: analytics._avg.baseSalary?.toFixed(2) || '0',
      averageAllowances: analytics._avg.allowances?.toFixed(2) || '0',
      averageDeductions: analytics._avg.deductions?.toFixed(2) || '0',
      averageOvertimeHours: analytics._avg.overtimeHours?.toFixed(1) || '0',
      totalBaseSalary: analytics._sum.baseSalary?.toFixed(2) || '0',
      totalAllowances: analytics._sum.allowances?.toFixed(2) || '0',
      totalDeductions: analytics._sum.deductions?.toFixed(2) || '0',
      totalOvertimeHours: analytics._sum.overtimeHours || 0,
      recordCount: analytics._count.id
    };

    console.log('📊 [getPayrollAnalytics] Final analytics:', result);
    return result;
  } catch (error) {
    console.error('💥 [getPayrollAnalytics] Error:', error.message);
    throw error;
  }
};

const calculateDepartmentAttendanceRate = (employees) => {
  console.log('🧮 [calculateDepartmentAttendanceRate] Calculating for employees:', employees.length);
  
  try {
    const totalAttendance = employees.reduce((sum, emp) => sum + emp.attendances.length, 0);
    const totalPossible = employees.length * 30; // Assuming 30 days in period
    const rate = totalPossible > 0 ? `${((totalAttendance / totalPossible) * 100).toFixed(1)}%` : '0%';
    
    console.log('📊 [calculateDepartmentAttendanceRate] Rate calculated:', {
      totalAttendance,
      totalPossible,
      rate
    });
    
    return rate;
  } catch (error) {
    console.error('💥 [calculateDepartmentAttendanceRate] Error:', error.message);
    return '0%';
  }
};

// Data processing helper functions with enhanced debugging
const processAttendanceData = (data) => {
  console.log('🔄 [processAttendanceData] Processing attendance data, count:', data?.length);
  
  if (!data || data.length === 0) {
    console.log('⚠️ [processAttendanceData] No data to process, returning defaults');
    return {
      totalRecords: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      attendanceRate: '0%',
      totalWorkingHours: '0',
      averageHoursPerDay: '0'
    };
  }

  try {
    const totalRecords = data.length;
    const presentCount = data.filter(a => a.status === 'PRESENT').length;
    const absentCount = data.filter(a => a.status === 'ABSENT').length;
    const lateCount = data.filter(a => a.status === 'LATE').length;
    
    console.log('📊 [processAttendanceData] Status counts:', {
      totalRecords,
      presentCount,
      absentCount,
      lateCount
    });
    
    const totalHours = data.reduce((sum, a) => {
      const hours = a.totalHours || (a.checkInTime && a.checkOutTime ? 8 : 0);
      return sum + hours;
    }, 0);
    
    const avgHours = totalRecords > 0 ? (totalHours / totalRecords).toFixed(2) : '0';

    const result = {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: `${((presentCount / totalRecords) * 100).toFixed(1)}%`,
      totalWorkingHours: totalHours.toFixed(2),
      averageHoursPerDay: avgHours,
      overtimeHours: data.reduce((sum, a) => sum + (a.overtime || 0), 0).toFixed(2)
    };

    console.log('✅ [processAttendanceData] Final result:', result);
    return result;
  } catch (error) {
    console.error('💥 [processAttendanceData] Error processing attendance data:', {
      error: error.message,
      dataLength: data?.length
    });
    return {
      totalRecords: data.length,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      attendanceRate: '0%',
      totalWorkingHours: '0',
      averageHoursPerDay: '0'
    };
  }
};

const processLeaveData = (data) => {
  console.log('🔄 [processLeaveData] Processing leave data, count:', data?.length);
  
  if (!data || data.length === 0) {
    console.log('⚠️ [processLeaveData] No data to process, returning defaults');
    return { totalRequests: 0 };
  }

  try {
    const totalRequests = data.length;
    const approvedCount = data.filter(l => l.status === 'Approved').length;
    const pendingCount = data.filter(l => l.status === 'Pending').length;
    const rejectedCount = data.filter(l => l.status === 'Rejected').length;

    console.log('📊 [processLeaveData] Status counts:', {
      totalRequests,
      approvedCount,
      pendingCount,
      rejectedCount
    });

    const totalLeaveDays = data.reduce((sum, leave) => {
      const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      return sum + (days > 0 ? days : 1);
    }, 0);

    const result = {
      totalRequests,
      approvedCount,
      pendingCount,
      rejectedCount,
      approvalRate: totalRequests > 0 ? `${((approvedCount / totalRequests) * 100).toFixed(1)}%` : '0%',
      totalLeaveDays,
      averageLeaveDays: totalRequests > 0 ? (totalLeaveDays / totalRequests).toFixed(1) : '0'
    };

    console.log('✅ [processLeaveData] Final result:', result);
    return result;
  } catch (error) {
    console.error('💥 [processLeaveData] Error processing leave data:', {
      error: error.message,
      dataLength: data?.length
    });
    return { totalRequests: data.length };
  }
};

const processPayrollData = (data) => {
  console.log('🔄 [processPayrollData] Processing payroll data, count:', data?.length);
  
  if (!data || data.length === 0) {
    console.log('⚠️ [processPayrollData] No data to process, returning defaults');
    return { totalRecords: 0 };
  }

  try {
    const totalRecords = data.length;
    
    const totalBaseSalary = data.reduce((sum, s) => sum + (parseFloat(s.baseSalary) || 0), 0);
    const totalAllowances = data.reduce((sum, s) => sum + (parseFloat(s.allowances) || 0), 0);
    const totalDeductions = data.reduce((sum, s) => sum + (parseFloat(s.deductions) || 0), 0);
    const totalNetSalary = totalBaseSalary + totalAllowances - totalDeductions;
    const totalOvertimeHours = data.reduce((sum, s) => sum + (parseInt(s.overtimeHours) || 0), 0);

    console.log('📊 [processPayrollData] Payroll totals:', {
      totalRecords,
      totalBaseSalary: totalBaseSalary.toFixed(2),
      totalAllowances: totalAllowances.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      totalNetSalary: totalNetSalary.toFixed(2),
      totalOvertimeHours
    });

    const result = {
      totalRecords,
      totalBaseSalary: totalBaseSalary.toFixed(2),
      totalAllowances: totalAllowances.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      totalNetSalary: totalNetSalary.toFixed(2),
      averageSalary: totalRecords > 0 ? (totalNetSalary / totalRecords).toFixed(2) : '0',
      totalOvertimeHours,
      averageOvertimeHours: totalRecords > 0 ? (totalOvertimeHours / totalRecords).toFixed(1) : '0'
    };

    console.log('✅ [processPayrollData] Final result:', result);
    return result;
  } catch (error) {
    console.error('💥 [processPayrollData] Error processing payroll data:', {
      error: error.message,
      dataLength: data?.length
    });
    return { 
      totalRecords: data.length,
      totalBaseSalary: '0',
      totalAllowances: '0', 
      totalDeductions: '0',
      totalNetSalary: '0',
      averageSalary: '0',
      totalOvertimeHours: 0
    };
  }
};

const processPerformanceData = (data) => {
  console.log('🔄 [processPerformanceData] Processing performance data, count:', data?.length);
  
  if (!data || data.length === 0) {
    console.log('⚠️ [processPerformanceData] No data to process, returning defaults');
    return { totalReviews: 0 };
  }

  try {
    const totalReviews = data.length;
    const avgRating = data.reduce((sum, p) => sum + (p.rating || 0), 0) / totalReviews;
    
    // Rating distribution
    const ratingDistribution = {
      excellent: data.filter(p => p.rating >= 4.5).length,
      good: data.filter(p => p.rating >= 3.5 && p.rating < 4.5).length,
      average: data.filter(p => p.rating >= 2.5 && p.rating < 3.5).length,
      poor: data.filter(p => p.rating < 2.5).length
    };

    console.log('📊 [processPerformanceData] Performance stats:', {
      totalReviews,
      avgRating: avgRating.toFixed(2),
      ratingDistribution
    });
    
    const result = {
      totalReviews,
      averageRating: avgRating.toFixed(2),
      ratingDistribution
    };

    console.log('✅ [processPerformanceData] Final result:', result);
    return result;
  } catch (error) {
    console.error('💥 [processPerformanceData] Error processing performance data:', {
      error: error.message,
      dataLength: data?.length
    });
    return { totalReviews: data.length };
  }
};

const processDepartmentData = (departments, attendanceData) => {
  console.log('🔄 [processDepartmentData] Processing department data:', {
    departmentCount: departments?.length,
    attendanceCount: attendanceData?.length
  });
  
  try {
    const result = departments.map(dept => {
      const deptAttendance = attendanceData.filter(a => a.employee.departmentId === dept.id);
      const deptResult = {
        departmentName: dept.name,
        employeeCount: dept.employees.length,
        attendanceRecords: deptAttendance.length
      };
      console.log('📊 [processDepartmentData] Department processed:', deptResult);
      return deptResult;
    });

    console.log('✅ [processDepartmentData] All departments processed');
    return result;
  } catch (error) {
    console.error('💥 [processDepartmentData] Error processing department data:', {
      error: error.message,
      departmentCount: departments?.length
    });
    return [];
  }
};




// Enhanced PDF creation with debugging
const createPDFReport = async (reportId, data, reportInfo) => {
  console.log('📄 [createPDFReport] Starting PDF creation for report:', reportId);
  console.log('📊 [createPDFReport] Report data overview:', {
    type: data.type,
    period: data.period,
    totalRecords: data.totalRecords,
    hasDetails: !!data.details,
    detailsCount: data.details?.length
  });

  const reportsDir = path.join(__dirname, '../../reports');
  console.log('📁 [createPDFReport] Reports directory:', reportsDir);
  
  if (!fs.existsSync(reportsDir)) {
    console.log('📁 [createPDFReport] Creating reports directory');
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const fileName = `report_${reportId}_${Date.now()}.pdf`;
  const filePath = path.join(reportsDir, fileName);
  console.log('📄 [createPDFReport] PDF file path:', filePath);

  return new Promise((resolve, reject) => {
    console.log('🔄 [createPDFReport] Creating PDF document and stream');
    // ✅ FIX: Enable buffered pages for footers on all pages
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    const stream = fs.createWriteStream(filePath);
    
    // Enhanced error handling for stream
    stream.on('error', (error) => {
      console.error('💥 [createPDFReport] PDF stream error:', {
        error: error.message,
        filePath,
        reportId
      });
      reject(error);
    });
    
    doc.on('error', (error) => {
      console.error('💥 [createPDFReport] PDF document error:', {
        error: error.message,
        reportId
      });
      reject(error);
    });

    doc.pipe(stream);

    try {
      console.log('🎨 [createPDFReport] Starting PDF content creation');
      
      // Company Header
      console.log('📋 [createPDFReport] Adding company header');
      doc.rect(50, 50, 495, 80).fill('#2563eb');
      doc.fontSize(28).fillColor('white').text('HR MANAGEMENT SYSTEM', 70, 70);
      doc.fontSize(16).fillColor('#bfdbfe').text('Comprehensive Analytics Report', 70, 105);
      
      // Report Title
      console.log('📋 [createPDFReport] Adding report title:', reportInfo.title);
      doc.fontSize(22).fillColor('#1f2937').text(reportInfo.title, 50, 160, { align: 'center' });
      
      // Report Metadata Box
      console.log('📋 [createPDFReport] Adding metadata box');
      const metaY = 200;
      doc.rect(50, metaY, 495, 80).fill('#f8fafc').stroke('#e2e8f0');
      doc.fontSize(11).fillColor('#64748b');
      doc.text(`Generated: ${new Date().toLocaleString()}`, 70, metaY + 15);
      doc.text(`Report Period: ${data.period}`, 70, metaY + 30);
      doc.text(`Report Type: ${data.type}`, 70, metaY + 45);
      doc.text(`Total Records: ${data.totalRecords || 'N/A'}`, 300, metaY + 15);
      doc.text(`Status: Completed`, 300, metaY + 30);
      doc.text(`Generated By: Admin`, 300, metaY + 45);

      let currentY = metaY + 120;

      // Executive Summary Section
      console.log('📋 [createPDFReport] Adding executive summary');
      doc.fontSize(18).fillColor('#1f2937').text('EXECUTIVE SUMMARY', 50, currentY);
      currentY += 30;
      
      if (data.summary) {
        const summaryBoxHeight = Math.max(Object.keys(data.summary).length * 20 + 60, 120);
        doc.rect(50, currentY, 495, summaryBoxHeight).fill('#fefefe').stroke('#e5e7eb');
        
        let summaryY = currentY + 20;
        Object.entries(data.summary).forEach(([key, value]) => {
          if (summaryY > currentY + summaryBoxHeight - 30) return; // Prevent overflow
          
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          doc.fontSize(11).fillColor('#1f2937').text(`${formattedKey}:`, 70, summaryY);
          doc.fontSize(11).fillColor('#2563eb').text(`${value}`, 300, summaryY);
          summaryY += 20;
        });
        
        currentY += summaryBoxHeight + 20;
      }

      // Key Metrics Cards
      if (data.summary && currentY < 600) {
        console.log('📋 [createPDFReport] Adding key performance indicators');
        doc.fontSize(18).fillColor('#1f2937').text('KEY PERFORMANCE INDICATORS', 50, currentY);
        currentY += 40;
        
        const cardWidth = 120;
        const cardHeight = 80;
        const cardSpacing = 10;
        let cardX = 50;
        let cardsAdded = 0;
        
        // Attendance card
        if (data.type === 'Attendance Summary' && data.summary.attendanceRate && cardsAdded < 4) {
          doc.rect(cardX, currentY, cardWidth, cardHeight).fill('#dcfce7').stroke('#16a34a');
          doc.fontSize(9).fillColor('#16a34a').text('ATTENDANCE RATE', cardX + 10, currentY + 10);
          doc.fontSize(18).fillColor('#166534').text(data.summary.attendanceRate, cardX + 10, currentY + 30);
          doc.fontSize(7).fillColor('#15803d').text(`${data.summary.presentCount || 0} present`, cardX + 10, currentY + 55);
          doc.fontSize(7).fillColor('#15803d').text(`of ${data.summary.totalRecords || 0}`, cardX + 10, currentY + 65);
          cardX += cardWidth + cardSpacing;
          cardsAdded++;
        }
        
        // Working hours card
        if (data.summary.totalWorkingHours && cardsAdded < 4) {
          doc.rect(cardX, currentY, cardWidth, cardHeight).fill('#dbeafe').stroke('#2563eb');
          doc.fontSize(9).fillColor('#2563eb').text('TOTAL HOURS', cardX + 10, currentY + 10);
          doc.fontSize(14).fillColor('#1d4ed8').text(`${data.summary.totalWorkingHours}h`, cardX + 10, currentY + 30);
          doc.fontSize(7).fillColor('#1e40af').text(`Avg: ${data.summary.averageHoursPerDay || 0}h/day`, cardX + 10, currentY + 55);
          cardX += cardWidth + cardSpacing;
          cardsAdded++;
        }
        
        // Payroll card
        if (data.summary.totalNetSalary && cardsAdded < 4) {
          doc.rect(cardX, currentY, cardWidth, cardHeight).fill('#fef3c7').stroke('#d97706');
          doc.fontSize(9).fillColor('#d97706').text('TOTAL PAYROLL', cardX + 10, currentY + 10);
          doc.fontSize(12).fillColor('#b45309').text(`${data.summary.totalNetSalary}`, cardX + 10, currentY + 30);
          doc.fontSize(7).fillColor('#a16207').text(`Avg: ${data.summary.averageSalary || 0}`, cardX + 10, currentY + 55);
          cardX += cardWidth + cardSpacing;
          cardsAdded++;
        }
        
        // Rating card
        if (data.summary.averageRating && cardsAdded < 4) {
          doc.rect(cardX, currentY, cardWidth, cardHeight).fill('#fce7f3').stroke('#db2777');
          doc.fontSize(9).fillColor('#db2777').text('AVG RATING', cardX + 10, currentY + 10);
          doc.fontSize(18).fillColor('#be185d').text(data.summary.averageRating, cardX + 10, currentY + 30);
          doc.fontSize(7).fillColor('#a21caf').text(`${data.summary.totalReviews || 0} reviews`, cardX + 10, currentY + 55);
          cardsAdded++;
        }
        
        if (cardsAdded > 0) {
          currentY += cardHeight + 30;
        }
      }

      // Add more detailed sections
      if (currentY > 600) {
        console.log('📄 [createPDFReport] Adding new page');
        doc.addPage();
        currentY = 50;
      }

      // Detailed Breakdown
      if (data.details && data.details.length > 0) {
        console.log('📋 [createPDFReport] Adding detailed breakdown table');
        doc.fontSize(18).fillColor('#1f2937').text('DETAILED BREAKDOWN', 50, currentY);
        currentY += 30;
        
        const tableHeaders = getTableHeaders(data.type);
        const rowHeight = 25;
        const headerHeight = 30;
        
        // Table header
        doc.rect(50, currentY, 495, headerHeight).fill('#f1f5f9').stroke('#cbd5e1');
        tableHeaders.forEach((header, index) => {
          const x = 60 + (index * 80);
          doc.fontSize(8).fillColor('#1e293b').text(header, x, currentY + 10, { width: 75 });
        });
        currentY += headerHeight;
        
        // Table rows
        data.details.slice(0, 20).forEach((item, index) => {
          if (currentY > 720) {
            console.log('📄 [createPDFReport] Adding new page for table continuation');
            doc.addPage();
            currentY = 50;
            // Repeat header
            doc.rect(50, currentY, 495, headerHeight).fill('#f1f5f9').stroke('#cbd5e1');
            tableHeaders.forEach((header, i) => {
              const x = 60 + (i * 80);
              doc.fontSize(8).fillColor('#1e293b').text(header, x, currentY + 10, { width: 75 });
            });
            currentY += headerHeight;
          }
          
          const fillColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
          doc.rect(50, currentY, 495, rowHeight).fill(fillColor).stroke('#e2e8f0');
          
          const rowData = getTableRowData(item, data.type, index + 1);
          rowData.forEach((cellData, cellIndex) => {
            const x = 60 + (cellIndex * 80);
            doc.fontSize(7).fillColor('#475569').text(cellData, x, currentY + 8, { width: 75 });
          });
          
          currentY += rowHeight;
        });
        
        if (data.details.length > 20) {
          currentY += 10;
          doc.fontSize(10).fillColor('#6b7280').text(
            `Showing first 20 records out of ${data.details.length} total records`, 
            50, currentY, { align: 'center' }
          );
          currentY += 20;
        }
      }

      // Department breakdown
      if (data.departmentPayrollBreakdown && data.departmentPayrollBreakdown.length > 0) {
        if (currentY > 600) {
          console.log('📄 [createPDFReport] Adding new page for department breakdown');
          doc.addPage();
          currentY = 50;
        }
        
        console.log('📋 [createPDFReport] Adding department breakdown');
        doc.fontSize(18).fillColor('#1f2937').text('DEPARTMENT BREAKDOWN', 50, currentY);
        currentY += 30;
        
        data.departmentPayrollBreakdown.forEach((dept) => {
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }
          
          doc.rect(50, currentY, 495, 40).fill('#f8fafc').stroke('#e2e8f0');
          doc.fontSize(12).fillColor('#1f2937').text(dept.department, 70, currentY + 10);
          doc.fontSize(10).fillColor('#64748b').text(`Employees: ${dept.employeeCount}`, 70, currentY + 25);
          doc.fontSize(10).fillColor('#2563eb').text(`Total: ${dept.totalPayout}`, 300, currentY + 10);
          doc.fontSize(10).fillColor('#64748b').text(`Average: ${dept.averageSalary}`, 300, currentY + 25);
          
          currentY += 50;
        });
      }

      // ✅ Footer on all pages
      console.log('📋 [createPDFReport] Adding footers to all pages');
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.moveTo(50, doc.page.height - 40).lineTo(545, doc.page.height - 40).stroke('#e5e7eb');
        
        doc.fontSize(8).fillColor('#9ca3af');
        doc.text('HR Management System - Confidential', 50, doc.page.height - 30);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 200, doc.page.height - 30);
        doc.text(`Page ${i + 1} of ${pages.count}`, 450, doc.page.height - 30);
      }

      console.log('✅ [createPDFReport] PDF content creation completed, finalizing document');
      doc.end();

    } catch (pdfError) {
      console.error('💥 [createPDFReport] Error creating PDF content:', {
        error: pdfError.message,
        stack: pdfError.stack,
        reportId
      });
      reject(pdfError);
    }

    stream.on('finish', () => {
      console.log('🎉 [createPDFReport] PDF file created successfully:', {
        filePath,
        reportId,
        fileSize: fs.statSync(filePath).size
      });
      resolve(filePath);
    });
  });
};

// Helper functions for enhanced table formatting
const getTableHeaders = (reportType) => {
  console.log('📋 [getTableHeaders] Getting headers for report type:', reportType);
  
  let headers;
  switch (reportType) {
    case 'Attendance Summary':
      headers = ['#', 'Employee', 'Date', 'Status', 'Hours', 'Overtime'];
      break;
    case 'Payroll Summary':
      headers = ['#', 'Employee', 'Base Salary', 'Allowances', 'Deductions', 'Net Pay'];
      break;
    case 'Leave Summary':
      headers = ['#', 'Employee', 'Leave Type', 'Start Date', 'End Date', 'Status'];
      break;
    case 'Performance Review Summary':
      headers = ['#', 'Employee', 'Rating', 'Review Date', 'Period', 'Goals'];
      break;
    default:
      headers = ['#', 'Item', 'Details', 'Status', 'Date', 'Value'];
  }
  
  console.log('📊 [getTableHeaders] Headers selected:', headers);
  return headers;
};

const getTableRowData = (item, reportType, index) => {
  console.log('📊 [getTableRowData] Getting row data for type:', reportType, 'index:', index);
  
  let rowData;
  try {
    switch (reportType) {
      case 'Attendance Summary':
        rowData = [
          index.toString(),
          item.employee?.name?.substring(0, 12) || 'N/A',
          new Date(item.date).toLocaleDateString(),
          item.status,
          (item.totalHours || 0).toString(),
          (item.overtime || 0).toString()
        ];
        break;
      case 'Payroll Summary':
        const netPay = (item.baseSalary || 0) + (item.allowances || 0) - (item.deductions || 0);
        rowData = [
          index.toString(),
          item.employee?.name?.substring(0, 12) || 'N/A',
          `${item.baseSalary || 0}`,
          `${item.allowances || 0}`,
          `${item.deductions || 0}`,
          `${netPay.toFixed(2)}`
        ];
        break;
      case 'Leave Summary':
        rowData = [
          index.toString(),
          item.employee?.name?.substring(0, 12) || 'N/A',
          item.leaveType?.substring(0, 8) || 'N/A',
          new Date(item.startDate).toLocaleDateString(),
          new Date(item.endDate).toLocaleDateString(),
          item.status
        ];
        break;
      case 'Performance Review Summary':
        rowData = [
          index.toString(),
          item.employee?.name?.substring(0, 12) || 'N/A',
          item.rating?.toString() || '0',
          new Date(item.reviewDate).toLocaleDateString(),
          item.reviewPeriod?.substring(0, 8) || 'N/A',
          item.goals?.substring(0, 10) || 'N/A'
        ];
        break;
      default:
        rowData = [index.toString(), 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'];
    }
    
    console.log('✅ [getTableRowData] Row data created:', rowData);
    return rowData;
  } catch (error) {
    console.error('💥 [getTableRowData] Error creating row data:', {
      error: error.message,
      reportType,
      index,
      item: item?.id || 'unknown'
    });
    return [index.toString(), 'Error', 'Error', 'Error', 'Error', 'Error'];
  }
};

// Download and delete functions with enhanced debugging
export const downloadReport = async (req, res) => {
  console.log('⬇️ [downloadReport] Download request received');
  console.log('📋 [downloadReport] Request params:', req.params);
  console.log('📋 [downloadReport] Request headers:', req.headers);
  
  try {
    const { id } = req.params;
    console.log('🔍 [downloadReport] Looking for report ID:', id);
    
    const report = await prisma.reporting.findUnique({
      where: { id: parseInt(id) }
    });

    if (!report) {
      console.error('❌ [downloadReport] Report not found for ID:', id);
      return res.status(404).json({ error: 'Report not found' });
    }

    console.log('✅ [downloadReport] Report found:', {
      id: report.id,
      title: report.title,
      status: report.status,
      filePath: report.filePath,
      fileSize: report.fileSize
    });

    if (report.status !== 'COMPLETED' || !report.filePath) {
      console.error('❌ [downloadReport] Report not ready:', {
        status: report.status,
        hasFilePath: !!report.filePath
      });
      return res.status(400).json({ error: 'Report not ready for download' });
    }

    console.log('🔍 [downloadReport] Checking file existence:', report.filePath);
    if (!fs.existsSync(report.filePath)) {
      console.error('❌ [downloadReport] Report file not found on disk:', report.filePath);
      return res.status(404).json({ error: 'Report file not found' });
    }

    const fileStats = fs.statSync(report.filePath);
    console.log('📊 [downloadReport] File stats:', {
      size: fileStats.size,
      created: fileStats.birthtime,
      modified: fileStats.mtime
    });

    console.log('📤 [downloadReport] Setting response headers');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title}.pdf"`);
    
    console.log('📊 [downloadReport] Starting file stream');
    const fileStream = fs.createReadStream(report.filePath);
    
    fileStream.on('error', (streamError) => {
      console.error('💥 [downloadReport] File stream error:', {
        error: streamError.message,
        filePath: report.filePath
      });
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file' });
      }
    });
    
    fileStream.on('end', () => {
      console.log('✅ [downloadReport] File stream completed successfully');
    });
    
    fileStream.pipe(res);

  } catch (error) {
    console.error('💥 [downloadReport] Critical error:', {
      error: error.message,
      stack: error.stack,
      params: req.params
    });
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download report' });
    }
  }
};

export const deleteReport = async (req, res) => {
  console.log('🗑️ [deleteReport] Delete request received');
  console.log('📋 [deleteReport] Request params:', req.params);
  
  try {
    const { id } = req.params;
    console.log('🔍 [deleteReport] Looking for report ID:', id);

    const report = await prisma.reporting.findUnique({
      where: { id: parseInt(id) }
    });

    if (!report) {
      console.error('❌ [deleteReport] Report not found for ID:', id);
      return res.status(404).json({ error: 'Report not found' });
    }

    console.log('✅ [deleteReport] Report found:', {
      id: report.id,
      title: report.title,
      status: report.status,
      filePath: report.filePath
    });

    // Delete the file if it exists
    if (report.filePath && fs.existsSync(report.filePath)) {
      try {
        console.log('🗑️ [deleteReport] Deleting file:', report.filePath);
        fs.unlinkSync(report.filePath);
        console.log('✅ [deleteReport] File deleted successfully:', report.filePath);
      } catch (fileError) {
        console.error('⚠️ [deleteReport] Error deleting file (continuing with DB deletion):', {
          error: fileError.message,
          filePath: report.filePath
        });
      }
    } else {
      console.log('⚠️ [deleteReport] No file to delete or file does not exist');
    }

    // Delete from database
    console.log('🗑️ [deleteReport] Deleting from database');
    await prisma.reporting.delete({
      where: { id: parseInt(id) }
    });

    console.log('✅ [deleteReport] Report deleted successfully from database');
    res.json({ message: 'Report deleted successfully' });

  } catch (error) {
    console.error('💥 [deleteReport] Critical error:', {
      error: error.message,
      stack: error.stack,
      params: req.params
    });
    res.status(500).json({ error: 'Failed to delete report' });
  }
};
