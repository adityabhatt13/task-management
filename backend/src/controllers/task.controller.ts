import { Response } from 'express'
import { TaskService } from '../services/task.service'
import { AuthRequest } from '../types'
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../validators/task.validator'

const taskService = new TaskService()

export class TaskController {
    async getTasks(req: AuthRequest, res: Response) {
        try {
            if (!req.userId) {
                return res.status(401).json({ error: 'Unauthorized' })
            }

            const query = taskQuerySchema.parse(req.query)

            const result = await taskService.getTasks(
                req.userId,
                { page: query.page || 1, limit: query.limit || 10 },
                { status: query.status, search: query.search }
            )

            res.json(result)
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Failed to fetch tasks' })
        }
    }

    async getTaskById(req: AuthRequest, res: Response) {
        try {
            if ((!req.userId)) {
                return res.status(401).json({ error: 'Unauthorized' })
            }

            const task = await taskService.getTaskById(req.params.id, req.userId)
            res.json(task)
        } catch (error: any) {
            if (error.message === 'Task not found') {
                return res.status(404).json({ error: error.message })
            }
            res.status(400).json({ error: 'Failed to fetch task' })
        }
    }

    async createTask(req: AuthRequest, res: Response) {
        try {
            if (!req.userId) {
                return res.status(401).json({ error: 'Unauthorized' })
            }

            const validatedData = createTaskSchema.parse(req.body)
            const task = await taskService.createTask(req.userId, validatedData)

            res.status(201).json({ message: 'Task created', task })
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Failed to create task' })
        }
    }

    async updateTask(req: AuthRequest, res: Response) {
        try {
            if (!req.userId) {
                return res.status(401).json({ error: 'Unauthorized' })
            }

            const validatedData = updateTaskSchema.parse(req.body)
            const task = await taskService.updateTask(req.params.id, req.userId, validatedData)

            res.json({ message: 'Task updated', task })
        } catch (error: any) {
            if (error.message === 'Task not found') {
                return res.status(404).json({ error: error.message })
            }
            res.status(400).json({ error: 'Failed to update task' })
        }
    }

    async deleteTask(req: AuthRequest, res: Response) {
        try {
            if (!req.userId) {
                return res.status(401).json({ error: 'Unauthorized' })
            }

            await taskService.deleteTask(req.params.id, req.userId)
            res.json({ message: 'Task deleted successfully' })
        } catch (error: any) {
            if (error.message === 'Task not found') {
                return res.status(404).json({ error: error.message })
            }
            res.status(400).json({ error: 'Failed to delete task' })
        }
    }

    async toggleTaskStatus(req: AuthRequest, res: Response) {
        try {
            if (!req.userId) {
                return res.status(401).json({ error: 'Unauthorized' })
            }

            const task = await taskService.toggleTaskStatus(req.params.id, req.userId)
            res.json({ message: 'Task status toggled', task })
        } catch (error: any) {
            if (error.message === 'Task not found') {
                return res.status(404).json({ error: error.message })
            }
            res.status(400).json({ error: 'Failed to toggle task status' })
        }
    }
}