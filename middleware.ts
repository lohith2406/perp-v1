import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

        if (!token) {
            return res.status(401).json({ message: "Missing auth token"});
        }

        const payload = jwt.verify(token, JWT_SECRET) as { userId: number};
        req.userId = payload.userId;
        next()
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}