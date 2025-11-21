import prisma from '../config/database'
import { Status } from '@prisma/client'
import { PaginationParams, TaskFilters } from '../types'

export class TaskService {
    async getTasks(
        userId: string,
        { page = 1, limit = 10 }: PaginationParams,
        filters: TaskFilters
    ) {
        const skip = (page - 1) * limit
        const where: any = { userId }

        if (filters.status) {
            where.status = filters.status as Status
        }

        if (filters.search) {
            where.OR = [
                {
                    title: {
                        contains: filters.search,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: filters.search,
                        mode: 'insensitive'
                    }
                }
            ]
        }

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.task.count({ where })
        ])

        return {
            tasks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }

    async getTaskById(taskId: string, userId: string) {
        const task = await prisma.task.findFirst({
            where: { id: taskId, userId }
        })

        if (!task) {
            throw new Error('Task not found')
        }

        return task
    }

    async createTask(
        userId: string,
        data: {
            title: string
            description?: string
            status?: Status
        }
    ) {
        return prisma.task.create({
            data: {
                ...data,
                userId
            }
        })
    }

    async updateTask(
        taskId: string,
        userId: string,
        data: {
            title?: string
            description?: string
            status?: Status
        }
    ) {
        const task = await prisma.task.findFirst({
            where: { id: taskId, userId }
        })

        if (!task) {
            throw new Error('Task not found')
        }

        return prisma.task.update({
            where: { id: taskId },
            data
        })
    }

    async deleteTask(taskId: string, userId: string) {
        const task = await prisma.task.findFirst({
            where: { id: taskId, userId }
        })

        if (!task) {
            throw new Error('Task not found')
        }
        
        await prisma.task.delete({
            where: { id: taskId }
        })
    }

    async toggleTaskStatus(taskId: string, userId: string) {
        const task = await prisma.task.findFirst({
            where: { id: taskId, userId }
        })

        if (!task) {
            throw new Error('Task not found')
        }

        const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'

        return prisma.task.update({
            where: { id: taskId },
            data: { status: newStatus }
        })
    }
}