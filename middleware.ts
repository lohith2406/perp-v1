import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" })
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token missing "});
        }

        const payload = jwt.verify(token, JWT_SECRET) as { userId: number};
        req.userId = payload.userId;
        next()
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}