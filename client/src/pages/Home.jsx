import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [roomCode, setRoomCode] = useState('')
  const navigate = useNavigate()

  // Generate random room ID
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8)
  }

  const handleCreateMeeting = () => {
    const newRoomId = generateRoomId()
    navigate(`/room/${newRoomId}`)
  }

  const handleJoinMeeting = (e) => {
    e.preventDefault()
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.trim()}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-5xl font-bold text-white mb-12">Meet Clone</h1>
        
        <div className="space-y-6">
          {/* Create Meeting Button */}
          <button
            onClick={handleCreateMeeting}
            className="w-full bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
          >
            Create Meeting
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* Join Meeting Form */}
          <form onSubmit={handleJoinMeeting} className="space-y-4">
            <input
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full bg-gray-900 text-white px-6 py-4 rounded-lg border border-gray-700 focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="w-full bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-all duration-200"
            >
              Join Meeting
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Home
