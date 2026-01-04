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


        // Join a room based on user ID logic
        socket.on('join', (userId) => {
            if (userId) {

                socket.join(userId);
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {

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
