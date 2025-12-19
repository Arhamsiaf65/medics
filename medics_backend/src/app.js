require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
        next();
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
        },
        message: 'Server is running.',
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/articles', require('./routes/articles'));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const http = require('http');
const socketConfig = require('./config/socket.js');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketConfig.init(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🏥 Pharmacy Backend API Server              ║
║                                               ║
║   Server running on: http://localhost:${PORT}   ║
║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
║                                               ║
║   Available endpoints:                        ║
║   • /api/auth     - Authentication            ║
║   • /api/doctors  - Doctors                   ║
║   • /api/chat     - Chat (WebSocket enabled)  ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
