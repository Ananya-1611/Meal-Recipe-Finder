// src/components/VoiceAssistant.jsx
import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceAssistant = ({ isListening, setIsListening, onCommand }) => {
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Check if speech recognition is supported
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      setSupported(false);
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    let recognition = null;
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Voice recognition started');
        setError(null);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log('Voice command:', transcript);
        
        if (transcript.includes('hello chef') || transcript.includes('hey chef')) {
          const welcomeSpeech = new SpeechSynthesisUtterance('Hello! What recipe would you like to find today?');
          window.speechSynthesis.speak(welcomeSpeech);
        } else {
          onCommand(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please enable microphone permissions.');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected');
          // This is common and not a critical error
        } else {
          setError(`Error: ${event.error}. Try reactivating the voice assistant.`);
        }
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        // Only restart if still in listening mode and no errors
        if (isListening && !error) {
          try {
            recognition.start();
            console.log('Restarted recognition');
          } catch (err) {
            console.error('Failed to restart recognition', err);
          }
        }
      };
      
      // Start recognition if listening is enabled
      if (isListening) {
        try {
          recognition.start();
          console.log('Starting speech recognition');
        } catch (err) {
          console.error('Error starting speech recognition:', err);
          setError('Failed to start speech recognition. Try refreshing the page.');
        }
      }
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setError('Failed to initialize speech recognition.');
      setSupported(false);
    }
    
    // Cleanup function
    return () => {
      if (recognition) {
        try {
          recognition.stop();
          console.log('Stopping speech recognition');
        } catch (err) {
          console.error('Error stopping speech recognition:', err);
        }
      }
    };
  }, [isListening, onCommand, error]);
  
  const toggleListening = () => {
    if (!supported) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }
    
    if (!isListening) {
      setError(null);
      const speech = new SpeechSynthesisUtterance('Voice assistant activated. You can say "search for pasta" or "find chicken recipes"');
      window.speechSynthesis.speak(speech);
    } else {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance('Voice assistant deactivated');
      window.speechSynthesis.speak(speech);
    }
    setIsListening(!isListening);
  };
  
  return (
    <div className="voice-assistant">
      <button 
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        aria-label={isListening ? 'Disable voice assistant' : 'Enable voice assistant'}
        disabled={!supported}
      >
        {isListening ? <Mic size={24} /> : <MicOff size={24} />}
        {isListening ? 'Listening...' : 'Enable Voice'}
      </button>
      
      {error && (
        <div className="voice-error">
          {error}
        </div>
      )}
      
      {isListening && !error && (
        <div className="voice-instructions">
          <p>Try saying:</p>
          <ul>
            <li>"Search for pasta recipes"</li>
            <li>"Find chicken curry"</li>
            <li>"Read recipe" (when a recipe is selected)</li>
            <li>"Stop reading"</li>
          </ul>
        </div>
      )}
      
      {!supported && (
        <div className="voice-error">
          Speech recognition is not supported in this browser. Please try Chrome or Edge.
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;