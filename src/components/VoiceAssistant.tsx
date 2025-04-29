
import React, { useRef } from 'react';
import { Card } from "@/components/ui/card";
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { processVoiceCommand } from '@/utils/commandProcessor';
import MicButton from './voice/MicButton';
import StatusText from './voice/StatusText';
import TranscriptDisplay from './voice/TranscriptDisplay';

interface VoiceAssistantProps {
  onNewReminder: () => void;
}

const VoiceAssistant = ({ onNewReminder }: VoiceAssistantProps) => {
  const processingTimeoutRef = useRef<number | null>(null);
  
  const handleFinalResult = (text: string) => {
    processVoiceCommand(text, onNewReminder, setStatus);
  };
  
  const {
    status,
    transcript,
    startListening,
    stopListening,
    setStatus
  } = useSpeechRecognition(handleFinalResult);

  const toggleListening = () => {
    if (status === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };
  
  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="p-4 relative">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-xl font-heading">Voice Assistant</h2>
        
        <div className="flex flex-col items-center justify-center py-4">
          <MicButton status={status} onClick={toggleListening} />
          <StatusText status={status} />
        </div>
        
        <TranscriptDisplay transcript={transcript} />
        
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
