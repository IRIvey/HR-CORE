import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getDepartmentsDropdown = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      select: { id: true, name: true }
    });
    res.json({ success: true, data: departments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to load departments' });
  }
};

export const getEmployeesByDepartment = async (req, res) => {
  const { departmentId } = req.query;
  if (!departmentId) {
    return res.status(400).json({ success: false, message: 'Department ID is required' });
  }

  try {
    const employees = await prisma.employee.findMany({
      where: { departmentId: Number(departmentId) },
      select: {
        id: true,
        name: true,
        department: { select: { name: true } }
      }
    });

    res.json({ success: true, data: employees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to load employees' });
  }
};

export const createSalary = async (req, res) => {
 const { employee, baseSalary, allowances, deductions, payDate, overtimeHours } = req.body;


  if (!employee || !baseSalary || !payDate) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const salary = await prisma.salary.create({
      data: {
        employeeId: Number(employee),
        baseSalary: Number(baseSalary),
        allowances: Number(allowances || 0),
        deductions: Number(deductions || 0),
        payDate: new Date(payDate),
         overtimeHours: Number(overtimeHours || 0),
      }
    });

    res.json({ success: true, data: salary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create salary record' });
  }
};
