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

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./modules/middlewares/errorHandler');
const path = require('path');

const app = express()

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet())

// Limit requests from same API
const limiter = rateLimit({
    max: 100, // limit each IP to 100 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again in 15 minutes!'
})
app.use('/api', limiter)

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })) 

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.query) mongoSanitize.sanitize(req.query);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
});

// Prevent parameter pollution
app.use(hpp())

// Development logging
app.use(morgan('dev')) 

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

// Handle undefined routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler Middleware
app.use(globalErrorHandler);

module.exports = app