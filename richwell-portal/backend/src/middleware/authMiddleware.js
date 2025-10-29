import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

// ==========================
//  VERIFY TOKEN
// ==========================
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { role: true },
      });

      if (!user)
        return res.status(404).json({ message: "User not found (invalid token)" });

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role.name,
      };

      next();
    } catch (err) {
      console.error("AUTH ERROR:", err);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ==========================
//  ROLE AUTHORIZATION
// ==========================
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Role '${req.user.role}' not allowed` });
    }
    next();
  };
};
