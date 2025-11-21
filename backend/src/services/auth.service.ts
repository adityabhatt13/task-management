import prisma from '../config/database'
import { hashPassword, comparePassword } from '../utils/password.util'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util'

export class AuthService {
    async register(email: string, password: string, name: string) {
        const existingUser = await prisma.user.findUnique({ where: { email } })

        if (existingUser) {
            throw new Error('User already exists')
        }

        const hashedPassword = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        })

        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        })

        return { user, accessToken, refreshToken }
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            throw new Error('Invalid credentials')
        }

        const isValidPassword = await comparePassword(password, user.password)

        if (!isValidPassword) {
            throw new Error('Invalid credentials')
        }

        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        })

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            accessToken,
            refreshToken
        }
    }

    async refresh(refreshToken: string) {
        try {
            const { userId } = verifyRefreshToken(refreshToken)

            const user = await prisma.user.findUnique({
                where: { id: userId }
            })

            if (!user || user.refreshToken !== refreshToken) {
                throw new Error('Invalid refresh token')
            }

            const newAccessToken = generateAccessToken(userId)
            const newRefreshToken = generateRefreshToken(userId)

            await prisma.user.update({
                where: { id: userId },
                data: { refreshToken: newRefreshToken }
            })

            return { accessToken: newAccessToken, refreshToken: newRefreshToken }
        } catch (error) {
            throw new Error('Invalid refresh token')
        }
    }

    async logout(userId: string) {
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null }
        })
    }
}