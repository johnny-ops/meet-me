import { useEffect, useRef, useState } from 'react'

function VideoGrid({ localStream, peers, username, participants, isVideoOff, isMuted, isScreenSharing, screenSharingUsers, screenStreams, cameraStream, localScreenStream }) {
  const localVideoRef = useRef(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Check if anyone is sharing screen
  const hasScreenShare = Object.keys(screenStreams || {}).length > 0 || isScreenSharing

  const peerCount = Object.keys(peers).length
  const totalVideos = peerCount + 1

  // Optimized grid layout based on participant count
  const getGridClass = () => {
    if (totalVideos === 1) return 'grid-cols-1'
    if (totalVideos === 2) return 'grid-cols-1 md:grid-cols-2'
    if (totalVideos <= 4) return 'grid-cols-2'
    if (totalVideos <= 6) return 'grid-cols-2 md:grid-cols-3'
    if (totalVideos <= 9) return 'grid-cols-2 md:grid-cols-3'
    return 'grid-cols-2 md:grid-cols-4'
  }

  // Calculate optimal video height
  const getVideoHeight = () => {
    if (totalVideos === 1) return 'h-full'
    if (totalVideos === 2) return 'h-full md:h-full'
    if (totalVideos <= 4) return 'h-[45vh]'
    if (totalVideos <= 6) return 'h-[40vh]'
    return 'h-[30vh]'
  }

  // If someone is screen sharing, show different layout
  if (hasScreenShare) {
    return (
      <div className="flex flex-col h-full gap-3">
        {/* Screen Share Area - Large */}
        <div className="flex-1 relative">
          {isScreenSharing && localScreenStream ? (
            // Local user is sharing - show their screen
            <ScreenShareView
              screenStream={localScreenStream}
              cameraStream={cameraStream}
              username={username}
              isMuted={isMuted}
              isLocal={true}
            />
          ) : (
            // Someone else is sharing
            Object.entries(screenStreams || {}).map(([userId, screenStream]) => {
              const participant = participants.find(p => p.userId === userId)
              const cameraStreamForUser = peers[userId]
              return (
                <ScreenShareView
                  key={userId}
                  screenStream={screenStream}
                  cameraStream={cameraStreamForUser}
                  username={participant?.username || 'Guest'}
                  isMuted={false}
                  isLocal={false}
                />
              )
            })
          )}
        </div>

        {/* Camera Grid - Small thumbnails at bottom */}
        <div className="h-32 flex gap-2 overflow-x-auto pb-1">
          {/* Local camera - always show when not screen sharing, or show in thumbnail when screen sharing */}
          {isScreenSharing ? (
            // When local user is screen sharing, their camera is shown in PIP, not here
            null
          ) : (
            <div className="relative bg-gray-900 rounded-lg overflow-hidden min-w-[180px] group">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center text-lg font-bold text-black">
                    {username.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                {username} (You)
              </div>
            </div>
          )}

          {/* Peer cameras */}
          {Object.entries(peers).map(([userId, stream]) => {
            const participant = participants.find(p => p.userId === userId)
            const isSharing = screenSharingUsers && screenSharingUsers[userId]
            // Don't show in thumbnail if they're the one sharing (their camera is in PIP)
            if (isSharing) return null
            return (
              <PeerThumbnail
                key={userId}
                stream={stream}
                username={participant?.username || 'Guest'}
              />
            )
          })}
        </div>
      </div>
    )
  }

  // Normal grid layout (no screen sharing)
  return (
    <div className={`grid ${getGridClass()} gap-3 h-full auto-rows-fr`}>
      {/* Local Video */}
      <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${getVideoHeight()} group`}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
        />
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center text-3xl font-bold text-black mx-auto mb-3 shadow-lg">
                {username.charAt(0).toUpperCase()}
              </div>
              <p className="text-white text-sm font-medium">{username}</p>
            </div>
          </div>
        )}
        
        {/* Overlay info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded-lg backdrop-blur-sm">
                <span className="text-white text-sm font-medium">{username} (You)</span>
                {isMuted && (
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Always visible name tag */}
        <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-2 group-hover:opacity-0 transition-opacity duration-300">
          <span className="text-white text-sm font-medium">{username}</span>
          {isMuted && (
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Peer Videos */}
      {Object.entries(peers).map(([userId, stream]) => {
        const participant = participants.find(p => p.userId === userId)
        const isSharing = screenSharingUsers && screenSharingUsers[userId]
        return (
          <PeerVideo
            key={userId}
            stream={stream}
            username={participant?.username || 'Guest'}
            videoHeight={getVideoHeight()}
            isScreenSharing={isSharing}
          />
        )
      })}
    </div>
  )
}

// Screen Share View Component - Shows large screen with PIP camera
function ScreenShareView({ screenStream, cameraStream, username, isMuted, isLocal }) {
  const screenRef = useRef(null)
  const cameraRef = useRef(null)
  const [screenReady, setScreenReady] = useState(false)

  useEffect(() => {
    if (screenRef.current && screenStream) {
      screenRef.current.srcObject = screenStream
      setScreenReady(true)
      
      // Add event listener to check if stream is active
      screenRef.current.onloadedmetadata = () => {
        screenRef.current.play().catch(err => console.error('Error playing screen:', err))
      }
    } else {
      setScreenReady(false)
    }
  }, [screenStream])

  useEffect(() => {
    if (cameraRef.current && cameraStream) {
      cameraRef.current.srcObject = cameraStream
      
      // Add event listener for camera
      cameraRef.current.onloadedmetadata = () => {
        cameraRef.current.play().catch(err => console.error('Error playing camera:', err))
      }
    }
  }, [cameraStream])

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden">
      {/* Screen Share - Large */}
      {screenStream && screenReady ? (
        <video
          ref={screenRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain bg-black"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center animate-pulse">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
            <p className="text-gray-400 text-sm">Loading screen share...</p>
          </div>
        </div>
      )}

      {/* Camera PIP - Small overlay */}
      {cameraStream && (
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 hover:border-white/40 transition-all hover:scale-105">
          <video
            ref={cameraRef}
            autoPlay
            muted={isLocal}
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
            <span>{username}{isLocal ? ' (You)' : ''}</span>
            {isMuted && (
              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Screen sharing indicator */}
      <div className="absolute top-4 left-4 bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg animate-fadeIn">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
        </svg>
        <span className="text-white text-sm font-medium">{username} is sharing</span>
      </div>
    </div>
  )
}

// Peer Thumbnail Component
function PeerThumbnail({ stream, username }) {
  const videoRef = useRef(null)
  const [hasVideo, setHasVideo] = useState(true)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        setHasVideo(videoTrack.enabled)
        videoTrack.onended = () => setHasVideo(false)
      }
    }
  }, [stream])

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden min-w-[180px]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${!hasVideo ? 'hidden' : ''}`}
      />
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center text-lg font-bold text-black">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
        {username}
      </div>
    </div>
  )
}

function PeerVideo({ stream, username, videoHeight, isScreenSharing }) {
  const videoRef = useRef(null)
  const [hasVideo, setHasVideo] = useState(true)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      
      // Check if video track is enabled
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        setHasVideo(videoTrack.enabled)
        videoTrack.onended = () => setHasVideo(false)
      }
    }
  }, [stream])

  return (
    <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${videoHeight} group`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${!hasVideo ? 'hidden' : ''}`}
      />
      
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center text-3xl font-bold text-black mx-auto mb-3 shadow-lg">
              {username.charAt(0).toUpperCase()}
            </div>
            <p className="text-white text-sm font-medium">{username}</p>
          </div>
        </div>
      )}

      {/* Screen Sharing Indicator */}
      {isScreenSharing && (
        <div className="absolute top-3 right-3 bg-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg animate-pulse">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
          <span className="text-white text-xs font-medium">Sharing Screen</span>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-black/70 px-3 py-2 rounded-lg backdrop-blur-sm inline-block">
            <span className="text-white text-sm font-medium">{username}</span>
          </div>
        </div>
      </div>

      {/* Always visible name tag */}
      <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-sm group-hover:opacity-0 transition-opacity duration-300">
        <span className="text-white text-sm font-medium">{username}</span>
      </div>
    </div>
  )
}

export default VideoGrid
