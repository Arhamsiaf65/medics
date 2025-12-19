const socketIo = require('socket.io');

let io;

const init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow all origins for now (adjust for production)
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected', socket.id);

        // Join a room based on user ID logic
        socket.on('join', (userId) => {
            if (userId) {   
                console.log(`Socket ${socket.id} joined room ${userId}`);
                socket.join(userId);
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = {
    init,
    getIo
};
