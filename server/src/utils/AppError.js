class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Signals this is a known error to handle gracefully

        Error.captureStackTrace(this, this.constructor);
    }
}
module.exports = AppError;
