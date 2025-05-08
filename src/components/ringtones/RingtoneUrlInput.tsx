
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RingtoneUrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

const RingtoneUrlInput = ({ value, onChange }: RingtoneUrlInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="url">Ringtone URL</Label>
      <Input
        id="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/audio.mp3"
      />
      <p className="text-sm text-muted-foreground">
        Enter a direct link to an audio file (.mp3, .wav, etc.)
      </p>
    </div>
  );
};

export default RingtoneUrlInput;
