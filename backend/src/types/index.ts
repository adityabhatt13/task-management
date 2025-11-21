import { Request } from "express";

export interface AuthRequest extends Request {
    userId?: string
}

export interface PaginationParams {
    page: number
    limit: number
}

export interface TaskFilters {
    status?: string
    search?: string
}