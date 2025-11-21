import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { verifyAccessToken } from "../utils/jwt.util";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access Token required' })
        }

        const token = authHeader.substring(7)
        const { userId } = verifyAccessToken(token)

        req.userId = userId
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}