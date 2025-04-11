function VoiceAssistant({ isListening, transcript, speaking, startListening, stopListening }) {
  return (
    <div className="voice-assistant">
      <button 
        className={`voice-button ${isListening ? 'listening' : ''} ${speaking ? 'speaking' : ''}`} 
        onClick={isListening ? stopListening : startListening}
        title={isListening ? 'Stop listening' : 'Start voice assistant'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isListening ? (
            // Stop icon
            <rect x="4" y="4" width="16" height="16" rx="2" />
          ) : speaking ? (
            // Speaking icon (sound waves)
            <>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </>
          ) : (
            // Microphone icon
            <>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </>
          )}
        </svg>
      </button>
      
      {isListening && (
        <div className="voice-indicator">
          <div className="pulse-rings">
            <div className="ring"></div>
            <div className="ring"></div>
            <div className="ring"></div>
          </div>
          <p>Listening...</p>
        </div>
      )}
      
      {transcript && (
        <div className="transcript">
          <p>"{transcript}"</p>
        </div>
      )}
    </div>
  );
}

export default VoiceAssistant;