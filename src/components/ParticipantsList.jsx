function ParticipantsList({ participants, currentUsername, onClose }) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Participants ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.userId}
            className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
          >
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-semibold">
              {participant.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {participant.username}
                {participant.username === currentUsername && (
                  <span className="text-gray-400 text-sm ml-2">(You)</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ParticipantsList
