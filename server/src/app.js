const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
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

//middlewares
app.use(cors()) //for cross origin access
app.use(express.json()) //for allowing the json type
app.use(morgan('dev')) //for monitoring the routes and their time elapsed 

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, filePath) => {

        if (!path.extname(filePath)) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Disposition', 'inline');
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