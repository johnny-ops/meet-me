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
  const [showShareModal, setShowShareModal] = useState(false)
  const [screenSharingUsers, setScreenSharingUsers] = useState({}) // Track who is sharing
  const [screenStreams, setScreenStreams] = useState({}) // Store screen streams separately
  const [cameraStream, setCameraStream] = useState(null) // Store camera stream when screen sharing
  const [localScreenStream, setLocalScreenStream] = useState(null) // Store local screen stream
  
  const peerConnections = useRef({})
  const screenPeerConnections = useRef({}) // Separate connections for screen
  const mediaRecorder = useRef(null)
  const recordedChunks = useRef([])

  // Copy room link
  const copyRoomLink = () => {
    const link = window.location.href
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Share meeting link
  const shareMeetingLink = async () => {
    const link = window.location.href
    const shareData = {
      title: 'Join my meeting',
      text: `Join my video meeting on MeetMe`,
      url: link
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to copy
        copyRoomLink()
        setShowShareModal(true)
        setTimeout(() => setShowShareModal(false), 3000)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error)
      }
    }
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
      
      // If we're currently screen sharing, send screen to the new user
      if (isScreenSharing && localScreenStream) {
        setTimeout(async () => {
          try {
            const pc = createScreenPeerConnection(userId)
            localScreenStream.getTracks().forEach(track => {
              pc.addTrack(track, localScreenStream)
            })
            
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            newSocket.emit('screen-stream-offer', { offer, toUserId: userId })
          } catch (error) {
            console.error('Error sending screen to new user:', error)
          }
        }, 500)
      }
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

    newSocket.on('user-screen-sharing', ({ userId, isSharing, username: sharingUsername }) => {
      setScreenSharingUsers(prev => {
        const updated = { ...prev }
        if (isSharing) {
          updated[userId] = sharingUsername
        } else {
          delete updated[userId]
          // Remove screen stream when sharing stops
          setScreenStreams(prev => {
            const newStreams = { ...prev }
            delete newStreams[userId]
            return newStreams
          })
        }
        return updated
      })
    })

    newSocket.on('screen-stream-offer', async ({ offer, fromUserId }) => {
      console.log('Received screen offer from:', fromUserId)
      try {
        const pc = createScreenPeerConnection(fromUserId)
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        console.log('Sending screen answer to:', fromUserId)
        newSocket.emit('screen-stream-answer', { answer, toUserId: fromUserId })
      } catch (error) {
        console.error('Error handling screen offer from', fromUserId, error)
      }
    })

    newSocket.on('screen-stream-answer', async ({ answer, fromUserId }) => {
      console.log('Received screen answer from:', fromUserId)
      try {
        const pc = screenPeerConnections.current[fromUserId]
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
          console.log('Screen answer set successfully for:', fromUserId)
        } else {
          console.warn('Cannot set screen answer - invalid state:', pc?.signalingState)
        }
      } catch (error) {
        console.error('Error handling screen answer from', fromUserId, error)
      }
    })

    newSocket.on('screen-ice-candidate', async ({ candidate, fromUserId }) => {
      console.log('Received screen ICE candidate from:', fromUserId)
      try {
        const pc = screenPeerConnections.current[fromUserId]
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
          console.log('Screen ICE candidate added for:', fromUserId)
        }
      } catch (error) {
        console.error('Error adding screen ICE candidate from', fromUserId, error)
      }
    })

    return () => {
      newSocket.disconnect()
    }
  }, [username, roomId, isScreenSharing, localScreenStream])

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
      try {
        const pc = createPeerConnection(fromUserId)
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('answer', { answer, toUserId: fromUserId })
      } catch (error) {
        console.error('Error handling offer:', error)
      }
    })

    socket.on('answer', async ({ answer, fromUserId }) => {
      try {
        const pc = peerConnections.current[fromUserId]
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
        }
      } catch (error) {
        console.error('Error handling answer:', error)
      }
    })

    socket.on('ice-candidate', async ({ candidate, fromUserId }) => {
      try {
        const pc = peerConnections.current[fromUserId]
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error)
      }
    })

    socket.on('ready-to-connect', ({ userId }) => {
      // Small delay to ensure both peers are ready
      setTimeout(() => {
        createOffer(userId)
      }, 100)
    })

    return () => {
      socket.off('offer')
      socket.off('answer')
      socket.off('ice-candidate')
      socket.off('ready-to-connect')
    }
  }, [socket, localStream])

  const createPeerConnection = (userId) => {
    // Close existing connection if any
    if (peerConnections.current[userId]) {
      peerConnections.current[userId].close()
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    })

    // Add local tracks
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream)
    })

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('Received track from:', userId)
      setPeers(prev => ({
        ...prev,
        [userId]: event.streams[0]
      }))
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          toUserId: userId
        })
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, pc.connectionState)
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        // Try to reconnect
        setTimeout(() => {
          if (pc.connectionState === 'failed') {
            pc.restartIce()
          }
        }, 1000)
      }
    }

    peerConnections.current[userId] = pc
    return pc
  }

  const createScreenPeerConnection = (userId) => {
    console.log('Creating screen peer connection for:', userId)
    
    // Close existing screen connection if any
    if (screenPeerConnections.current[userId]) {
      console.log('Closing existing screen connection for:', userId)
      screenPeerConnections.current[userId].close()
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    })

    // Handle incoming screen tracks
    pc.ontrack = (event) => {
      console.log('Received screen track from:', userId, event.track.kind)
      console.log('Screen stream ID:', event.streams[0].id)
      setScreenStreams(prev => ({
        ...prev,
        [userId]: event.streams[0]
      }))
    }

    // Handle ICE candidates for screen
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('screen-ice-candidate', {
          candidate: event.candidate,
          toUserId: userId
        })
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Screen connection state with ${userId}:`, pc.connectionState)
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.log('Screen connection failed/disconnected, attempting restart...')
        setTimeout(() => {
          if (pc.connectionState === 'failed') {
            pc.restartIce()
          }
        }, 1000)
      }
    }

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log(`Screen ICE connection state with ${userId}:`, pc.iceConnectionState)
    }

    screenPeerConnections.current[userId] = pc
    return pc
  }

  const createOffer = async (userId) => {
    try {
      const pc = createPeerConnection(userId)
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      await pc.setLocalDescription(offer)
      socket.emit('offer', { offer, toUserId: userId })
    } catch (error) {
      console.error('Error creating offer:', error)
    }
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
      try {
        console.log('Stopping screen share...')
        
        // Stop the screen stream tracks
        if (localScreenStream) {
          localScreenStream.getTracks().forEach(track => {
            console.log('Stopping screen track:', track.kind)
            track.stop()
          })
          setLocalScreenStream(null)
        }
        
        setIsScreenSharing(false)
        
        // Close all screen peer connections
        Object.keys(screenPeerConnections.current).forEach(userId => {
          console.log('Closing screen connection for:', userId)
          screenPeerConnections.current[userId].close()
        })
        screenPeerConnections.current = {}
        
        // Clear camera stream reference
        setCameraStream(null)
        
        // Notify others that screen sharing stopped
        if (socket) {
          socket.emit('screen-sharing-status', { 
            roomId, 
            isSharing: false,
            username 
          })
        }
        
        console.log('Screen share stopped successfully')
      } catch (error) {
        console.error('Error stopping screen share:', error)
      }
    } else {
      // Start screen sharing
      try {
        console.log('Starting screen share...')
        
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: {
            cursor: 'always',
            displaySurface: 'monitor',
            logicalSurface: true,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: false
        })
        
        console.log('Screen stream obtained:', screenStream.id)
        console.log('Screen tracks:', screenStream.getTracks().map(t => `${t.kind}: ${t.label}`))
        
        const screenTrack = screenStream.getVideoTracks()[0]
        
        // Store screen stream and camera stream
        setLocalScreenStream(screenStream)
        setCameraStream(localStream)
        
        console.log('Sending screen to', Object.keys(peerConnections.current).length, 'peers')
        
        // Send screen to all peers via separate connection
        for (const userId of Object.keys(peerConnections.current)) {
          try {
            console.log('Creating screen connection for peer:', userId)
            const pc = createScreenPeerConnection(userId)
            
            screenStream.getTracks().forEach(track => {
              console.log('Adding screen track to peer connection:', track.kind)
              pc.addTrack(track, screenStream)
            })
            
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            
            console.log('Sending screen offer to:', userId)
            socket.emit('screen-stream-offer', { offer, toUserId: userId })
          } catch (error) {
            console.error('Error creating screen offer for', userId, error)
          }
        }
        
        // Handle when user stops sharing via browser UI
        screenTrack.onended = () => {
          console.log('Screen track ended (user stopped sharing)')
          setIsScreenSharing(false)
          setLocalScreenStream(null)
          setCameraStream(null)
          
          // Close all screen peer connections
          Object.values(screenPeerConnections.current).forEach(pc => pc.close())
          screenPeerConnections.current = {}
          
          // Notify others
          if (socket) {
            socket.emit('screen-sharing-status', { 
              roomId, 
              isSharing: false,
              username 
            })
          }
        }
        
        setIsScreenSharing(true)
        
        // Notify others that screen sharing started
        if (socket) {
          socket.emit('screen-sharing-status', { 
            roomId, 
            isSharing: true,
            username 
          })
        }
        
        console.log('Screen share started successfully')
      } catch (error) {
        console.error('Error sharing screen:', error)
        if (error.name === 'NotAllowedError') {
          console.log('User denied screen share permission')
        } else if (error.name === 'NotFoundError') {
          alert('No screen available to share')
        } else {
          alert('Could not share screen. Please try again.')
        }
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
    if (localScreenStream) {
      localScreenStream.getTracks().forEach(track => track.stop())
    }
    Object.values(peerConnections.current).forEach(pc => pc.close())
    Object.values(screenPeerConnections.current).forEach(pc => pc.close())
    if (socket) socket.disconnect()
    navigate('/')
  }

  if (isLoading) {
    return <LoadingSpinner message="Setting up your meeting..." />
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-gray-900 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-gray-800 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-semibold text-white truncate max-w-[100px] sm:max-w-none">
                  {roomId}
                </h2>
                <button
                  onClick={copyRoomLink}
                  className="p-1 sm:p-1.5 hover:bg-gray-800 rounded-lg transition-colors group relative"
                  title="Copy room link"
                >
                  {copied ? (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={shareMeetingLink}
                  className="p-1 sm:p-1.5 hover:bg-gray-800 rounded-lg transition-colors group relative"
                  title="Share meeting link"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-400">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {isRecording && (
            <div className="hidden sm:flex items-center gap-2 bg-red-600/20 px-3 py-1.5 rounded-lg border border-red-600/50">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-red-500 text-sm font-medium">Recording</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-medium text-white">{username}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center font-bold text-black shadow-lg text-sm sm:text-base">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg px-6 py-3 shadow-2xl z-50 animate-fadeIn">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-white font-medium">Link copied to clipboard!</p>
          </div>
        </div>
      )}

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
            isScreenSharing={isScreenSharing}
            screenSharingUsers={screenSharingUsers}
            screenStreams={screenStreams}
            cameraStream={cameraStream}
            localScreenStream={localScreenStream}
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
