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
      content: 'Summary of employee attendance for the month.',
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
      content: 'Leave balances for all employees as of current year.',
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
      content: 'Quarter 2 payroll overview including bonuses and deductions.',
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
      content: 'Employee access logs and system security overview.',
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
      content: 'Review of performance evaluations across departments.',
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
      content: 'Internal compliance audit findings and analysis.',
      adminId
    }
  ];

 
  for (const report of reports) {
    await prisma.reporting.upsert({
      where: { id: report.id },
      update: {}, 
      create: report,  // Inserting new report
    });
  }
  console.log('Reports seeded successfully!');
}

async function main() {
  const plainAdminPassword = 'securepassword123';
  const hashedAdminPassword = await bcrypt.hash(plainAdminPassword, 10);

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

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@hrcore.com' },
    update: { password: hashedAdminPassword },
    create: {
      name: 'HR Admin',
      email: 'admin@hrcore.com',
      password: hashedAdminPassword,
    }
  });

  const existingEmployees = await prisma.employee.findMany();
  const employeeRecords = [];

  if (existingEmployees.length === 0) {
    const employeesData = [
      { name: 'Sanjana Afreen', position: 'UI UX Designer', gender: 'Female', departmentId: designDept.id },
      { name: 'Israt Risha Ivey', position: 'Backend Engineer', gender: 'Female', departmentId: engineeringDept.id },
      { name: 'Zannatul Adon', position: 'UI UX Designer', gender: 'Female', departmentId: designDept.id },
      { name: 'Nishat Tasnim', position: 'UI UX Designer', gender: 'Female', departmentId: designDept.id },
      { name: 'Ayesha Binte Anis', position: 'UI UX Designer', gender: 'Male', departmentId: designDept.id },
      { name: 'Adrita Ahsan', position: 'UI UX Designer', gender: 'Male', departmentId: designDept.id },
      { name: 'Labiba Karim', position: 'UI UX Designer', gender: 'Male', departmentId: designDept.id }
    ];

    for (let i = 0; i < employeesData.length; i++) {
      const e = employeesData[i];
      const employee = await prisma.employee.create({
        data: {
          name: e.name,
          email: `${e.name.toLowerCase().replace(/ /g, '.')}@hrcore.com`,
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
    employeeRecords.push(...existingEmployees);
  }

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
          progress: 25,
          status: 'In Progress',
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
          status: 'Pending',
        }
      });
    }

    if (!await prisma.recruitment.findFirst({ where: { employeeId: empId, date: new Date('2025-05-01') } })) {
      await prisma.recruitment.create({
        data: {
          employeeId: empId,
          type: 'Internal',
          date: new Date('2025-05-01')
        }
      });
    }

    if (!await prisma.salary.findFirst({ where: { employeeId: empId, payDate: new Date('2025-06-25') } })) {
      await prisma.salary.create({
        data: {
          employeeId: empId,
          baseSalary: emp.salary,
          allowances: 3000,
          deductions: 1000,
          payDate: new Date('2025-06-25'),
          overtimeHours: 5
        }
      });
    }

    if (!await prisma.performanceReview.findFirst({ where: { employeeId: empId, reviewDate: new Date('2025-06-20') } })) {
      await prisma.performanceReview.create({
        data: {
          employeeId: empId,
          rating: 4.2,
          feedback: 'Great team contributor with consistent results.',
          reviewDate: new Date('2025-06-20')
        }
      });
    }
  }

  if (!await prisma.reporting.findFirst({ where: { adminId: admin.id, generatedDate: new Date('2025-06-25') } })) {
    await prisma.reporting.create({
      data: {
        adminId: admin.id,
        type: 'Monthly Summary',
        generatedDate: new Date('2025-06-25'),
        content: 'Overall performance and attendance report for June 2025.'
      }
    });
  }

  if (!await prisma.hRSystem.findFirst()) {
    await prisma.hRSystem.create({
      data: { status: 'Active' }
    });
  }

  await seedReports(admin.id);
  console.log('✅ All models seeded conditionally!');
}

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
