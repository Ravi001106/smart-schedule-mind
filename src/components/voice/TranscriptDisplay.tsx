
import React from "react";

interface TranscriptDisplayProps {
  transcript: string;
}

const TranscriptDisplay = ({ transcript }: TranscriptDisplayProps) => {
  if (!transcript) return null;
  
  return (
    <div className="bg-muted p-3 rounded-lg w-full max-h-24 overflow-y-auto">
      <p className="text-sm">{transcript}</p>
    </div>
  );
};

export default TranscriptDisplay;
