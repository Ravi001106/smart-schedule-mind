
import React from "react";

interface StatusTextProps {
  status: string;
}

const StatusText = ({ status }: StatusTextProps) => {
  return (
    <p className="text-sm text-muted-foreground mt-2">
      {status === 'inactive' && "Tap to speak"}
      {status === 'listening' && "Listening..."}
      {status === 'processing' && "Processing..."}
      {status === 'error' && "Error - Try again"}
    </p>
  );
};

export default StatusText;
