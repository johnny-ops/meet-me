# Meet Me - Lightweight Meet Alternative

A full-stack video conferencing application built with React, Node.js, WebRTC, and Socket.io. This application replicates the core functionality of Google Meet while maintaining a lightweight, user-friendly interface optimized for low bandwidth usage.

## Features

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
- Webcam aInstructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd meet-clone
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Start the backend server**
```bash
cd ../server
npm start
```
Server will run on http://localhost:4000

5. **Start the frontend (in a new terminal)**
```bash
cd client
npm run dev
```
Client will run on http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Click "Create Meeting" to start a new meeting
3. Share the room URL with others to join
4. Or enter a room code to join an existing meeting

## Controls

- **Microphone**: Toggle audio on/off
- **Camera**: Toggle video on/off
- **Screen Share**: Share your screen
- **Record**: Start/stop recording (downloads as .webm)
- **Chat**: Open chat sidebar
- **Participants**: View participant list
- **Leave**: Exit the meeting

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

## Features Explained

### Guest System
- Auto-generates usernames in format: `guest-XXXX`
- No authentication required
- Join instantly

### WebRTC Implementation
- Peer-to-peer video/audio streaming
- STUN server for NAT traversal
- Socket.io for signaling

### Recording
- Browser-based MediaRecorder API
- Records video + audio
- Downloads as .webm format
- Visual recording indicator

### Low Bandwidth Mode
- Audio-only option (disable video)
- Minimal UI for performance
- Optimized video grid layout

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (limited WebRTC support)

## Notes

- For production, use TURN servers for better connectivity
- HTTPS required for screen sharing in production
- Recording format depends on browser codec support

## License

MIT
