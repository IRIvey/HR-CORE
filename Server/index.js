import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import adminRoutes from './src/routes/adminRoutes.js';
import employeeRoutes from './src/routes/employeeRoutes.js';
import goalRoutes from './src/routes/goalRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import salaryRoutes from './src/routes/salaryRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import reportingRoutes from './src/routes/reportingRoutes.js';

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(session({
  secret: 'yourSuperSecretKey',
  resave: false,
  saveUninitialized: false,
  
  cookie: {
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use('/api/admin', adminRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employee-goals', goalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/auth', express.json(), authRoutes);
app.use('/api/reports', reportingRoutes); 

// Enhanced seed function for reports with more comprehensive data
async function seedReports(adminId) {
  const reports = [
    {
      id: 'att-001',
      name: 'Monthly Attendance Summary',
      type: 'attendance',
      date: new Date('2025-07-13'),
      status: 'completed',
      size: '2.3 MB',
      downloads: 45,
      generatedDate: new Date(),
      content: JSON.stringify({
        reportPeriod: 'July 2025',
        totalEmployees: 7,
        overallAttendanceRate: '92.5%',
        departmentBreakdown: [
          { department: 'Design', employees: 5, attendanceRate: '94.2%', avgHours: '7.8', lateArrivals: 3 },
          { department: 'Engineering', employees: 2, attendanceRate: '89.1%', avgHours: '8.2', lateArrivals: 1 }
        ],
        individualStats: [
          { name: 'Sanjana Afreen', daysPresent: 22, daysAbsent: 2, punctualityScore: '95%', overtimeHours: 12 },
          { name: 'Israt Risha Ivey', daysPresent: 20, daysAbsent: 4, punctualityScore: '88%', overtimeHours: 18 },
          { name: 'Zannatul Adon', daysPresent: 23, daysAbsent: 1, punctualityScore: '97%', overtimeHours: 8 },
          { name: 'Nishat Tasnim', daysPresent: 21, daysAbsent: 3, punctualityScore: '92%', overtimeHours: 15 },
          { name: 'Ayesha Binte Anis', daysPresent: 19, daysAbsent: 5, punctualityScore: '85%', overtimeHours: 10 },
          { name: 'Adrita Ahsan', daysPresent: 20, daysAbsent: 4, punctualityScore: '90%', overtimeHours: 12 },
          { name: 'Labiba Karim', daysPresent: 22, daysAbsent: 2, punctualityScore: '94%', overtimeHours: 14 }
        ],
        trends: {
          compared_to_last_month: '+2.3%',
          peak_attendance_day: 'Tuesday',
          lowest_attendance_day: 'Monday'
        },
        exceptions: [
          { type: 'No Show', count: 2, employees: ['Nishat Tasnim'] },
          { type: 'Late Arrival >30min', count: 5, employees: ['Ayesha Binte Anis', 'Adrita Ahsan'] }
        ]
      }),
      adminId
    },
    {
      id: 'leave-002',
      name: 'Annual Leave Balance Report',
      type: 'leave',
      date: new Date('2025-07-12'),
      status: 'completed',
      size: '1.2 MB',
      downloads: 30,
      generatedDate: new Date(),
      content: JSON.stringify({
        reportYear: 2025,
        totalEmployees: 7,
        leaveTypes: ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave'],
        employeeBalances: [
          { 
            name: 'Sanjana Afreen', 
            annualLeave: { allocated: 25, used: 8, remaining: 17, expiring: 0 },
            sickLeave: { allocated: 10, used: 3, remaining: 7 },
            personalLeave: { allocated: 5, used: 1, remaining: 4 }
          },
          { 
            name: 'Israt Risha Ivey', 
            annualLeave: { allocated: 25, used: 12, remaining: 13, expiring: 2 },
            sickLeave: { allocated: 10, used: 1, remaining: 9 },
            personalLeave: { allocated: 5, used: 2, remaining: 3 }
          },
          { 
            name: 'Zannatul Adon', 
            annualLeave: { allocated: 25, used: 6, remaining: 19, expiring: 0 },
            sickLeave: { allocated: 10, used: 2, remaining: 8 },
            personalLeave: { allocated: 5, used: 0, remaining: 5 }
          },
          { 
            name: 'Nishat Tasnim', 
            annualLeave: { allocated: 25, used: 15, remaining: 10, expiring: 1 },
            sickLeave: { allocated: 10, used: 4, remaining: 6 },
            personalLeave: { allocated: 5, used: 3, remaining: 2 }
          },
          { 
            name: 'Ayesha Binte Anis', 
            annualLeave: { allocated: 25, used: 10, remaining: 15, expiring: 3 },
            sickLeave: { allocated: 10, used: 2, remaining: 8 },
            personalLeave: { allocated: 5, used: 1, remaining: 4 }
          },
          { 
            name: 'Adrita Ahsan', 
            annualLeave: { allocated: 25, used: 9, remaining: 16, expiring: 2 },
            sickLeave: { allocated: 10, used: 1, remaining: 9 },
            personalLeave: { allocated: 5, used: 2, remaining: 3 }
          },
          { 
            name: 'Labiba Karim', 
            annualLeave: { allocated: 25, used: 7, remaining: 18, expiring: 0 },
            sickLeave: { allocated: 10, used: 0, remaining: 10 },
            personalLeave: { allocated: 5, used: 1, remaining: 4 }
          }
        ],
        departmentSummary: [
          { department: 'Design', totalDaysUsed: 67, avgUtilization: '70%', highestUser: 'Nishat Tasnim' },
          { department: 'Engineering', totalDaysUsed: 15, avgUtilization: '60%', highestUser: 'Israt Risha Ivey' }
        ],
        upcomingExpirations: [
          { employee: 'Ayesha Binte Anis', daysExpiring: 3, expirationDate: '2025-12-31' },
          { employee: 'Israt Risha Ivey', daysExpiring: 2, expirationDate: '2025-12-31' },
          { employee: 'Adrita Ahsan', daysExpiring: 2, expirationDate: '2025-12-31' },
          { employee: 'Nishat Tasnim', daysExpiring: 1, expirationDate: '2025-12-31' }
        ],
        usage_patterns: {
          peak_month: 'December',
          lowest_month: 'February',
          avg_days_per_request: 3.2
        }
      }),
      adminId
    },
    {
      id: 'pay-003',
      name: 'Q2 Payroll Summary',
      type: 'payroll',
      date: new Date('2025-07-10'),
      status: 'processing',
      size: '3.5 MB',
      downloads: 20,
      generatedDate: new Date(),
      content: JSON.stringify({
        quarter: 'Q2 2025',
        reportPeriod: 'April - June 2025',
        totalPayrollCost: 1248750,
        totalEmployees: 7,
        payrollBreakdown: {
          baseSalaries: 1050000,
          overtime: 87500,
          bonuses: 75000,
          allowances: 63000,
          totalDeductions: 126750
        },
        departmentCosts: [
          { department: 'Design', employees: 5, totalCost: 780000, avgSalary: 52000, overtimeCost: 45000 },
          { department: 'Engineering', employees: 2, totalCost: 468750, avgSalary: 78125, overtimeCost: 42500 }
        ],
        employeePayroll: [
          { 
            name: 'Sanjana Afreen', 
            baseSalary: 50000, 
            overtime: 7500, 
            allowances: 3000, 
            grossPay: 60500, 
            deductions: 12100, 
            netPay: 48400 
          },
          { 
            name: 'Israt Risha Ivey', 
            baseSalary: 52000, 
            overtime: 9750, 
            allowances: 3000, 
            grossPay: 64750, 
            deductions: 12950, 
            netPay: 51800 
          },
          { 
            name: 'Zannatul Adon', 
            baseSalary: 54000, 
            overtime: 8250, 
            allowances: 3000, 
            grossPay: 65250, 
            deductions: 13050, 
            netPay: 52200 
          },
          { 
            name: 'Nishat Tasnim', 
            baseSalary: 56000, 
            overtime: 9000, 
            allowances: 3000, 
            grossPay: 68000, 
            deductions: 13600, 
            netPay: 54400 
          },
          { 
            name: 'Ayesha Binte Anis', 
            baseSalary: 58000, 
            overtime: 8750, 
            allowances: 3000, 
            grossPay: 69750, 
            deductions: 13950, 
            netPay: 55800 
          },
          { 
            name: 'Adrita Ahsan', 
            baseSalary: 60000, 
            overtime: 9500, 
            allowances: 3000, 
            grossPay: 72500, 
            deductions: 14500, 
            netPay: 58000 
          },
          { 
            name: 'Labiba Karim', 
            baseSalary: 62000, 
            overtime: 10250, 
            allowances: 3000, 
            grossPay: 75250, 
            deductions: 15050, 
            netPay: 60200 
          }
        ],
        taxAndCompliance: {
          totalTaxWithheld: 187312,
          socialSecurityContrib: 77343,
          unemploymentTax: 12488,
          workersComp: 6244
        },
        yearOverYear: {
          compared_to_q2_2024: '+8.5%',
          cost_per_employee_change: '+3.2%'
        }
      }),
      adminId
    },
    {
      id: 'access-004',
      name: 'Access Logs & Security Report',
      type: 'access',
      date: new Date('2025-07-09'),
      status: 'completed',
      size: '2.0 MB',
      downloads: 15,
      generatedDate: new Date(),
      content: JSON.stringify({
        reportPeriod: 'June 2025',
        totalLoginAttempts: 2847,
        successfulLogins: 2679,
        failedAttempts: 168,
        uniqueUsers: 7,
        securityMetrics: {
          suspiciousActivities: 3,
          accountLockouts: 2,
          passwordResets: 5,
          afterHoursAccess: 12
        },
        userActivity: [
          { 
            user: 'sanjana.afreen@hrcore.com', 
            totalLogins: 423, 
            failedAttempts: 2, 
            lastLogin: '2025-07-09 16:45:23',
            avgSessionDuration: '4.2 hours',
            uniqueIPs: 2
          },
          { 
            user: 'israt.risha.ivey@hrcore.com', 
            totalLogins: 387, 
            failedAttempts: 5, 
            lastLogin: '2025-07-09 17:12:15',
            avgSessionDuration: '5.1 hours',
            uniqueIPs: 1
          },
          { 
            user: 'zannatul.adon@hrcore.com', 
            totalLogins: 356, 
            failedAttempts: 1, 
            lastLogin: '2025-07-09 15:30:45',
            avgSessionDuration: '4.8 hours',
            uniqueIPs: 1
          },
          { 
            user: 'nishat.tasnim@hrcore.com', 
            totalLogins: 298, 
            failedAttempts: 8, 
            lastLogin: '2025-07-09 14:22:11',
            avgSessionDuration: '3.9 hours',
            uniqueIPs: 3
          },
          { 
            user: 'ayesha.binte.anis@hrcore.com', 
            totalLogins: 312, 
            failedAttempts: 12, 
            lastLogin: '2025-07-09 16:08:33',
            avgSessionDuration: '4.1 hours',
            uniqueIPs: 2
          },
          { 
            user: 'adrita.ahsan@hrcore.com', 
            totalLogins: 278, 
            failedAttempts: 6, 
            lastLogin: '2025-07-09 13:45:22',
            avgSessionDuration: '3.7 hours',
            uniqueIPs: 1
          },
          { 
            user: 'labiba.karim@hrcore.com', 
            totalLogins: 334, 
            failedAttempts: 3, 
            lastLogin: '2025-07-09 17:55:17',
            avgSessionDuration: '4.5 hours',
            uniqueIPs: 1
          }
        ],
        systemAccess: [
          { module: 'Employee Dashboard', accessCount: 1247, uniqueUsers: 7 },
          { module: 'Payroll System', accessCount: 89, uniqueUsers: 2 },
          { module: 'Admin Panel', accessCount: 156, uniqueUsers: 1 },
          { module: 'Leave Management', accessCount: 445, uniqueUsers: 7 },
          { module: 'Performance Reviews', accessCount: 234, uniqueUsers: 7 }
        ],
        securityIncidents: [
          { 
            type: 'Multiple Failed Login Attempts', 
            user: 'ayesha.binte.anis@hrcore.com', 
            timestamp: '2025-07-08 14:23:11',
            action: 'Account temporarily locked'
          },
          { 
            type: 'Unusual Access Pattern', 
            user: 'adrita.ahsan@hrcore.com', 
            timestamp: '2025-07-07 02:15:44',
            action: 'Security alert sent'
          }
        ],
        recommendations: [
          'Implement two-factor authentication',
          'Review after-hours access policies',
          'Update password complexity requirements'
        ]
      }),
      adminId
    },
    {
      id: 'perf-005',
      name: 'Performance Review Overview',
      type: 'performance',
      date: new Date('2025-07-07'),
      status: 'completed',
      size: '2.8 MB',
      downloads: 25,
      generatedDate: new Date(),
      content: JSON.stringify({
        reviewCycle: 'Mid-Year 2025',
        totalEmployees: 7,
        reviewsCompleted: 7,
        reviewsOverdue: 0,
        overallRatings: {
          excellent: 2,
          good: 4,
          satisfactory: 1,
          needsImprovement: 0
        },
        departmentPerformance: [
          { 
            department: 'Design', 
            avgRating: 4.2, 
            employees: 5, 
            topPerformer: 'Zannatul Adon',
            improvementNeeded: 0
          },
          { 
            department: 'Engineering', 
            avgRating: 4.5, 
            employees: 2, 
            topPerformer: 'Israt Risha Ivey',
            improvementNeeded: 0
          }
        ],
        individualReviews: [
          { 
            name: 'Sanjana Afreen', 
            rating: 4.3, 
            strengths: ['Leadership', 'Innovation', 'Team Collaboration'],
            improvements: ['Time Management'],
            goals: 3,
            goalsAchieved: 2,
            nextReviewDate: '2025-12-15'
          },
          { 
            name: 'Israt Risha Ivey', 
            rating: 4.6, 
            strengths: ['Technical Skills', 'Problem Solving', 'Mentoring'],
            improvements: ['Documentation'],
            goals: 4,
            goalsAchieved: 4,
            nextReviewDate: '2025-12-15'
          },
          { 
            name: 'Zannatul Adon', 
            rating: 4.7, 
            strengths: ['Creativity', 'User Experience', 'Design Thinking'],
            improvements: ['Project Management'],
            goals: 3,
            goalsAchieved: 3,
            nextReviewDate: '2025-12-15'
          },
          { 
            name: 'Nishat Tasnim', 
            rating: 4.0, 
            strengths: ['Attention to Detail', 'Quality Assurance'],
            improvements: ['Communication', 'Initiative'],
            goals: 4,
            goalsAchieved: 2,
            nextReviewDate: '2025-12-15'
          },
          { 
            name: 'Ayesha Binte Anis', 
            rating: 4.1, 
            strengths: ['Research Skills', 'User Testing'],
            improvements: ['Time Management', 'Technical Skills'],
            goals: 3,
            goalsAchieved: 2,
            nextReviewDate: '2025-12-15'
          },
          { 
            name: 'Adrita Ahsan', 
            rating: 4.2, 
            strengths: ['Visual Design', 'Brand Consistency'],
            improvements: ['Cross-team Collaboration'],
            goals: 3,
            goalsAchieved: 2,
            nextReviewDate: '2025-12-15'
          },
          { 
            name: 'Labiba Karim', 
            rating: 4.4, 
            strengths: ['Process Improvement', 'Tool Proficiency'],
            improvements: ['Leadership Skills'],
            goals: 4,
            goalsAchieved: 3,
            nextReviewDate: '2025-12-15'
          }
        ],
        companyMetrics: {
          avgPerformanceRating: 4.3,
          promotionReady: 3,
          retentionRisk: 0,
          trainingNeeds: ['Project Management', 'Leadership Development', 'Technical Skills']
        },
        goalTracking: {
          totalGoals: 24,
          goalsCompleted: 18,
          goalsInProgress: 5,
          goalsOverdue: 1
        }
      }),
      adminId
    },
    {
      id: 'comp-006',
      name: 'Compliance Audit Report',
      type: 'compliance',
      date: new Date('2025-07-06'),
      status: 'completed',
      size: '1.9 MB',
      downloads: 12,
      generatedDate: new Date(),
      content: JSON.stringify({
        auditPeriod: 'Q2 2025',
        overallComplianceScore: '94.5%',
        auditor: 'Internal HR Team',
        totalChecks: 47,
        passed: 44,
        failed: 3,
        complianceAreas: [
          {
            area: 'Labor Law Compliance',
            score: '98%',
            status: 'Compliant',
            findings: 1,
            description: 'All labor regulations properly followed'
          },
          {
            area: 'Data Protection (GDPR)',
            score: '92%',
            status: 'Minor Issues',
            findings: 2,
            description: 'Data retention policies need updates'
          },
          {
            area: 'Health & Safety',
            score: '100%',
            status: 'Compliant',
            findings: 0,
            description: 'All safety protocols properly implemented'
          },
          {
            area: 'Equal Employment Opportunity',
            score: '96%',
            status: 'Compliant',
            findings: 0,
            description: 'Fair hiring and promotion practices maintained'
          },
          {
            area: 'Financial Compliance',
            score: '89%',
            status: 'Action Required',
            findings: 3,
            description: 'Payroll tax documentation needs improvement'
          }
        ],
        violations: [
          {
            severity: 'Low',
            area: 'Documentation',
            issue: 'Missing signatures on 3 employee handbook acknowledgments',
            deadline: '2025-08-15',
            responsible: 'HR Department'
          },
          {
            severity: 'Medium',
            area: 'Data Protection',
            issue: 'Employee data retention policy outdated',
            deadline: '2025-08-01',
            responsible: 'IT & HR Departments'
          },
          {
            severity: 'High',
            area: 'Financial',
            issue: 'Quarterly tax filings missing supporting documentation',
            deadline: '2025-07-25',
            responsible: 'Finance Department'
          }
        ],
        trainingCompliance: {
          mandatoryTrainingsCompleted: '89%',
          certificationStatus: 'Current',
          upcomingRenewals: 2,
          overdueTrainings: 3
        },
        recommendations: [
          'Update data retention policies by August 1st',
          'Implement digital signature system for handbook acknowledgments',
          'Schedule quarterly compliance review meetings',
          'Enhance data protection training program',
          'Improve financial documentation processes'
        ],
        nextAuditDate: '2025-10-15'
      }),
      adminId
    },
    {
      id: 'train-007',
      name: 'Training & Development Report',
      type: 'training',
      date: new Date('2025-07-05'),
      status: 'completed',
      size: '2.1 MB',
      downloads: 18,
      generatedDate: new Date(),
      content: JSON.stringify({
        reportPeriod: 'Q2 2025',
        totalEmployees: 7,
        trainingPrograms: 12,
        completionRate: '87%',
        trainingHours: 142,
        avgHoursPerEmployee: 20.3,
        programBreakdown: [
          {
            program: 'Leadership Development',
            participants: 3,
            completionRate: '100%',
            avgScore: 92,
            duration: '16 hours'
          },
          {
            program: 'Technical Skills - UI/UX',
            participants: 5,
            completionRate: '80%',
            avgScore: 88,
            duration: '24 hours'
          },
          {
            program: 'Project Management',
            participants: 4,
            completionRate: '75%',
            avgScore: 85,
            duration: '20 hours'
          },
          {
            program: 'Data Security Awareness',
            participants: 7,
            completionRate: '100%',
            avgScore: 94,
            duration: '8 hours'
          }
        ],
        employeeProgress: [
          {
            name: 'Sanjana Afreen',
            completedHours: 28,
            programsCompleted: 4,
            avgScore: 91,
            certifications: 2
          },
          {
            name: 'Israt Risha Ivey',
            completedHours: 32,
            programsCompleted: 3,
            avgScore: 95,
            certifications: 1
          },
          {
            name: 'Zannatul Adon',
            completedHours: 24,
            programsCompleted: 3,
            avgScore: 89,
            certifications: 1
          },
          {
            name: 'Nishat Tasnim',
            completedHours: 16,
            programsCompleted: 2,
            avgScore: 82,
            certifications: 0
          },
          {
            name: 'Ayesha Binte Anis',
            completedHours: 12,
            programsCompleted: 2,
            avgScore: 86,
            certifications: 0
          },
          {
            name: 'Adrita Ahsan',
            completedHours: 18,
            programsCompleted: 2,
            avgScore: 88,
            certifications: 1
          },
          {
            name: 'Labiba Karim',
            completedHours: 12,
            programsCompleted: 1,
            avgScore: 90,
            certifications: 0
          }
        ],
        skillGaps: [
          {
            skill: 'Advanced JavaScript',
            employees: ['Nishat Tasnim', 'Ayesha Binte Anis'],
            priority: 'High',
            recommendedTraining: 'Full Stack Development Course'
          },
          {
            skill: 'Leadership',
            employees: ['Zannatul Adon', 'Labiba Karim'],
            priority: 'Medium',
            recommendedTraining: 'Leadership Essentials Program'
          }
        ],
        upcomingTraining: [
          {
            program: 'Advanced Design Systems',
            startDate: '2025-08-15',
            duration: '16 hours',
            targetParticipants: 4
          },
          {
            program: 'Agile Methodology',
            startDate: '2025-09-01',
            duration: '12 hours',
            targetParticipants: 7
          }
        ]
      }),
      adminId
    }
  ];

  // Loop through the reports to insert them into the database
  for (const report of reports) {
    await prisma.reporting.upsert({
      where: { id: report.id },
      update: {}, // No update logic needed for this case
      create: report,  // Inserting new report
    });
  }
  console.log('Reports seeded successfully!');
}
// async function main() {
//   const plainAdminPassword = 'securepassword123';
//   const hashedAdminPassword = await bcrypt.hash(plainAdminPassword, 10);

//   const designDept = await prisma.department.upsert({
//     where: { name: 'Design' },
//     update: {},
//     create: { name: 'Design' }
//   });

//   const engineeringDept = await prisma.department.upsert({
//     where: { name: 'Engineering' },
//     update: {},
//     create: { name: 'Engineering' }
//   });

//   // Admin (with ADMIN role if Admins are also employees)
//   const admin = await prisma.admin.upsert({
//     where: { email: 'admin@hrcore.com' },
//     update: { password: hashedAdminPassword },
//     create: {
//       name: 'HR Admin',
//       email: 'admin@hrcore.com',
//       password: hashedAdminPassword,
//     }
//   });

//   const existingEmployees = await prisma.employee.findMany();
//   const employeeRecords = [];

//   if (existingEmployees.length === 0) {
//     const employeesData = [
//       { name: 'Sanjana Afreen', position: 'UI UX Designer', role: 'TEAM_LEAD', gender: 'Female', departmentId: designDept.id },
//       { name: 'Israt Risha Ivey', position: 'Backend Engineer', role: 'EMPLOYEE', gender: 'Female', departmentId: engineeringDept.id },
//       { name: 'Zannatul Adon', position: 'UI UX Designer', role: 'EMPLOYEE', gender: 'Female', departmentId: designDept.id },
//       { name: 'Nishat Tasnim', position: 'UI UX Designer', role: 'EMPLOYEE', gender: 'Female', departmentId: designDept.id },
//       { name: 'Ayesha Binte Anis', position: 'UI UX Designer', role: 'EMPLOYEE', gender: 'Female', departmentId: designDept.id },
//       { name: 'Adrita Ahsan', position: 'UI UX Designer', role: 'EMPLOYEE', gender: 'Female', departmentId: designDept.id },
//       { name: 'Labiba Karim', position: 'UI UX Designer', role: 'EMPLOYEE', gender: 'Female', departmentId: designDept.id }
//     ];

//     for (let i = 0; i < employeesData.length; i++) {
//       const e = employeesData[i];
//       const employee = await prisma.employee.create({
//         data: {
//           name: e.name,
//           email: `${e.name.toLowerCase().replace(/ /g, '.')}@hrcore.com`,
//           role: e.role,  // ✅ assign role
//           salary: 50000 + i * 2000,
//           departmentId: e.departmentId,
//           position: e.position,
//           status: 'Active',
//           joinDate: new Date('2022-04-28'),
//           age: 25 + i,
//           experience: 2 + i,
//         }
//       });
//       employeeRecords.push(employee);
//     }
//   } else {
//     employeeRecords.push(...existingEmployees);
//   }


//   for (const emp of employeeRecords) {
//     const empId = emp.id;

//     if (!await prisma.goal.findFirst({ where: { employeeId: empId } })) {
//       await prisma.goal.create({
//         data: {
//           employeeId: empId,
//           name: emp.name,
//           goalTitle: `Improve ${emp.position}`,
//           description: `Achieve performance excellence in ${emp.position}`,
//           deadline: new Date('2025-12-31'),
//           progress: Math.floor(Math.random() * 80) + 10, // Random progress between 10-90%
//           status: ['In Progress', 'Completed', 'Pending'][Math.floor(Math.random() * 3)],
//         }
//       });
//     }

//     if (!await prisma.attendance.findFirst({ where: { employeeId: empId, checkInTime: new Date('2025-06-26T09:00:00') } })) {
//       await prisma.attendance.create({
//         data: {
//           employeeId: empId,
//           checkInTime: new Date('2025-06-26T09:00:00'),
//           checkOutTime: new Date('2025-06-26T17:00:00'),
//         }
//       });
//     }

//     if (!await prisma.leaveRequest.findFirst({ where: { employeeId: empId, startDate: new Date('2025-07-01') } })) {
//       await prisma.leaveRequest.create({
//         data: {
//           employeeId: empId,
//           startDate: new Date('2025-07-01'),
//           endDate: new Date('2025-07-05'),
//           status: ['Pending', 'Approved', 'Rejected'][Math.floor(Math.random() * 3)],
//           leaveType: ['Annual', 'Sick', 'Personal'][Math.floor(Math.random() * 3)],
//           reason: 'Personal time off request'
//         }
//       });
//     }

//     if (!await prisma.recruitment.findFirst({ where: { employeeId: empId, date: new Date('2025-05-01') } })) {
//       await prisma.recruitment.create({
//         data: {
//           employeeId: empId,
//           type: 'Internal',
//           date: new Date('2025-05-01'),
//           status: 'Completed'
//         }
//       });
//     }

//     if (!await prisma.salary.findFirst({ where: { employeeId: empId, payDate: new Date('2025-06-25') } })) {
//       await prisma.salary.create({
//         data: {
//           employeeId: empId,
//           baseSalary: emp.salary,
//           allowances: 3000,
//           deductions: Math.floor(emp.salary * 0.2), // 20% deductions
//           payDate: new Date('2025-06-25'),
//           overtimeHours: Math.floor(Math.random() * 20) + 5 // Random overtime 5-25 hours
//         }
//       });
//     }

//     if (!await prisma.performanceReview.findFirst({ where: { employeeId: empId, reviewDate: new Date('2025-06-20') } })) {
//       await prisma.performanceReview.create({
//         data: {
//           employeeId: empId,
//           rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Rating between 3.0-5.0
//           feedback: `Performance review for ${emp.name}. Shows consistent improvement and dedication to work.`,
//           reviewDate: new Date('2025-06-20'),
//           reviewPeriod: 'Q2 2025',
//           goals: `Continue professional development in ${emp.position}`
//         }
//       });
//     }
//   }

//   // Seed comprehensive reports
//   await seedReports(admin.id);
  
//   // Create HR System record if it doesn't exist
//   if (!await prisma.hRSystem.findFirst()) {
//     await prisma.hRSystem.create({
//       data: { 
//         status: 'Active',
//         lastUpdated: new Date(),
//         version: '2.0.0'
//       }
//     });
//   }

//   console.log('✅ All models seeded conditionally with comprehensive data!');
//   console.log(`📊 Seeded ${(await prisma.reporting.count())} reports`);
//   console.log(`👥 Seeded ${(await prisma.employee.count())} employees`);
//   console.log(`🎯 Seeded ${(await prisma.goal.count())} goals`);
//   console.log(`💰 Seeded ${(await prisma.salary.count())} salary records`);
//   console.log(`⭐ Seeded ${(await prisma.performanceReview.count())} performance reviews`);
// }
// Replace your existing main() function with this updated version:
async function main() {
  const plainAdminPassword = 'securepassword123';
  const hashedAdminPassword = await bcrypt.hash(plainAdminPassword, 10);

  // Hash passwords for team lead and employee
  const hashedTeamLeadPassword = await bcrypt.hash('team123', 10);
  const hashedEmployeePassword = await bcrypt.hash('employee123', 10);

  const designDept = await prisma.department.upsert({
    where: { name: 'Design' },
    update: {},
    create: { name: 'Design' }
  });

  const engineeringDept = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering' }
  });

  // Admin (with ADMIN role)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@hrcore.com' },
    update: { password: hashedAdminPassword },
    create: {
      name: 'HR Admin',
      email: 'admin@hrcore.com',
      password: hashedAdminPassword,
    }
  });

  // Create default Team Lead account
  const teamLead = await prisma.employee.upsert({
    where: { email: 'teamlead@hrcore.com' },
    update: { password: hashedTeamLeadPassword },
    create: {
      name: 'Team Lead User',
      email: 'teamlead@hrcore.com',
      password: hashedTeamLeadPassword,
      role: 'TEAM_LEAD',
      salary: 70000,
      departmentId: designDept.id,
      position: 'Senior UI UX Designer',
      status: 'Active',
      joinDate: new Date('2021-01-15'),
      age: 30,
      experience: 5,
    }
  });

  // Create default Employee account
  const defaultEmployee = await prisma.employee.upsert({
    where: { email: 'employee@hrcore.com' },
    update: { password: hashedEmployeePassword },
    create: {
      name: 'Employee User',
      email: 'employee@hrcore.com',
      password: hashedEmployeePassword,
      role: 'EMPLOYEE',
      salary: 45000,
      departmentId: designDept.id,
      position: 'Junior UI UX Designer',
      status: 'Active',
      joinDate: new Date('2023-06-01'),
      age: 24,
      experience: 1,
    }
  });

  const existingEmployees = await prisma.employee.findMany();
  const employeeRecords = [];

  // Update existing employees without passwords
  for (const emp of existingEmployees) {
    if (!emp.password && emp.email !== 'teamlead@hrcore.com' && emp.email !== 'employee@hrcore.com') {
      // Assign default password to existing employees
      const defaultPassword = await bcrypt.hash('default123', 10);
      await prisma.employee.update({
        where: { id: emp.id },
        data: { password: defaultPassword }
      });
    }
  }

  // Create additional employees if none exist (excluding the default accounts)
  const regularEmployees = existingEmployees.filter(emp => 
    emp.email !== 'teamlead@hrcore.com' && emp.email !== 'employee@hrcore.com'
  );

  if (regularEmployees.length === 0) {
    const employeesData = [
      { name: 'Sanjana Afreen', position: 'UI UX Designer', role: 'TEAM_LEAD', gender: 'Female', departmentId: designDept.id },
      { name: 'Israt Risha Ivey', position: 'Backend Engineer', role: 'EMPLOYEE', gender: 'Female', departmentId: engineeringDept.id },
      { name: 'Zannatul Adon', position: 'UI UX Designer', role: 'EMPLOYEE', gender: 'Female', departmentId: designDept.id },
      { name: 'Nishat Tasnim', position: 'UI UX Designer', role: 'EMPLOYEE', gender: 'Female', departmentId: designDept.id },
      { name: 'Ayesha Binte Anis', position: 'UI UX Designer', role: 'EMPLOYEE', gender: 'Female', departmentId: designDept.id },
      { name: 'Adrita Ahsan', position: 'UI UX Designer', role: 'EMPLOYEE', gender: 'Female', departmentId: designDept.id },
      { name: 'Labiba Karim', position: 'UI UX Designer', role: 'EMPLOYEE', gender: 'Female', departmentId: designDept.id }
    ];

    for (let i = 0; i < employeesData.length; i++) {
      const e = employeesData[i];
      const defaultPassword = await bcrypt.hash('default123', 10);
      const employee = await prisma.employee.create({
        data: {
          name: e.name,
          email: `${e.name.toLowerCase().replace(/ /g, '.')}@hrcore.com`,
          password: defaultPassword,
          role: e.role,
          salary: 50000 + i * 2000,
          departmentId: e.departmentId,
          position: e.position,
          status: 'Active',
          joinDate: new Date('2022-04-28'),
          age: 25 + i,
          experience: 2 + i,
        }
      });
      employeeRecords.push(employee);
    }
  } else {
    employeeRecords.push(...regularEmployees);
  }

  // Add the default accounts to employee records for goal/attendance seeding
  employeeRecords.push(teamLead, defaultEmployee);

  // Continue with your existing seeding logic for goals, attendance, etc.
  for (const emp of employeeRecords) {
    const empId = emp.id;

    if (!await prisma.goal.findFirst({ where: { employeeId: empId } })) {
      await prisma.goal.create({
        data: {
          employeeId: empId,
          name: emp.name,
          goalTitle: `Improve ${emp.position}`,
          description: `Achieve performance excellence in ${emp.position}`,
          deadline: new Date('2025-12-31'),
          progress: Math.floor(Math.random() * 80) + 10,
          status: ['In Progress', 'Completed', 'Pending'][Math.floor(Math.random() * 3)],
        }
      });
    }

    if (!await prisma.attendance.findFirst({ where: { employeeId: empId, checkInTime: new Date('2025-06-26T09:00:00') } })) {
      await prisma.attendance.create({
        data: {
          employeeId: empId,
          checkInTime: new Date('2025-06-26T09:00:00'),
          checkOutTime: new Date('2025-06-26T17:00:00'),
        }
      });
    }

    if (!await prisma.leaveRequest.findFirst({ where: { employeeId: empId, startDate: new Date('2025-07-01') } })) {
      await prisma.leaveRequest.create({
        data: {
          employeeId: empId,
          startDate: new Date('2025-07-01'),
          endDate: new Date('2025-07-05'),
          status: ['Pending', 'Approved', 'Rejected'][Math.floor(Math.random() * 3)],
          leaveType: ['Annual', 'Sick', 'Personal'][Math.floor(Math.random() * 3)],
          reason: 'Personal time off request'
        }
      });
    }

    if (!await prisma.recruitment.findFirst({ where: { employeeId: empId, date: new Date('2025-05-01') } })) {
      await prisma.recruitment.create({
        data: {
          employeeId: empId,
          type: 'Internal',
          date: new Date('2025-05-01'),
          status: 'Completed'
        }
      });
    }

    if (!await prisma.salary.findFirst({ where: { employeeId: empId, payDate: new Date('2025-06-25') } })) {
      await prisma.salary.create({
        data: {
          employeeId: empId,
          baseSalary: emp.salary,
          allowances: 3000,
          deductions: Math.floor(emp.salary * 0.2),
          payDate: new Date('2025-06-25'),
          overtimeHours: Math.floor(Math.random() * 20) + 5
        }
      });
    }

    if (!await prisma.performanceReview.findFirst({ where: { employeeId: empId, reviewDate: new Date('2025-06-20') } })) {
      await prisma.performanceReview.create({
        data: {
          employeeId: empId,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          feedback: `Performance review for ${emp.name}. Shows consistent improvement and dedication to work.`,
          reviewDate: new Date('2025-06-20'),
          reviewPeriod: 'Q2 2025',
          goals: `Continue professional development in ${emp.position}`
        }
      });
    }
  }

  // Seed comprehensive reports
  await seedReports(admin.id);
  
  // Create HR System record if it doesn't exist
  if (!await prisma.hRSystem.findFirst()) {
    await prisma.hRSystem.create({
      data: { 
        status: 'Active',
        lastUpdated: new Date(),
        version: '2.0.0'
      }
    });
  }

  console.log('✅ All models seeded conditionally with comprehensive data!');
  console.log(`📊 Seeded ${(await prisma.reporting.count())} reports`);
  console.log(`👥 Seeded ${(await prisma.employee.count())} employees`);
  console.log(`🎯 Seeded ${(await prisma.goal.count())} goals`);
  console.log(`💰 Seeded ${(await prisma.salary.count())} salary records`);
  console.log(`⭐ Seeded ${(await prisma.performanceReview.count())} performance reviews`);
  console.log('');
  console.log('🔐 Default Login Credentials:');
  console.log('Admin: admin@hrcore.com / securepassword123');
  console.log('Team Lead: teamlead@hrcore.com / team123');
  console.log('Employee: employee@hrcore.com / employee123');
  console.log('Other Employees: [name]@hrcore.com / default123');
}
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 Reports API available at http://localhost:${PORT}/api/reports`);
  console.log(`⬇️  Report download endpoint: http://localhost:${PORT}/api/reports/:id/download/:format`);
});

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
