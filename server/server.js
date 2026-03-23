import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
const httpServer = createServer(app)

app.use(cors())

// Get allowed origins from environment or use defaults
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',')
  : ['http://localhost:3000']

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
})

// Store rooms and users
const rooms = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId)
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map())
    }
    
    const room = rooms.get(roomId)
    room.set(socket.id, { username, userId: socket.id })
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      username
    })
    
    // Send current participants list to the new user
    const participants = Array.from(room.values())
    socket.emit('participants-list', participants)
    
    // Notify new user to connect with existing peers
    room.forEach((user, userId) => {
      if (userId !== socket.id) {
        socket.emit('ready-to-connect', { userId })
      }
    })
    
    console.log(`${username} joined room ${roomId}`)
  })


  // WebRTC signaling
  socket.on('offer', ({ offer, toUserId }) => {
    io.to(toUserId).emit('offer', {
      offer,
      fromUserId: socket.id
    })
  })

  socket.on('answer', ({ answer, toUserId }) => {
    io.to(toUserId).emit('answer', {
      answer,
      fromUserId: socket.id
    })
  })

  socket.on('ice-candidate', ({ candidate, toUserId }) => {
    io.to(toUserId).emit('ice-candidate', {
      candidate,
      fromUserId: socket.id
    })
  })

  // Chat messages
  socket.on('chat-message', ({ roomId, username, message, timestamp }) => {
    io.to(roomId).emit('chat-message', {
      username,
      message,
      timestamp
    })
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      if (room.has(socket.id)) {
        const user = room.get(socket.id)
        room.delete(socket.id)
        
        // Notify others in the room
        socket.to(roomId).emit('user-left', {
          userId: socket.id
        })
        
        // Clean up empty rooms
        if (room.size === 0) {
          rooms.delete(roomId)
        }
        
        console.log(`${user.username} left room ${roomId}`)
      }
    })
  })
})

const PORT = process.env.PORT || 4000

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
