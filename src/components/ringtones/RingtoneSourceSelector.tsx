
import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe, Upload } from "lucide-react";

interface RingtoneSourceSelectorProps {
  isUrlMode: boolean;
  onToggleMode: (isUrl: boolean) => void;
}

const RingtoneSourceSelector = ({ isUrlMode, onToggleMode }: RingtoneSourceSelectorProps) => {
  return (
    <div className="flex items-center space-x-4">
      <Button
        type="button"
        variant={isUrlMode ? "default" : "outline"}
        onClick={() => onToggleMode(true)}
        className="flex-1"
      >
        <Globe className="mr-2 h-4 w-4" />
        URL
      </Button>
      <Button
        type="button"
        variant={!isUrlMode ? "default" : "outline"}
        onClick={() => onToggleMode(false)}
        className="flex-1"
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload
      </Button>
    </div>
  );
};

export default RingtoneSourceSelector;
