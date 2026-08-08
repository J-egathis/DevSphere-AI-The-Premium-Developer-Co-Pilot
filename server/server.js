require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const setupSockets = require('./socket/chat');
const { Server } = require('socket.io');

// Initialize App
const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors({
  origin: '*', // Allow all client connections for simple demo deployment
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// API Namespace
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DevSphere AI REST and Real-time API Gateway.' });
});

// Configure Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup sockets
setupSockets(io);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Express Error]', err.stack);
  res.status(500).json({
    message: err.message || 'An unexpected error occurred on the server',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] Express and Socket.IO running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
});
