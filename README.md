# Meet Clone - Lightweight Google Meet Alternative

A full-stack video conferencing application built with React, Node.js, WebRTC, and Socket.io. This application replicates the core functionality of Google Meet while maintaining a lightweight, user-friendly interface optimized for low bandwidth usage.

## Features
ee
1. Video & Audio Calls (WebRTC)
2. Real-time Chat
3. Screen Sharing
4. Recording (MediaRecorder API)
5. Participant List
6. Guest Mode (No Login Required)
7. Responsive Design
8. Low Bandwidth Optimization

## Tech Stack

### Frontend
- **Framework**: React.js 18.2.0
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.3.6
- **Routing**: React Router DOM 6.20.0
- **Real-time Communication**: Socket.io Client 4.6.0
- **Font**: Poppins (Google Fonts)
- **Color Scheme**: Black & White (Minimalist)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **WebSocket**: Socket.io 4.6.0
- **CORS**: cors 2.8.5

### Communication Protocols
- **Video/Audio Streaming**: WebRTC (Peer-to-Peer)
- **Signaling**: Socket.io (WebSockets)
- **STUN Server**: Google STUN (stun.l.google.com:19302)

## Installation

### Prerequisites
- Node.js (version 16.0.0 or higher)
- npm (version 7.0.0 or higher) or yarn
- Modern web browser (Chrome, Firefox, Edge, or Safari)
- Webcam and microphone (for video/audio features)

### Step-by-Step Setup Instructions

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd meet-clone
```

#### 2. Install Server Dependencies
Navigate to the server directory and install required packages:
```bash
cd server
npm install
```

This will install:
- express (Web server framework)
- socket.io (WebSocket server for real-time communication)
- cors (Cross-Origin Resource Sharing middleware)

#### 3. Install Client Dependencies
Navigate to the client directory and install required packages:
```bash
cd ../client
npm install
```

This will install:
- react & react-dom (UI library)
- react-router-dom (Client-side routing)
- socket.io-client (WebSocket client)
- vite (Build tool and dev server)
- tailwindcss (CSS framework)
- And other development dependencies

#### 4. Start the Backend Server
Open a terminal window and start the Node.js server:
```bash
cd server
npm start
```

Expected output:
```
Server running on port 4000
```

The server will be accessible at: http://localhost:4000

#### 5. Start the Frontend Development Server
Open a NEW terminal window (keep the server running) and start the React app:
```bash
cd client
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

The application will be accessible at: http://localhost:3000

#### 6. Access the Application
Open your web browser and navigate to:
```
http://localhost:3000
```

## Usage Guide

### Creating a Meeting

1. Open http://localhost:3000 in your web browser
2. On the home page, click the "Create Meeting" button
3. You will be automatically redirected to a new room with a unique room ID
4. Your browser will request permission to access your camera and microphone - click "Allow"
5. You will be assigned a random guest username (format: guest-XXXX)
6. Share the room URL with others to invite them to join

### Joining an Existing Meeting

1. Open http://localhost:3000 in your web browser
2. Enter the room code in the "Enter room code" input field
3. Click the "Join Meeting" button
4. Grant camera and microphone permissions when prompted
5. You will join the meeting with an auto-generated guest username

### Meeting Controls

The control bar at the bottom of the screen provides the following options:

1. **Microphone Button** (First button)
   - Click to mute/unmute your microphone
   - Red background indicates muted state
   - Gray background indicates active state

2. **Camera Button** (Second button)
   - Click to turn your camera on/off
   - Red background indicates camera is off
   - Gray background indicates camera is on
   - When off, displays your avatar with first letter of username

3. **Screen Share Button** (Third button)
   - Click to start sharing your screen
   - Browser will prompt you to select which screen/window to share
   - Blue background indicates active screen sharing
   - Click again to stop sharing and return to camera feed

4. **Record Button** (Fourth button)
   - Click to start recording the meeting
   - Records your local video and audio stream
   - Red pulsing background indicates active recording
   - Click again to stop recording
   - Recording automatically downloads as .webm file

5. **Chat Button** (Fifth button)
   - Click to open/close the chat sidebar
   - Send text messages to all participants
   - Messages display username and timestamp
   - Auto-scrolls to latest message

6. **Participants Button** (Sixth button)
   - Click to view the list of meeting participants
   - Shows all connected users with their usernames
   - Displays total participant count

7. **Leave Button** (Red button on the right)
   - Click to exit the meeting
   - Stops all media streams
   - Closes peer connections
   - Redirects to home page

## Project Structure

```
meet-clone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Chat.jsx
│   │   │   ├── ControlBar.jsx
│   │   │   ├── ParticipantsList.jsx
│   │   │   └── VideoGrid.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   └── Room.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                # Node.js backend
│   ├── server.js         # Socket.io server
│   └── package.json
└── README.md
```

## Detailed Feature Explanations

### 1. Guest User System
The application implements a no-login guest system for instant access:
- Automatically generates random usernames in the format: `guest-XXXX` (e.g., guest-4821, guest-7392)
- Username generation uses Math.random() to create 4-digit numbers
- No authentication, registration, or login required
- Users can join meetings immediately without any barriers
- Usernames are displayed in the video grid, chat, and participant list

### 2. Meeting System
Simple and intuitive meeting creation and joining:
- **Room ID Generation**: Uses base-36 encoding of random numbers to create 6-character room codes
- **Shareable Links**: Each meeting has a unique URL (e.g., /room/abc123)
- **Direct Join**: Users can enter a room code manually to join existing meetings
- **Persistent Rooms**: Rooms exist as long as at least one participant is connected
- **Auto Cleanup**: Empty rooms are automatically deleted from server memory

### 3. WebRTC Video & Audio Implementation
Peer-to-peer real-time communication using WebRTC:
- **RTCPeerConnection**: Creates direct peer-to-peer connections between users
- **Media Streams**: Captures video and audio using getUserMedia API
- **STUN Server**: Uses Google's public STUN server for NAT traversal
- **ICE Candidates**: Exchanges network information for optimal connection paths
- **Signaling**: Socket.io handles offer/answer exchange and ICE candidate sharing
- **Multiple Peers**: Supports multiple participants with mesh topology
- **Adaptive Grid**: Video grid automatically adjusts layout based on participant count

### 4. Screen Sharing
Browser-based screen capture functionality:
- Uses the **getDisplayMedia API** to capture screen content
- Allows users to select entire screen, specific window, or browser tab
- Replaces camera feed with screen content during sharing
- Updates all peer connections with the new screen track
- Automatically stops when user clicks "Stop Sharing" in browser prompt
- Seamlessly switches back to camera feed when sharing ends

### 5. Recording Feature
Client-side recording using MediaRecorder API:
- **MediaRecorder**: Records local video and audio streams
- **Codec**: Uses VP8 video codec and Opus audio codec (webm container)
- **Data Collection**: Accumulates recorded chunks in memory
- **Download**: Automatically triggers download when recording stops
- **File Format**: Saves as .webm file with timestamp in filename
- **Visual Indicator**: Shows pulsing red dot and "Recording" text during active recording
- **Browser Compatibility**: Works in Chrome, Firefox, and Edge

### 6. Real-Time Chat System
Socket.io-based messaging system:
- **Instant Delivery**: Messages broadcast to all room participants in real-time
- **Message Structure**: Includes username, message content, and timestamp
- **Time Formatting**: Displays time in 12-hour format (e.g., 02:30 PM)
- **Auto-Scroll**: Automatically scrolls to newest message
- **Persistent Display**: Chat history maintained during session
- **Sidebar UI**: Opens in right sidebar without blocking video view

### 7. Participant Management
Real-time participant tracking:
- **Join Notifications**: Server broadcasts when new users join
- **Leave Notifications**: Server broadcasts when users disconnect
- **Participant List**: Displays all connected users with avatars
- **Avatar Generation**: Shows first letter of username in circular avatar
- **Self Identification**: Marks current user with "(You)" label
- **Count Display**: Shows total participant count in header

### 8. Low Bandwidth Optimization
Performance optimizations for slower connections:
- **Audio-Only Mode**: Users can disable video to reduce bandwidth usage
- **Minimal Assets**: No heavy images or external resources
- **Efficient Rendering**: React optimizations prevent unnecessary re-renders
- **Lightweight UI**: Simple black and white design reduces CSS overhead
- **Direct P2P**: WebRTC peer-to-peer reduces server load
- **Optimized Grid**: Responsive layout adapts to screen size and participant count

## Technical Architecture

### Frontend Architecture

**Technology Stack:**
- React 18.2.0 (UI library)
- Vite 5.0.8 (build tool and dev server)
- React Router DOM 6.20.0 (client-side routing)
- Socket.io Client 4.6.0 (WebSocket client)
- Tailwind CSS 3.3.6 (utility-first CSS framework)

**Component Structure:**
```
src/
├── components/
│   ├── Chat.jsx              # Chat sidebar component
│   ├── ControlBar.jsx        # Bottom control buttons
│   ├── ParticipantsList.jsx  # Participants sidebar
│   └── VideoGrid.jsx         # Video layout grid
├── pages/
│   ├── Home.jsx              # Landing page
│   └── Room.jsx              # Meeting room (main logic)
├── App.jsx                   # Router configuration
├── main.jsx                  # React entry point
└── index.css                 # Global styles + Tailwind
```

**State Management:**
- Uses React hooks (useState, useEffect, useRef)
- No external state management library (Redux, Zustand, etc.)
- Local component state for UI controls
- WebRTC peer connections stored in refs

### Backend Architecture

**Technology Stack:**
- Node.js (JavaScript runtime)
- Express.js 4.18.2 (web server framework)
- Socket.io 4.6.0 (WebSocket server)
- CORS 2.8.5 (cross-origin resource sharing)

**Server Responsibilities:**
1. WebSocket connection management
2. Room-based user grouping
3. WebRTC signaling (offer/answer/ICE candidates)
4. Chat message broadcasting
5. Participant list synchronization
6. User join/leave notifications

**Data Structures:**
```javascript
rooms = Map {
  'roomId1' => Map {
    'socketId1' => { username: 'guest-1234', userId: 'socketId1' },
    'socketId2' => { username: 'guest-5678', userId: 'socketId2' }
  }
}
```

### WebRTC Connection Flow

```
User A                    Server                    User B
  |                         |                         |
  |------ join-room ------->|                         |
  |                         |<------ join-room -------|
  |                         |                         |
  |<--- ready-to-connect ---|                         |
  |                         |                         |
  |------ offer ----------->|------ offer ----------->|
  |                         |                         |
  |<------ answer ----------|<------ answer ----------|
  |                         |                         |
  |--- ice-candidate ------>|--- ice-candidate ------>|
  |<--- ice-candidate ------|<--- ice-candidate ------|
  |                         |                         |
  |<========== Direct P2P Connection ===============>|
```

## Browser Compatibility

### Fully Supported Browsers:
1. Google Chrome (version 90+) - RECOMMENDED
2. Microsoft Edge (version 90+) - RECOMMENDED
3. Firefox (version 88+)
4. Opera (version 76+)

### Limited Support:
- Safari (version 14+) - WebRTC support is improving but may have issues
- Mobile browsers (Chrome Mobile, Safari iOS) - Works but may have performance limitations

### Required Browser Features:
- WebRTC API (RTCPeerConnection)
- MediaDevices API (getUserMedia)
- Screen Capture API (getDisplayMedia)
- MediaRecorder API
- WebSocket support

### Browser Permissions Required:
1. Camera access
2. Microphone access
3. Screen sharing (when using that feature)

## Important Notes & Limitations

### Development vs Production

**Current Setup (Development):**
- Uses localhost for both client and server
- HTTP protocol (not HTTPS)
- STUN server only (no TURN server)
- No authentication or security

**For Production Deployment:**

1. **HTTPS is REQUIRED:**
   - WebRTC requires HTTPS in production
   - Screen sharing will NOT work without HTTPS
   - getUserMedia is restricted on HTTP (except localhost)

2. **TURN Server Needed:**
   - STUN servers only work for ~80% of connections
   - Users behind strict firewalls/NAT need TURN servers
   - TURN servers relay media when P2P fails
   - Recommended services: Twilio, Xirsys, or self-hosted coturn

3. **Environment Variables:**
   ```bash
   # Server
   PORT=4000
   CLIENT_URL=https://yourdomain.com
   
   # Client
   VITE_SERVER_URL=https://api.yourdomain.com
   ```

4. **Scalability Considerations:**
   - Current mesh topology doesn't scale beyond 4-6 users
   - For larger meetings, consider SFU (Selective Forwarding Unit)
   - Examples: Mediasoup, Janus, Jitsi

### Known Limitations

1. **Recording:**
   - Only records your local stream (not other participants)
   - Recording format (.webm) may not play on all devices
   - No server-side recording capability

2. **Chat:**
   - Messages are not persisted (lost on page refresh)
   - No chat history retrieval
   - No file sharing capability

3. **Participant Limit:**
   - Mesh topology works best with 2-6 participants
   - Performance degrades with more users
   - Each participant needs N-1 peer connections

4. **Network Requirements:**
   - Requires stable internet connection
   - High bandwidth needed for multiple participants
   - No automatic quality adjustment

5. **Browser Compatibility:**
   - Safari has limited WebRTC support
   - Mobile browsers may have performance issues
   - Some older browsers not supported

## Troubleshooting

### Common Issues and Solutions

**Issue: Camera/Microphone not working**
- Solution: Check browser permissions in settings
- Ensure no other application is using the camera
- Try refreshing the page and allowing permissions again

**Issue: Cannot connect to other participants**
- Solution: Check if both users are in the same room
- Verify the server is running on port 4000
- Check browser console for WebRTC errors
- May need TURN server for strict firewall environments

**Issue: Screen sharing not working**
- Solution: Ensure you're using HTTPS (or localhost)
- Check browser permissions for screen capture
- Try using Chrome or Edge (best support)

**Issue: Recording downloads empty file**
- Solution: Ensure you have an active media stream
- Check browser codec support for WebM
- Try recording for at least a few seconds before stopping

**Issue: High CPU usage**
- Solution: Disable video (audio-only mode)
- Reduce number of participants
- Close other browser tabs
- Check for browser extensions interfering

## Performance Optimization Tips

1. **For Users:**
   - Use wired internet connection when possible
   - Close unnecessary browser tabs
   - Disable video if bandwidth is limited
   - Use headphones to prevent echo

2. **For Developers:**
   - Implement video quality controls
   - Add bandwidth detection
   - Implement SFU for larger meetings
   - Add connection quality indicators
   - Implement reconnection logic

## License

MIT
