
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { ringtones } from "@/services/reminderService";

// Improved audio preloading with better error handling and user interaction tracking
const useAudioPreload = () => {
  const [userInteracted, setUserInteracted] = useState(false);
  
  useEffect(() => {
    // Use all ringtones from the service
    const audioSources = Object.values(ringtones);
    const audioElements: HTMLAudioElement[] = [];
    
    // Function to mark user as having interacted
    const handleUserInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      
      // Try to unlock audio on all elements
      audioElements.forEach(audio => {
        try {
          const playPromise = audio.play();
          if (playPromise) {
            playPromise
              .then(() => {
                audio.pause();
                audio.currentTime = 0;
              })
              .catch(e => console.log('Audio preload awaiting further interaction'));
          }
        } catch (e) {
          console.log('Play attempt failed');
        }
      });
    };
    
    // Add interaction listeners
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    // Create and preload audio elements
    audioSources.forEach(src => {
      const audio = new Audio();
      
      // Add error handling
      audio.addEventListener('error', (e) => {
        console.warn(`Audio preload error for ${src}:`, e);
      });
      
      audio.crossOrigin = "anonymous";
      audio.preload = 'auto';
      audio.src = src;
      
      // Just loading the audio in memory
      audio.load();
      audioElements.push(audio);
    });
    
    // Expose a global function to unlock audio
    (window as any).unlockAudio = () => {
      const audio = new Audio();
      audio.src = audioSources[0]; 
      audio.load();
      
      audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          setUserInteracted(true);
          console.log('Audio unlocked by explicit call');
        })
        .catch(e => console.log('Failed to unlock audio: ', e));
    };
    
    // Try to unlock audio with a silent audio context
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // Set volume to 0 to make it silent
        gainNode.gain.value = 0;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(0);
        oscillator.stop(0.1);
        
        console.log('Audio context initialized');
      }
    } catch (e) {
      console.log('Failed to create audio context:', e);
    }
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);
  
  return userInteracted;
};

const queryClient = new QueryClient();

const App = () => {
  // Initialize audio preloading
  const hasUserInteracted = useAudioPreload();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
