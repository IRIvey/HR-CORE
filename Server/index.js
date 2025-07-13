import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import express from 'express';
import cors from 'cors';
import session from 'express-session';

import adminRoutes from './src/routes/adminRoutes.js';
import employeeRoutes from './src/routes/employeeRoutes.js';
import goalRoutes from './src/routes/goalRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
 import salaryRoutes from './src/routes/salaryRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'yourSuperSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true if using HTTPS
}));
app.use('/api/admin', adminRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employee-goals', goalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/auth', express.json(), authRoutes);

async function main() {

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
    update: {},
    create: {
      name: 'HR Admin',
      email: 'admin@hrcore.com',
      password: 'securepassword123'
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
      { name: 'Adib Rahman', position: 'UI UX Designer', gender: 'Male', departmentId: designDept.id },
      { name: 'Navid Ibrahim', position: 'UI UX Designer', gender: 'Male', departmentId: designDept.id },
      { name: 'Hasibul Karim', position: 'UI UX Designer', gender: 'Male', departmentId: designDept.id }
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

  // 4-9: Create related records only if not already present
  for (const emp of employeeRecords) {
    const empId = emp.id;

    const goal = await prisma.goal.findFirst({ where: { employeeId: empId } });
    if (!goal) {
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

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: empId,
        checkInTime: new Date('2025-06-26T09:00:00'),
      }
    });
    if (!attendance) {
      await prisma.attendance.create({
        data: {
          employeeId: empId,
          checkInTime: new Date('2025-06-26T09:00:00'),
          checkOutTime: new Date('2025-06-26T17:00:00'),
        }
      });
    }

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: empId,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-05'),
      }
    });
    if (!leaveRequest) {
      await prisma.leaveRequest.create({
        data: {
          employeeId: empId,
          startDate: new Date('2025-07-01'),
          endDate: new Date('2025-07-05'),
          status: 'Pending',
        }
      });
    }

    const recruitment = await prisma.recruitment.findFirst({
      where: {
        employeeId: empId,
        date: new Date('2025-05-01')
      }
    });
    if (!recruitment) {
      await prisma.recruitment.create({
        data: {
          employeeId: empId,
          type: 'Internal',
          date: new Date('2025-05-01')
        }
      });
    }

    const salary = await prisma.salary.findFirst({
      where: {
        employeeId: empId,
        payDate: new Date('2025-06-25')
      }
    });
    if (!salary) {
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

    const review = await prisma.performanceReview.findFirst({
      where: {
        employeeId: empId,
        reviewDate: new Date('2025-06-20')
      }
    });
    if (!review) {
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


  const reportExists = await prisma.reporting.findFirst({
    where: {
      adminId: admin.id,
      generatedDate: new Date('2025-06-25')
    }
  });
  if (!reportExists) {
    await prisma.reporting.create({
      data: {
        adminId: admin.id,
        type: 'Monthly Summary',
        generatedDate: new Date('2025-06-25'),
        content: 'Overall performance and attendance report for June 2025.'
      }
    });
  }

  const hrExists = await prisma.hRSystem.findFirst();
  if (!hrExists) {
    await prisma.hRSystem.create({
      data: {
        status: 'Active'
      }
    });
  }

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
