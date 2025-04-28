
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";
import { setupSpeechRecognition, SpeechRecognitionStatus, SpeechResult } from "@/utils/speechRecognition";
import { toast } from "@/hooks/use-toast";
import { addReminder, parseDateFromText } from "@/services/reminderService";

interface VoiceAssistantProps {
  onNewReminder: () => void;
}

const VoiceAssistant = ({ onNewReminder }: VoiceAssistantProps) => {
  const [status, setStatus] = useState<SpeechRecognitionStatus>('inactive');
  const [transcript, setTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const processingTimeoutRef = useRef<number | null>(null);

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
          processVoiceCommand(transcriptText);
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
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

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

  const processVoiceCommand = useCallback((text: string) => {
    setStatus('processing');
    
    // Normalize the text
    const normalizedText = text.toLowerCase().trim();
    
    // Simple command detection
    if (normalizedText.includes('remind me to') || normalizedText.includes('add reminder')) {
      // Extract reminder details
      let title = '';
      let description = '';
      let dateTime = new Date();
      let priority = 'normal';
      let notificationType = 'alarm';

      // Extract title (text between "remind me to" and any time indicators)
      const titleMatch = normalizedText.match(/remind me to (.*?)(?:at|in|tomorrow|when|today|on|by|every|after|before|urgent|important|call|ring|alarm)/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      } else {
        // If no time indicators, take everything after "remind me to"
        const simpleTitleMatch = normalizedText.match(/remind me to (.*)/i);
        if (simpleTitleMatch) {
          title = simpleTitleMatch[1].trim();
        } else {
          // Try "add reminder" format
          const addReminderMatch = normalizedText.match(/add reminder (.*?)(?:at|in|tomorrow|when|today|on|by|every|after|before|urgent|important|call|ring|alarm)/i);
          if (addReminderMatch) {
            title = addReminderMatch[1].trim();
          } else {
            const simpleAddMatch = normalizedText.match(/add reminder (.*)/i);
            if (simpleAddMatch) {
              title = simpleAddMatch[1].trim();
            }
          }
        }
      }
      
      // Check priority
      if (normalizedText.includes('urgent') || normalizedText.includes('important')) {
        priority = 'urgent';
      }
      
      // Check notification type
      if (normalizedText.includes('call')) {
        notificationType = 'call';
      } else if (normalizedText.includes('ring')) {
        notificationType = 'ring';
      }
      
      // Parse date and time
      const parsedDate = parseDateFromText(normalizedText);
      if (parsedDate) {
        dateTime = parsedDate;
      }
      
      // Capitalize the first letter of the title
      title = title.charAt(0).toUpperCase() + title.slice(1);
      
      // Add the reminder
      if (title) {
        const reminder = addReminder({
          title,
          description,
          dateTime,
          priority: priority as 'normal' | 'urgent',
          notificationType: notificationType as 'alarm' | 'ring' | 'call'
        });
        
        onNewReminder();
        
        toast({
          title: "Reminder Added",
          description: `"${title}" scheduled for ${dateTime.toLocaleString()}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Could Not Add Reminder",
          description: "I didn't understand what to remind you about. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Command Not Recognized",
        description: "Try saying 'remind me to' followed by your reminder.",
        variant: "default",
      });
    }
    
    // Reset after processing
    processingTimeoutRef.current = window.setTimeout(() => {
      setStatus('inactive');
      setTranscript('');
    }, 2000);
  }, [onNewReminder]);

  return (
    <Card className="p-4 relative">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-xl font-heading">Voice Assistant</h2>
        
        <div className="flex flex-col items-center justify-center py-4">
          <Button 
            onClick={status === 'listening' ? stopListening : startListening}
            disabled={status === 'processing' || status === 'error'}
            variant={status === 'listening' ? "destructive" : "default"}
            size="lg"
            className={`rounded-full h-16 w-16 ${status === 'listening' ? 'pulsing-mic' : ''}`}
          >
            {status === 'listening' ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </Button>
          
          <p className="text-sm text-muted-foreground mt-2">
            {status === 'inactive' && "Tap to speak"}
            {status === 'listening' && "Listening..."}
            {status === 'processing' && "Processing..."}
            {status === 'error' && "Error - Try again"}
          </p>
        </div>
        
        {transcript && (
          <div className="bg-muted p-3 rounded-lg w-full max-h-24 overflow-y-auto">
            <p className="text-sm">{transcript}</p>
          </div>
        )}
        
        <div className="w-full text-center">
          <p className="text-sm text-muted-foreground">
            Try saying: "Remind me to call John tomorrow at 2pm"
          </p>
        </div>
      </div>
    </Card>
  );
};

export default VoiceAssistant;
