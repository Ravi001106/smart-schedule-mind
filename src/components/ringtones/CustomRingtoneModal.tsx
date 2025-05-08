
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RingtoneModalContent from './RingtoneModalContent';

interface CustomRingtoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRingtoneAdded: () => void;
}

const CustomRingtoneModal = ({ open, onOpenChange, onRingtoneAdded }: CustomRingtoneModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Ringtone</DialogTitle>
        </DialogHeader>
        
        <RingtoneModalContent 
          onRingtoneAdded={onRingtoneAdded} 
          onOpenChange={onOpenChange} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default CustomRingtoneModal;
