# MeetMe - Video Conferencing App

A lightweight, full-stack video conferencing application built with React, Node.js, and WebRTC. No login required - join instantly as a guest!

## 🚀 Live Demo

- **Frontend**: [https://meet-me-ten.vercel.app](https://meet-me-ten.vercel.app)
- **Backend**: [https://meet-me-9il5.onrender.com](https://meet-me-9il5.onrender.com)

## ✨ Features

### Core Features
1. **Instant Meeting Creation** - Generate unique room IDs instantly
2. **Guest Access** - No login required, auto-generated usernames (guest-XXXX)
3. **Video & Audio Calls** - High-quality WebRTC peer-to-peer communication
4. **Screen Sharing** - Share your screen with dual-stream support (screen + camera)
5. **Real-time Chat** - Send messages with timestamps
6. **Recording** - Record meetings locally (WebM format)
7. **Participants List** - See who's in the meeting

### New Features ✨
8. **Raise Hand** - Get attention without interrupting
9. **Fullscreen Mode** - Immersive meeting experience
10. **Enhanced UI** - Smooth animations and transitions
11. **Mobile Optimized** - Fully responsive design

### Controls
- 🎤 Mute/Unmute microphone
- 📹 Turn camera on/off
- 🖥️ Share screen (with camera PIP)
- ⏺️ Record meeting
- ✋ Raise hand
- 💬 Chat with participants
- 👥 View participants list
- ⛶ Fullscreen mode
- 📱 Mobile-friendly controls

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite) - Fast, modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Socket.io Client** - Real-time communication
- **WebRTC** - Peer-to-peer video/audio
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web server framework
- **Socket.io** - WebSocket server
- **CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Clone Repository
```bash
git clone https://github.com/johnny-ops/meet-me.git
cd meet-me
```

### Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

## 🚀 Running Locally

### Start Backend Server
```bash
cd server
node server.js
```
Server runs on `http://localhost:4000`

### Start Frontend
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:3000`

## 🌐 Deployment

### Quick Deploy to GitHub
```bash
# Windows
DEPLOY.bat

# Mac/Linux
chmod +x deploy.sh
./deploy.sh
```

### Vercel Configuration
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: `VITE_SERVER_URL=your-backend-url`

### Render Configuration (Backend)
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment**: Node.js

## 📁 Project Structure

```
meet-me/
├── client/                 # Frontend React app
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Chat.jsx
│   │   │   ├── ControlBar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ParticipantsList.jsx
│   │   │   └── VideoGrid.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   └── Room.jsx
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── vercel.json        # Vercel config
│   └── package.json
├── server/                # Backend Node.js server
│   ├── server.js          # Express + Socket.io server
│   └── package.json
├── DEPLOY.bat             # Windows deployment script
├── deploy.sh              # Unix deployment script
└── README.md
```

## 🎨 UI/UX Features

- **Black & White Theme** - Clean, professional design
- **Poppins Font** - Modern, readable typography
- **Smooth Animations** - Fade, slide, and scale effects
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Hover Effects** - Interactive button feedback
- **Loading States** - Clear visual feedback

## 🔧 Configuration

### Environment Variables

**Frontend (.env.production):**
```env
VITE_SERVER_URL=https://your-backend-url.com
```

**Backend:**
```env
PORT=4000
```

## 🐛 Troubleshooting

### 404 Error on Shared Links
- Ensure `vercel.json` is in the `client` folder
- Check Vercel Root Directory is set to `client`
- Redeploy after configuration changes

### Screen Sharing Not Working
- Check browser permissions for screen capture
- Ensure HTTPS is enabled (required for screen sharing)
- Try refreshing the page

### Video/Audio Not Working
- Check browser permissions for camera/microphone
- Ensure devices are not in use by other applications
- Try using a different browser

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Johnny Ops**
- GitHub: [@johnny-ops](https://github.com/johnny-ops)

## 🙏 Acknowledgments

- WebRTC for peer-to-peer communication
- Socket.io for real-time messaging
- Tailwind CSS for styling
- Vercel for hosting
- Render for backend hosting

---

**Built with ❤️ using React, Node.js, and WebRTC**
