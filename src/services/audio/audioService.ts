
import { getAllRingtones } from '../ringtones/ringtoneService';

// Audio objects cache to prevent issues with multiple audio instances
const audioCache: Record<string, HTMLAudioElement> = {};

// Preload audio files to ensure they're ready to play
export const preloadAudioFiles = () => {
  // Get all available ringtones
  const allRingtones = getAllRingtones();
  
  // Preload all ringtones
  Object.entries(allRingtones).forEach(([type, src]) => {
    const audio = new Audio();
    audio.src = src;
    audio.preload = 'auto';
    audio.load(); // Explicitly load the audio file
  });
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
    
    // Create a new audio element for each play to avoid issues
    const audio = new Audio(allRingtones[soundKey]);
    
    // Set volume to full
    audio.volume = 1.0;
    
    // Set audio to loop a few times for longer notification
    let playCount = 0;
    const maxPlays = 3;
    
    audio.onended = () => {
      playCount++;
      if (playCount < maxPlays) {
        setTimeout(() => {
          audio.play().catch(e => console.error('Failed to replay notification sound:', e));
        }, 500); // Adding a small delay between plays
      }
    };
    
    // Make sure we have user interaction before playing
    document.addEventListener('click', function unlockAudio() {
      audio.play()
        .then(() => {
          console.log("Audio playback started successfully");
          document.removeEventListener('click', unlockAudio);
        })
        .catch(error => {
          console.error('Audio playback failed:', error);
          // Create a fallback notification with sound
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.value = 800;
          oscillator.connect(audioContext.destination);
          oscillator.start();
          setTimeout(() => oscillator.stop(), 1000);
        });
    }, { once: true });
    
    // Try to play immediately as well (might work if user already interacted)
    audio.play()
      .then(() => console.log("Audio playback started successfully"))
      .catch(e => console.log("Waiting for user interaction to play audio"));
    
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Initialize audio preloading when the module loads
preloadAudioFiles();
