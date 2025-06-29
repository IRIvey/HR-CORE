import prisma from '../../prisma/client.js';

export const getSalaries = async (req, res) => {
  try {
    const salaries = await prisma.salary.findMany({
      include: {
        employee: true,
      },
    });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch salaries' });
  }
};
