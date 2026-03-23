import { useEffect, useRef } from 'react'

function VideoGrid({ localStream, peers, username, participants, isVideoOff, isMuted }) {
  const localVideoRef = useRef(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  const peerCount = Object.keys(peers).length
  const totalVideos = peerCount + 1

  const getGridClass = () => {
    if (totalVideos === 1) return 'grid-cols-1'
    if (totalVideos === 2) return 'grid-cols-2'
    if (totalVideos <= 4) return 'grid-cols-2'
    if (totalVideos <= 6) return 'grid-cols-3'
    return 'grid-cols-4'
  }

  return (
    <div className={`grid ${getGridClass()} gap-4 h-full`}>
      {/* Local Video */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
        />
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
          <span>{username} (You)</span>
          {isMuted && <span className="text-red-500">🔇</span>}
        </div>
      </div>

      {/* Peer Videos */}
      {Object.entries(peers).map(([userId, stream]) => {
        const participant = participants.find(p => p.userId === userId)
        return (
          <PeerVideo
            key={userId}
            stream={stream}
            username={participant?.username || 'Guest'}
          />
        )
      })}
    </div>
  )
}

function PeerVideo({ stream, username }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 px-3 py-1 rounded-lg text-sm">
        {username}
      </div>
    </div>
  )
}

export default VideoGrid
