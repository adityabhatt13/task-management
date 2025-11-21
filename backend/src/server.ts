import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors';
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import taskRoutes from './routes/task.routes'
import { errorHandler } from './middleware/errorHandler.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:3001', // Your Next.js frontend URL
    credentials: true,
  })
);

// Middleware
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error Handling
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})