function ControlBar({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isRecording,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onToggleChat,
  onToggleParticipants,
  onLeaveMeeting
}) {
  return (
    <div className="bg-gray-900 px-6 py-4 border-t border-gray-800">
      <div className="flex items-center justify-center gap-3">
        {/* Mute Button */}
        <div className="relative group">
          <button
            onClick={onToggleMute}
            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              {isMuted ? (
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              )}
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isMuted ? 'Unmute' : 'Mute'}
          </div>
        </div>

        {/* Video Button */}
        <div className="relative group">
          <button
            onClick={onToggleVideo}
            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              {isVideoOff ? (
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13.657V6.343a2 2 0 00-3.234-1.577l-.002.002-1.532 1.226A4 4 0 0012 6H8.586L3.707 2.293zM7.414 8L2 2.586 2.586 2l16 16-.586.586L13.414 14H4a2 2 0 01-2-2V8a2 2 0 012-2h3.414z" clipRule="evenodd" />
              ) : (
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              )}
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          </div>
        </div>

        {/* Screen Share Button */}
        <div className="relative group">
          <button
            onClick={onToggleScreenShare}
            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isScreenSharing ? 'Stop sharing' : 'Share screen'}
          </div>
        </div>

        {/* Record Button */}
        <div className="relative group">
          <button
            onClick={onToggleRecording}
            className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="6" />
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isRecording ? 'Stop recording' : 'Start recording'}
          </div>
        </div>

        <div className="w-px h-8 bg-gray-700 mx-2"></div>

        {/* Chat Button */}
        <div className="relative group">
          <button
            onClick={onToggleChat}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-300 transform hover:scale-110"
            title="Toggle chat"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat
          </div>
        </div>

        {/* Participants Button */}
        <div className="relative group">
          <button
            onClick={onToggleParticipants}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-300 transform hover:scale-110"
            title="View participants"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Participants
          </div>
        </div>

        <div className="w-px h-8 bg-gray-700 mx-2"></div>

        {/* Leave Button */}
        <div className="relative group">
          <button
            onClick={onLeaveMeeting}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-110"
            title="Leave meeting"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Leave meeting
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlBar
