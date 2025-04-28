
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlarmClock, Clock } from "lucide-react";
import { Reminder, updateReminder, deleteReminder, completeReminder } from '@/services/reminderService';

interface ReminderCardProps {
  reminder: Reminder;
  onUpdate: () => void;
}

const ReminderCard = ({ reminder, onUpdate }: ReminderCardProps) => {
  const handleComplete = () => {
    completeReminder(reminder.id);
    onUpdate();
  };
  
  const handleDelete = () => {
    deleteReminder(reminder.id);
    onUpdate();
  };
  
  const formatTimeLeft = (): string => {
    const now = new Date();
    const reminderTime = new Date(reminder.dateTime);
    const diffMs = reminderTime.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Overdue';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} left`;
    } else {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} left`;
    }
  };
  
  const getNotificationIcon = () => {
    switch (reminder.notificationType) {
      case 'alarm':
        return <AlarmClock className="h-4 w-4" />;
      case 'ring':
        return <Bell className="h-4 w-4" />;
      case 'call':
        return <Bell className="h-4 w-4" />; // Using Bell for now
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  return (
    <Card className={`reminder-card ${reminder.priority === 'urgent' ? 'urgent' : ''} ${reminder.isCompleted ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className={reminder.isCompleted ? 'line-through text-muted-foreground' : ''}>
            {reminder.title}
          </CardTitle>
          <Badge variant={reminder.priority === 'urgent' ? 'destructive' : 'secondary'}>
            {reminder.priority}
          </Badge>
        </div>
        <CardDescription>
          {reminder.dateTime.toLocaleString()} • {formatTimeLeft()}
        </CardDescription>
      </CardHeader>
      
      {reminder.description && (
        <CardContent className="py-2">
          <p className="text-sm">{reminder.description}</p>
        </CardContent>
      )}
      
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          {getNotificationIcon()}
          <span className="ml-1 capitalize">{reminder.notificationType}</span>
        </div>
        
        <div className="flex space-x-2">
          {!reminder.isCompleted && (
            <Button variant="outline" size="sm" onClick={handleComplete}>
              Complete
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReminderCard;
