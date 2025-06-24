import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { DecodedToken } from "../interfaces/decoded.interface";

// Extend Express Request to include custom properties
interface CustomRequest extends Request {
  email?: string;
  userId?: string;
}

const verifyJWT = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = (req.headers.authorization ||
    req.headers.Authorization) as string;

  if (!authHeader?.toString().startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (process.env.ACCESS_TOKEN_SECRET === undefined) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: any, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const payload = decoded as DecodedToken; // Type assertion for safety
      req.email = payload.UserInfo?.email;
      req.userId = payload.UserInfo?.user_id;

      next();
    }
  );
};

export default verifyJWT;
