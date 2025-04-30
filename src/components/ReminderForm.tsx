import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addReminder, ringtones, getAllCustomRingtones } from '@/services/reminderService';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Volume2, Music, PlusCircle } from "lucide-react";
import CustomRingtoneModal from './CustomRingtoneModal';
import { toast } from "@/hooks/use-toast";

interface ReminderFormProps {
  onAddReminder: () => void;
}

const ReminderForm = ({ onAddReminder }: ReminderFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [notificationType, setNotificationType] = useState<'alarm' | 'ring' | 'call'>('alarm');
  const [selectedRingtone, setSelectedRingtone] = useState('classic');
  const [showCustomRingtoneModal, setShowCustomRingtoneModal] = useState(false);
  const [customRingtones, setCustomRingtones] = useState(getAllCustomRingtones());
  
  // Function to refresh the custom ringtones list
  const refreshCustomRingtones = () => {
    setCustomRingtones(getAllCustomRingtones());
  };
  
  // Get all available ringtones (default + custom)
  const getAllRingtones = () => {
    return {
      ...ringtones,
      ...customRingtones
    };
  };
  
  // Function to play a preview of the selected ringtone
  const playRingtonePreview = (ringtoneKey: string) => {
    const allRingtones = getAllRingtones();
    if (!allRingtones[ringtoneKey]) {
      console.error('Ringtone not found:', ringtoneKey);
      return;
    }
    
    // Create a new audio element for each preview
    const audio = new Audio(allRingtones[ringtoneKey]);
    audio.volume = 0.5; // Lower volume for preview
    
    // Try to play, and provide feedback if it fails
    audio.play()
      .then(() => {
        console.log('Ringtone preview playing:', ringtoneKey);
        // Stop after 2 seconds
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 2000);
      })
      .catch(e => {
        console.error('Failed to play ringtone preview:', e);
        // Try after a click if browser requires user interaction
        document.addEventListener('click', function playOnce() {
          audio.play().catch(err => console.error('Still failed to play after user interaction:', err));
          document.removeEventListener('click', playOnce);
        }, { once: true });
        
        toast({
          title: "Audio Playback Issue",
          description: "Click anywhere on the page to enable sound playback.",
          variant: "default",
        });
      });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dateTime) return;
    
    const reminder = addReminder({
      title,
      description,
      dateTime: new Date(dateTime),
      priority,
      notificationType,
      ringtone: selectedRingtone
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setDateTime('');
    setPriority('normal');
    setNotificationType('alarm');
    
    onAddReminder();
  };
  
  return (
    <Card className="p-4">
      <h2 className="text-xl font-heading mb-4">Add Reminder</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter reminder title"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea 
            id="description" 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter additional details"
            className="resize-none"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="dateTime">Date & Time</Label>
          <Input 
            id="dateTime" 
            type="datetime-local" 
            value={dateTime} 
            onChange={e => setDateTime(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label>Priority</Label>
          <RadioGroup value={priority} onValueChange={(value) => setPriority(value as 'normal' | 'urgent')} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal">Normal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="urgent" id="urgent" />
              <Label htmlFor="urgent">Urgent</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <Label htmlFor="notificationType">Notification Type</Label>
          <Select value={notificationType} onValueChange={(value) => setNotificationType(value as 'alarm' | 'ring' | 'call')}>
            <SelectTrigger id="notificationType">
              <SelectValue placeholder="Select notification type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alarm">Alarm</SelectItem>
              <SelectItem value="ring">Ring</SelectItem>
              <SelectItem value="call">Call</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="ringtone" className="flex items-center gap-2">
              Ringtone
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" type="button">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-2">
                    <h3 className="font-medium">Preview Ringtones</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on a ringtone to hear a preview
                    </p>
                    <div className="mt-2 grid gap-2">
                      {Object.keys(getAllRingtones()).map((tone) => (
                        <Button 
                          key={tone} 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => playRingtonePreview(tone)}
                          type="button"
                        >
                          <Music className="mr-2 h-4 w-4" />
                          {tone.charAt(0).toUpperCase() + tone.slice(1).replace(/-/g, ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </Label>
            <Button 
              variant="ghost" 
              size="sm" 
              type="button"
              onClick={() => setShowCustomRingtoneModal(true)}
              className="h-8 px-2"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> 
              Add Custom
            </Button>
          </div>
          
          <Select value={selectedRingtone} onValueChange={setSelectedRingtone}>
            <SelectTrigger id="ringtone">
              <SelectValue placeholder="Select a ringtone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="gentle">Gentle</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="bell">Bell</SelectItem>
              <SelectItem value="chime">Chime</SelectItem>
              
              {/* Custom ringtones */}
              {Object.keys(customRingtones).length > 0 && (
                <React.Fragment>
                  <div className="px-2 py-1.5 text-sm font-semibold">Custom Ringtones</div>
                  {Object.keys(customRingtones).map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1).replace(/-/g, ' ')}
                    </SelectItem>
                  ))}
                </React.Fragment>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" className="w-full">Add Reminder</Button>
      </form>
      
      <CustomRingtoneModal 
        open={showCustomRingtoneModal}
        onOpenChange={setShowCustomRingtoneModal}
        onRingtoneAdded={refreshCustomRingtones}
      />
    </Card>
  );
};

export default ReminderForm;
