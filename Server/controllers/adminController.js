import prisma from '../../prisma/client.js';

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await prisma.admin.findFirst();
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
};
