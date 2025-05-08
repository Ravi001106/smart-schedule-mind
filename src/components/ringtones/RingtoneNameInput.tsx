
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RingtoneNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

const RingtoneNameInput = ({ value, onChange }: RingtoneNameInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="name">Ringtone Name</Label>
      <Input
        id="name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a name for your ringtone"
      />
    </div>
  );
};

export default RingtoneNameInput;
