import { useEffect, useRef, useState } from 'react'

function VideoGrid({ localStream, peers, username, participants, isVideoOff, isMuted, isScreenSharing, screenSharingUsers }) {
  const localVideoRef = useRef(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

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
