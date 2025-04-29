
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface MicButtonProps {
  status: string;
  onClick: () => void;
}

const MicButton = ({ status, onClick }: MicButtonProps) => {
  const isListening = status === 'listening';
  
  return (
    <Button 
      onClick={onClick}
      disabled={status === 'processing' || status === 'error'}
      variant={isListening ? "destructive" : "default"}
      size="lg"
      className={`rounded-full h-16 w-16 ${isListening ? 'pulsing-mic' : ''}`}
    >
      {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
    </Button>
  );
};

export default MicButton;
