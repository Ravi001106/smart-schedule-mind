
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

// Preload audio files to work around autoplay restrictions
const preloadAudio = () => {
  const audioSources = [
    'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3',
    'https://assets.mixkit.co/sfx/preview/mixkit-classic-short-alarm-993.mp3',
    'https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3'
  ];
  
  audioSources.forEach(src => {
    const audio = new Audio();
    audio.src = src;
    audio.preload = 'auto';
    
    // Just loading the audio in memory
    audio.load();
    
    // Some browsers require a user interaction before playing audio
    document.addEventListener('click', function initAudio() {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        document.removeEventListener('click', initAudio);
      }).catch(e => console.log('Audio preload interaction required'));
    });
  });
};

const queryClient = new QueryClient();

const App = () => {
  // Initialize audio preloading
  useEffect(() => {
    preloadAudio();
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
