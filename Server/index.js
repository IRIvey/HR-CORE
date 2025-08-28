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
import attendanceRoutes from './src/routes/attendanceRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js'; // 👈 import this

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
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationRoutes); // 👈 mount notifications here

// Add this line in your index.js with your other route imports
app.use('/api/departments', express.Router().get('/', async (req, res) => {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true, _count: { select: { employees: true } } }
  });
  res.json(departments);
}));

async function main() {
  const plainAdminPassword = 'securepassword123';
  const hashedAdminPassword = await bcrypt.hash(plainAdminPassword, 10);


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

 
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@hrcore.com' },
    update: { password: hashedAdminPassword },
    create: {
      name: 'HR Admin',
      email: 'admin@hrcore.com',
      password: hashedAdminPassword,
    }
  });


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

 
  for (const emp of existingEmployees) {
    if (!emp.password && emp.email !== 'teamlead@hrcore.com' && emp.email !== 'employee@hrcore.com') {
      
      const defaultPassword = await bcrypt.hash('default123', 10);
      await prisma.employee.update({
        where: { id: emp.id },
        data: { password: defaultPassword }
      });
    }
  }


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


  employeeRecords.push(teamLead, defaultEmployee);


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
          date: new Date('2025-06-26'), 
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

  
  // await seedReports(admin.id);
  

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
