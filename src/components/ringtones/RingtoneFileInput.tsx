
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RingtoneFileInputProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

const RingtoneFileInput = ({ file, onChange }: RingtoneFileInputProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="file">Upload Audio File</Label>
      <Input
        id="file"
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
      />
      <p className="text-sm text-muted-foreground">
        {file ? `Selected: ${file.name}` : 'Select an audio file from your device'}
      </p>
    </div>
  );
};

export default RingtoneFileInput;
