
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { ringtones } from "@/services/reminderService";

// Preload audio files to work around autoplay restrictions
const preloadAudio = () => {
  // Use all ringtones from the service
  const audioSources = Object.values(ringtones);
  
  audioSources.forEach(src => {
    const audio = new Audio();
    audio.src = src;
    audio.preload = 'auto';
    
    // Just loading the audio in memory
    audio.load();
    
    // Some browsers require a user interaction before playing audio
    const unlockAudio = () => {
      audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          document.removeEventListener('click', unlockAudio);
          console.log('Audio preloaded successfully');
        })
        .catch(e => console.log('Audio preload awaiting interaction'));
    };
    
    document.addEventListener('click', unlockAudio);
  });

  // Also create and expose a global function to unlock audio on the window object
  (window as any).unlockAudio = () => {
    const audio = new Audio(audioSources[0]);
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
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
      oscillator.connect(audioCtx.destination);
      oscillator.start(0);
      oscillator.stop(0.1);
    }
  } catch (e) {
    console.log('Failed to create audio context:', e);
  }
};

const queryClient = new QueryClient();

const App = () => {
  // Initialize audio preloading
  useEffect(() => {
    preloadAudio();
    
    // Add a click listener to the entire document to unlock audio
    const handleDocumentClick = () => {
      (window as any).unlockAudio?.();
    };
    
    document.addEventListener('click', handleDocumentClick, { once: true });
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

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
