import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import VideoGrid from '../components/VideoGrid'
import ControlBar from '../components/ControlBar'
import Chat from '../components/Chat'
import ParticipantsList from '../components/ParticipantsList'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

function Room() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [socket, setSocket] = useState(null)
  const [username, setUsername] = useState('')
  const [localStream, setLocalStream] = useState(null)
  const [peers, setPeers] = useState({})
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState([])
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  
  const peerConnections = useRef({})
  const mediaRecorder = useRef(null)
  const recordedChunks = useRef([])

  // Generate guest username
  useEffect(() => {
    const guestName = `guest-${Math.floor(1000 + Math.random() * 9000)}`
    setUsername(guestName)
  }, [])

  // Initialize socket connection
  useEffect(() => {
    if (!username) return

    const newSocket = io(SERVER_URL)
    setSocket(newSocket)

    newSocket.emit('join-room', { roomId, username })

    newSocket.on('user-joined', ({ userId, username: newUsername }) => {
      setParticipants(prev => [...prev, { userId, username: newUsername }])
    })

    newSocket.on('user-left', ({ userId }) => {
      setParticipants(prev => prev.filter(p => p.userId !== userId))
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close()
        delete peerConnections.current[userId]
      }
      setPeers(prev => {
        const newPeers = { ...prev }
        delete newPeers[userId]
        return newPeers
      })
    })

    newSocket.on('chat-message', (message) => {
      setMessages(prev => [...prev, message])
    })

    newSocket.on('participants-list', (participantsList) => {
      setParticipants(participantsList)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [username, roomId])

  // Initialize media stream
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setLocalStream(stream)
      } catch (error) {
        console.error('Error accessing media devices:', error)
      }
    }
    initMedia()

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // WebRTC signaling
  useEffect(() => {
    if (!socket || !localStream) return

    socket.on('offer', async ({ offer, fromUserId }) => {
      const pc = createPeerConnection(fromUserId)
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('answer', { answer, toUserId: fromUserId })
    })

    socket.on('answer', async ({ answer, fromUserId }) => {
      const pc = peerConnections.current[fromUserId]
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      }
    })

    socket.on('ice-candidate', async ({ candidate, fromUserId }) => {
      const pc = peerConnections.current[fromUserId]
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })

    socket.on('ready-to-connect', ({ userId }) => {
      createOffer(userId)
    })

    return () => {
      socket.off('offer')
      socket.off('answer')
      socket.off('ice-candidate')
      socket.off('ready-to-connect')
    }
  }, [socket, localStream])

  const createPeerConnection = (userId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream)
    })

    pc.ontrack = (event) => {
      setPeers(prev => ({
        ...prev,
        [userId]: event.streams[0]
      }))
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          toUserId: userId
        })
      }
    }

    peerConnections.current[userId] = pc
    return pc
  }

  const createOffer = async (userId) => {
    const pc = createPeerConnection(userId)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket.emit('offer', { offer, toUserId: userId })
  }

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setIsMuted(!audioTrack.enabled)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      setIsVideoOff(!videoTrack.enabled)
    }
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      const videoTrack = stream.getVideoTracks()[0]
      
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track.kind === 'video')
        if (sender) sender.replaceTrack(videoTrack)
      })
      
      localStream.getVideoTracks()[0].stop()
      localStream.removeTrack(localStream.getVideoTracks()[0])
      localStream.addTrack(videoTrack)
      setLocalStream(stream)
      setIsScreenSharing(false)
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const screenTrack = screenStream.getVideoTracks()[0]
        
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track.kind === 'video')
          if (sender) sender.replaceTrack(screenTrack)
        })
        
        const oldTrack = localStream.getVideoTracks()[0]
        localStream.removeTrack(oldTrack)
        localStream.addTrack(screenTrack)
        
        screenTrack.onended = () => toggleScreenShare()
        setIsScreenSharing(true)
      } catch (error) {
        console.error('Error sharing screen:', error)
      }
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
    } else {
      recordedChunks.current = []
      mediaRecorder.current = new MediaRecorder(localStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      })
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data)
        }
      }
      
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `recording-${Date.now()}.webm`
        a.click()
      }
      
      mediaRecorder.current.start()
      setIsRecording(true)
    }
  }

  const sendMessage = (message) => {
    if (socket && message.trim()) {
      socket.emit('chat-message', {
        roomId,
        username,
        message: message.trim(),
        timestamp: new Date().toISOString()
      })
    }
  }

  const leaveMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    Object.values(peerConnections.current).forEach(pc => pc.close())
    if (socket) socket.disconnect()
    navigate('/')
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-gray-900 px-6 py-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">Room: {roomId}</h2>
          {isRecording && (
            <span className="flex items-center gap-2 text-red-500 text-sm">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              Recording
            </span>
          )}
        </div>
        <span className="text-gray-400 text-sm">{username}</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <VideoGrid
            localStream={localStream}
            peers={peers}
            username={username}
            participants={participants}
            isVideoOff={isVideoOff}
            isMuted={isMuted}
          />
        </div>

        {/* Sidebar */}
        {(showChat || showParticipants) && (
          <div className="w-80 bg-gray-900 border-l border-gray-800">
            {showChat && (
              <Chat
                messages={messages}
                onSendMessage={sendMessage}
                onClose={() => setShowChat(false)}
              />
            )}
            {showParticipants && (
              <ParticipantsList
                participants={participants}
                currentUsername={username}
                onClose={() => setShowParticipants(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Control Bar */}
      <ControlBar
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isRecording={isRecording}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleRecording={toggleRecording}
        onToggleChat={() => {
          setShowChat(!showChat)
          setShowParticipants(false)
        }}
        onToggleParticipants={() => {
          setShowParticipants(!showParticipants)
          setShowChat(false)
        }}
        onLeaveMeeting={leaveMeeting}
      />
    </div>
  )
}

export default Room
