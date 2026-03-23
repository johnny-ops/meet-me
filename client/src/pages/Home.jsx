import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [roomCode, setRoomCode] = useState('')
  const [isHoveringCreate, setIsHoveringCreate] = useState(false)
  const [isHoveringJoin, setIsHoveringJoin] = useState(false)
  const navigate = useNavigate()

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
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo/Title Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block p-4 bg-white rounded-2xl mb-4 transform hover:rotate-6 transition-transform duration-300">
            <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-white tracking-tight">
            Meet<span className="text-gray-500">Me</span>
          </h1>
          <p className="text-gray-400 text-lg">Connect instantly, no login required</p>
        </div>

        {/* Action Cards */}
        <div className="space-y-6">
          {/* Create Meeting Card */}
          <div 
            className="relative group"
            onMouseEnter={() => setIsHoveringCreate(true)}
            onMouseLeave={() => setIsHoveringCreate(false)}
          >
            <div className={`absolute inset-0 bg-white rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
            <button
              onClick={handleCreateMeeting}
              className="relative w-full bg-white text-black px-8 py-6 rounded-2xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-between group"
            >
              <span className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Meeting
              </span>
              <svg className={`w-5 h-5 transform transition-transform duration-300 ${isHoveringCreate ? 'translate-x-1' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
            <span className="text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          </div>

          {/* Join Meeting Card */}
          <form onSubmit={handleJoinMeeting} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toLowerCase())}
                className="w-full bg-gray-900 text-white px-6 py-5 rounded-2xl border-2 border-gray-800 focus:outline-none focus:border-white transition-all duration-300 text-lg placeholder-gray-600"
              />
              {roomCode && (
                <button
                  type="button"
                  onClick={() => setRoomCode('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            
            <div 
              className="relative group"
              onMouseEnter={() => setIsHoveringJoin(true)}
              onMouseLeave={() => setIsHoveringJoin(false)}
            >
              <button
                type="submit"
                disabled={!roomCode.trim()}
                className="w-full bg-gray-800 text-white px-8 py-5 rounded-2xl text-lg font-semibold hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  Join Meeting
                </span>
                {roomCode.trim() && (
                  <svg className={`w-5 h-5 transform transition-transform duration-300 ${isHoveringJoin ? 'translate-x-1' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors duration-300 group cursor-default">
            <div className="w-10 h-10 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-white text-sm font-medium">No Login</p>
            <p className="text-gray-500 text-xs mt-1">Join instantly</p>
          </div>

          <div className="text-center p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors duration-300 group cursor-default">
            <div className="w-10 h-10 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-white text-sm font-medium">Secure</p>
            <p className="text-gray-500 text-xs mt-1">P2P encrypted</p>
          </div>

          <div className="text-center p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors duration-300 group cursor-default">
            <div className="w-10 h-10 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <p className="text-white text-sm font-medium">HD Video</p>
            <p className="text-gray-500 text-xs mt-1">Crystal clear</p>
          </div>

          <div className="text-center p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors duration-300 group cursor-default">
            <div className="w-10 h-10 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-white text-sm font-medium">Screen Share</p>
            <p className="text-gray-500 text-xs mt-1">Share anything</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            Powered by WebRTC • No data stored
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
