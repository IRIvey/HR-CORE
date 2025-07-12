import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
      },
    });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
}
export const getEmployeeById = async (req, res) => {
  const { id } = req.params;
  console.log("➡️ Requested ID:", id);
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: Number(id) },
      include: { department: true }
    });
    console.log("➡️ Prisma result:", employee);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (err) {
    console.error("➡️ Error fetching employee:", err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};


