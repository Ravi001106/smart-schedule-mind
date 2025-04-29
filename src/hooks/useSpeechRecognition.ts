
import { useState, useRef, useEffect, useCallback } from 'react';
import { setupSpeechRecognition, SpeechRecognitionStatus } from "@/utils/speechRecognition";
import { toast } from "@/hooks/use-toast";

export function useSpeechRecognition(onFinalResult: (text: string) => void) {
  const [status, setStatus] = useState<SpeechRecognitionStatus>('inactive');
  const [transcript, setTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    recognitionRef.current = setupSpeechRecognition();
    
    if (recognitionRef.current) {
      recognitionRef.current.onstart = () => {
        setStatus('listening');
        setTranscript('');
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript;
        
        setTranscript(transcriptText);
        
        if (result.isFinal) {
          onFinalResult(transcriptText);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setStatus('error');
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
      };
      
      recognitionRef.current.onend = () => {
        if (status !== 'processing') {
          setStatus('inactive');
        }
      };
    } else {
      setStatus('error');
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Try using Chrome.",
        variant: "destructive",
      });
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onFinalResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && status !== 'listening') {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast({
          title: "Voice Recognition Error",
          description: "Failed to start voice recognition. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [status]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && status === 'listening') {
      recognitionRef.current.stop();
    }
  }, [status]);

  return {
    status,
    transcript,
    startListening,
    stopListening,
    setStatus,
  };
}
