
import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import RingtoneNameInput from './RingtoneNameInput';
import RingtoneSourceSelector from './RingtoneSourceSelector';
import RingtoneUrlInput from './RingtoneUrlInput';
import RingtoneFileInput from './RingtoneFileInput';
import { useRingtoneForm } from './useRingtoneForm';

interface RingtoneModalContentProps {
  onRingtoneAdded: () => void;
  onOpenChange: (open: boolean) => void;
}

const RingtoneModalContent = ({ onRingtoneAdded, onOpenChange }: RingtoneModalContentProps) => {
  const {
    name,
    setName,
    url,
    setUrl,
    isUrlMode,
    setIsUrlMode,
    file,
    setFile,
    isLoading,
    handleSubmit
  } = useRingtoneForm(onRingtoneAdded, () => onOpenChange(false));

  return (
    <div className="grid gap-4 py-4">
      <RingtoneNameInput value={name} onChange={setName} />
      
      <RingtoneSourceSelector 
        isUrlMode={isUrlMode} 
        onToggleMode={setIsUrlMode} 
      />
      
      {isUrlMode ? (
        <RingtoneUrlInput value={url} onChange={setUrl} />
      ) : (
        <RingtoneFileInput file={file} onChange={setFile} />
      )}
      
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={isLoading}>
          Add Ringtone
        </Button>
      </DialogFooter>
    </div>
  );
};

export default RingtoneModalContent;
