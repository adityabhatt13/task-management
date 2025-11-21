import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { registerSchema, loginSchema } from '../validators/auth.validator'
import { AuthRequest } from '../types'

const authService = new AuthService()

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const validatedData = registerSchema.parse(req.body)
            const result = await authService.register(
                validatedData.email,
                validatedData.password,
                validatedData.name
            )

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })

            res.status(201).json({
                message: 'User registered successfully',
                user: result.user,
                accessToken: result.accessToken
            })
        } catch (error: any) {
            if (error.message === 'User already exists') {
                return res.status(409).json({ error: error.message })
            }

            res.status(400).json({ error: error.message || 'Registration failed' })
        }
    }

    async login(req: Request, res: Response) {
        try {
            const validatedData = loginSchema.parse(req.body)
            const result = await authService.login(validatedData.email, validatedData.password)
            
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            res.json({
                message: 'Login successful',
                user: result.user,
                accessToken: result.accessToken
            })
        } catch (error: any) {
            res.status(401).json({ error: error.message || 'Login failed' })
        }
    }

    async refresh(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken

            if (!refreshToken) {
                return res.status(401).json({ error: 'Refresh token required' })
            }

            const result = await authService.refresh(refreshToken)

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            res.json({
                message: 'Token refreshed',
                accessToken: result.accessToken
            })
        } catch (error: any) {
            res.status(401).json({ error: error.message || 'Token refresh failed' })
        }
    }

    async logout(req: AuthRequest, res: Response) {
        try {
            if (!req.userId) {
                return res.status(401).json({ error: 'Unauthorized' })
            }

            await authService.logout(req.userId)

            res.clearCookie('refreshToken')
            res.json({ message: 'Logout successful' })
        } catch (error: any) {
            res.status(500).json({ error: 'Logout failed' })
        }
    }
}