const express = require('express');
const next = require('next');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
    const server = express();
    const httpServer = http.createServer(server);
    const io = new Server(httpServer);

    // Room Storage: Map<roomId, { history: string[] }>
    const rooms = new Map();
    const HISTORY_LIMIT = 50;

    // Helper: Generate 6-digit code
    const generateRoomCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // CREATE SESSION
        socket.on('create-session', (callback) => {
            const roomId = generateRoomCode();
            // Ensure uniqueness (simple check)
            while (rooms.has(roomId)) {
                roomId = generateRoomCode();
            }

            rooms.set(roomId, { history: [] });
            socket.join(roomId);

            console.log(`Session created: ${roomId} by ${socket.id}`);
            callback({ success: true, roomId });
        });

        // JOIN SESSION
        socket.on('join-session', (roomId, callback) => {
            if (rooms.has(roomId)) {
                socket.join(roomId);
                const roomData = rooms.get(roomId);

                // Send current history to the new joiner
                socket.emit('history-update', roomData.history);

                console.log(`Client ${socket.id} joined session ${roomId}`);
                callback({ success: true });
            } else {
                callback({ success: false, message: 'Invalid Session Code' });
            }
        });

        // HANDLE TEXT UPDATE
        socket.on('send-text', (text, roomId) => {
            if (!rooms.has(roomId)) return;

            const roomData = rooms.get(roomId);

            // Deduplicate
            if (roomData.history.length > 0 && roomData.history[0] === text) return;

            roomData.history.unshift(text);
            if (roomData.history.length > HISTORY_LIMIT) roomData.history.pop();

            // Broadcast to everyone in the room EXCEPT sender (optional, but good for sync)
            // Actually, broadcast to all in room so all UIs update
            io.to(roomId).emit('history-update', roomData.history);
        });

        // CLEAR HISTORY
        socket.on('clear-text', (roomId) => {
            if (rooms.has(roomId)) {
                rooms.get(roomId).history = [];
                io.to(roomId).emit('history-update', []);
            }
        });

        socket.on('disconnect', () => {
            // Optional: Clean up empty rooms after a timeout?
            // For now, keep them in memory until server restart
        });
    });

    // Serve uploaded files statically
    server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    server.use((req, res) => {
        return handle(req, res);
    });

    httpServer.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});
