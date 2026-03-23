import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import VideoGrid from '../components/VideoGrid'
import ControlBar from '../components/ControlBar'
import Chat from '../components/Chat'
import ParticipantsList from '../components/ParticipantsList'
import LoadingSpinner from '../components/LoadingSpinner'

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
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
  const peerConnections = useRef({})
  const mediaRecorder = useRef(null)
  const recordedChunks = useRef([])

  // Copy room link
  const copyRoomLink = () => {
    const link = window.location.href
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
        setIsLoading(true)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setLocalStream(stream)
        setIsLoading(false)
      } catch (error) {
        console.error('Error accessing media devices:', error)
        alert('Could not access camera/microphone. Please check permissions.')
        setIsLoading(false)
        navigate('/')
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

  if (isLoading) {
    return <LoadingSpinner message="Setting up your meeting..." />
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-800 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Room: {roomId}</h2>
                <button
                  onClick={copyRoomLink}
                  className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors group relative"
                  title="Copy room link"
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 bg-red-600/20 px-3 py-1.5 rounded-lg border border-red-600/50">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-red-500 text-sm font-medium">Recording</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-medium text-white">{username}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center font-bold text-black shadow-lg">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4 bg-black">
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
          <div className="w-80 bg-gray-900 border-l border-gray-800 shadow-2xl">
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
