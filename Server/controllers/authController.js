import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const login = async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }

  const admin = await prisma.admin.findFirst({
    where: { email: username }
  });

  if (!admin || admin.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.user = { id: admin.id, email: admin.email, role: 'admin' };
  res.json({ message: 'Login successful', user: req.session.user });
};

export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
};

export const status = (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
};
