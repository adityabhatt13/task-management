import { z } from "zod";

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required'). max(200, 'Title too long'),
    description: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional()
})

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional()
})

export const taskQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => val > 0, { message: 'Page must be greater than 0'}),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => val > 0 && val <= 100, { 
            message: 'Limit must be between 1 and 100' 
        }),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    search: z.string().optional()
})