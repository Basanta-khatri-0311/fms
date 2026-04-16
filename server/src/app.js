const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp')

const userRoutes = require('./modules/users/user.routes')
const authRoutes = require('./modules/auth/auth.routes');
const incomeRoutes = require('./modules/accounting/income/income.routes');
const expenseRoutes = require('./modules/accounting/expense/expense.routes');
const vendorRoute = require('./modules/vendors/vendor.routes');
const approvalRoute = require('./modules/approvals/approval.routes');
const reportsRouter = require('./modules/accounting/reports/reports.routes');
const coaRoute = require('./modules/accounting/coa/coa.routes');
const payrollRoutes = require('./modules/accounting/payroll/payroll.routes');
const systemRoutes = require('./modules/system/system.routes');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./modules/middlewares/errorHandler');
const path = require('path');

const app = express()

// 1) GLOBAL MIDDLEWARES
// Development logging - Moved to top to see all hits
app.use(morgan('dev')) 

// Set security HTTP headers
// Relaxing crossOriginResourcePolicy for dev if needed
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Limit requests from same API
const limiter = rateLimit({
    max: 1000, // Increased for dev
    windowMs: 15 * 60 * 1000, 
    message: 'Too many requests from this IP, please try again in 15 minutes!'
})
app.use('/api', limiter)

// CORS Configuration
const getOrigins = () => {
    const origins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
        : [];
    
    return [
        ...origins,
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5500'
    ].filter(Boolean).map(o => o.replace(/\/$/, ''));
};

const allowedOrigins = getOrigins();

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: Origin ${origin} is not in allowed list.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}))

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })) 

// Data sanitization against NoSQL query injection
// Express 5 Fix: Sanitize values without reassigning getters
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.query && typeof req.query === 'object') {
        // Sanitize existing object instead of reassigning
        mongoSanitize.sanitize(req.query);
    }
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
});

// Prevent parameter pollution
app.use(hpp())
// 2) ROUTES
// Serve static uploads (with safe headers)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, filePath) => {
        // Force secure mime types if missing
        if (!path.extname(filePath)) {
            res.setHeader('Content-Type', 'image/jpeg');
            // 'inline' ensures they view it in browser, 'attachment' would download it
            res.setHeader('Content-Disposition', 'inline');
            // Security: Prevent browsers from trying to guess the mime type
            res.setHeader('X-Content-Type-Options', 'nosniff');
        }
    }
}));


app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/vendors', vendorRoute);
app.use('/api/approvals', approvalRoute)
app.use('/api/coa', coaRoute)
app.use('/api/reports', reportsRouter)
app.use('/api/payroll', payrollRoutes)
app.use('/api/system', systemRoutes)

// Handle undefined routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler Middleware
app.use(globalErrorHandler);

module.exports = app