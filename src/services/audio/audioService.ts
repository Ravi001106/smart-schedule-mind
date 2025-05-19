import { getAllRingtones } from '../ringtones/ringtoneService';

// Audio objects cache to prevent issues with multiple audio instances
const audioCache: Record<string, HTMLAudioElement> = {};

// Keep track of user interaction status
let hasUserInteraction = false;

// Set user interaction flag when user interacts with the page
const setupUserInteractionListener = () => {
  if (typeof window !== 'undefined') {
    const setUserInteracted = () => {
      hasUserInteraction = true;
      // Remove listener once interaction is detected
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.removeEventListener(event, setUserInteracted);
      });
    };
    
    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, setUserInteracted);
    });
  }
};

// Setup interaction listener when module loads
setupUserInteractionListener();

// Preload audio files to ensure they're ready to play
export const preloadAudioFiles = () => {
  try {
    // Get all available ringtones
    const allRingtones = getAllRingtones();
    
    // Preload all ringtones
    Object.entries(allRingtones).forEach(([type, src]) => {
      try {
        // Skip data URLs as they're already loaded
        if (src.startsWith('data:')) return;
        
        const audio = new Audio();
        audio.preload = 'auto';
        
        // Add error handling to prevent console errors
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to preload audio: ${type}`, e.error);
        }, { once: true });
        
        // Set crossOrigin for external URLs
        audio.crossOrigin = "anonymous";
        audio.src = src;
        audio.load();
        
        // Store in cache for future use
        audioCache[type] = audio;
      } catch (error) {
        console.warn(`Error preloading audio: ${type}`, error);
      }
    });
  } catch (error) {
    console.error('Error in preloadAudioFiles:', error);
  }
};

// Play notification sound based on type and selected ringtone
export const playNotificationSound = (type: 'alarm' | 'ring' | 'call', customRingtone?: string): void => {
  console.log(`Playing ${customRingtone || type} sound`);
  
  try {
    // Get all available ringtones
    const allRingtones = getAllRingtones();
    
    // Determine which sound to play
    let soundKey = customRingtone || type;
    if (!allRingtones[soundKey]) {
      // Fallback to type-based sounds if custom ringtone not found
      soundKey = type === 'alarm' ? 'classic' : 
                 type === 'ring' ? 'gentle' : 'urgent';
    }
    
    const soundSrc = allRingtones[soundKey];
    
    // Handle base64 data URLs differently from remote URLs
    const isDataUrl = soundSrc.startsWith('data:');
    
    // Create a new audio element for each play to avoid issues
    const audio = new Audio();
    audio.volume = 1.0;
    
    // Add event listeners before setting the src
    audio.addEventListener('canplaythrough', () => {
      playWithUserInteraction(audio);
    }, { once: true });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      // Try fallback if available
      tryFallbackAudio();
    }, { once: true });
    
    // Set src and load (after adding event listeners)
    if (!isDataUrl) {
      audio.crossOrigin = "anonymous";
    }
    audio.src = soundSrc;
    audio.load();
    
    // Function to handle playback with user interaction requirement
    function playWithUserInteraction(audioElement: HTMLAudioElement) {
      if (hasUserInteraction) {
        playAudioWithLoops(audioElement);
      } else {
        // Wait for user interaction
        const userInteractionHandler = () => {
          playAudioWithLoops(audioElement);
          ['click', 'touchstart', 'keydown'].forEach(event => {
            document.removeEventListener(event, userInteractionHandler);
          });
        };
        
        ['click', 'touchstart', 'keydown'].forEach(event => {
          document.addEventListener(event, userInteractionHandler, { once: true });
        });
        
        // Notify user that interaction is needed
        console.log("Waiting for user interaction to play audio");
      }
    }
    
    // Function to play audio with loops
    function playAudioWithLoops(audioElement: HTMLAudioElement) {
      let playCount = 0;
      const maxPlays = 3;
      
      audioElement.onended = () => {
        playCount++;
        if (playCount < maxPlays) {
          setTimeout(() => {
            audioElement.play().catch(e => console.error('Failed to replay sound:', e));
          }, 500);
        }
      };
      
      audioElement.play()
        .then(() => console.log("Audio playback started successfully"))
        .catch(e => {
          console.error("Playback failed:", e);
          tryFallbackAudio();
        });
    }
    
    // Fallback audio (Web Audio API)
    function tryFallbackAudio() {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = type === 'alarm' ? 800 : 
                                     type === 'ring' ? 600 : 400;
        
        gainNode.gain.value = 0.5;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 1000);
        
        console.log("Using fallback audio tone");
      } catch (e) {
        console.error("Fallback audio failed:", e);
      }
    }
    
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Initialize audio preloading when the module loads
preloadAudioFiles();
