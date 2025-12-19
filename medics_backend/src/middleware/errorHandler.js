/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(400).json({
            success: false,
            error: 'A record with this value already exists.',
            code: 'DUPLICATE_ENTRY',
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            error: 'Record not found.',
            code: 'NOT_FOUND',
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: err.message,
            code: 'VALIDATION_ERROR',
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token.',
            code: 'INVALID_TOKEN',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired.',
            code: 'TOKEN_EXPIRED',
        });
    }

    // Default server error
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error.',
        code: err.code || 'SERVER_ERROR',
    });
};

/**
 * Not found handler for undefined routes
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found.`,
        code: 'ROUTE_NOT_FOUND',
    });
};

module.exports = {
    errorHandler,
    notFoundHandler,
};
