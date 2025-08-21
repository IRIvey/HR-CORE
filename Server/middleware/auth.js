// // src/middleware/auth.js
// export const requireAuth = (req, res, next) => {
//   if (!req.session?.user) {
//     return res.status(401).json({ message: 'Not authenticated' });
//   }
//   next();
// };

// export const allowRoles = (...roles) => (req, res, next) => {
//   const role = req.session?.user?.role;
//   if (!role || !roles.includes(role)) {
//     return res.status(403).json({ message: 'Forbidden: insufficient role' });
//   }
//   next();
// };
// src/middleware/auth.js
export const requireAuth = (req, res, next) => {
  console.log("🔑 requireAuth - session:", req.session);
  if (!req.session?.user) {
    console.log("❌ No user in session");
    return res.status(401).json({ message: 'Not authenticated' });
  }
  console.log("✅ Authenticated user:", req.session.user);
  next();
};

export const allowRoles = (...roles) => (req, res, next) => {
  const role = req.session?.user?.role;
  console.log("🎭 allowRoles - required:", roles, "user role:", role);
  if (!role || !roles.includes(role)) {
    console.log("❌ Role check failed");
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  console.log("✅ Role check passed");
  next();
};
