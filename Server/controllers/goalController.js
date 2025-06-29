import prisma from '../../prisma/client.js';

export const getEmployeeGoals = async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        employee: {
          include: {
            department: true  // ✅ Include the related department for each employee
          }
        }
      }
    });
    res.json(goals);
  } catch (err) {
    console.error('Error fetching employee goals:', err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};
