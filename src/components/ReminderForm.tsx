
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addReminder, Reminder } from '@/services/reminderService';

interface ReminderFormProps {
  onAddReminder: () => void;
}

const ReminderForm = ({ onAddReminder }: ReminderFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [notificationType, setNotificationType] = useState<'alarm' | 'ring' | 'call'>('alarm');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dateTime) return;
    
    const reminder = addReminder({
      title,
      description,
      dateTime: new Date(dateTime),
      priority,
      notificationType
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
        
        <Button type="submit" className="w-full">Add Reminder</Button>
      </form>
    </Card>
  );
};

export default ReminderForm;
