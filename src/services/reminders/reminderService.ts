
import { toast } from "@/hooks/use-toast";
import { Reminder } from './reminderTypes';
import { loadReminders, saveReminders } from './reminderStorage';
import { playNotificationSound } from '../audio/audioService';

// Add a new reminder
export const addReminder = (reminder: Omit<Reminder, 'id' | 'isCompleted' | 'createdAt'>): Reminder => {
  const reminders = loadReminders();
  
  const newReminder: Reminder = {
    id: Date.now().toString(),
    isCompleted: false,
    createdAt: new Date(),
    ...reminder
  };
  
  reminders.push(newReminder);
  saveReminders(reminders);
  return newReminder;
};

// Update a reminder
export const updateReminder = (id: string, updates: Partial<Reminder>): Reminder | null => {
  const reminders = loadReminders();
  const index = reminders.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  reminders[index] = { ...reminders[index], ...updates };
  saveReminders(reminders);
  return reminders[index];
};

// Delete a reminder
export const deleteReminder = (id: string): boolean => {
  const reminders = loadReminders();
  const filteredReminders = reminders.filter(r => r.id !== id);
  
  if (filteredReminders.length === reminders.length) {
    return false; // No reminder was deleted
  }
  
  saveReminders(filteredReminders);
  return true;
};

// Get all reminders
export const getAllReminders = (): Reminder[] => {
  return loadReminders();
};

// Mark a reminder as completed
export const completeReminder = (id: string): Reminder | null => {
  return updateReminder(id, { isCompleted: true });
};

// Check if there are any reminders due now
export const checkDueReminders = (): void => {
  const now = new Date();
  const reminders = loadReminders();
  
  reminders.forEach(reminder => {
    if (reminder.isCompleted) return;
    
    const reminderTime = new Date(reminder.dateTime);
    // Check if reminder is due (within 1 minute)
    if (Math.abs(reminderTime.getTime() - now.getTime()) < 60000) {
      toast({
        title: `Reminder: ${reminder.title}`,
        description: reminder.description || `This is scheduled for ${reminderTime.toLocaleTimeString()}`,
        variant: reminder.priority === 'urgent' ? 'destructive' : 'default',
        duration: 10000,
      });
      
      playNotificationSound(reminder.notificationType, reminder.ringtone);
    }
  });
};

// Initialize reminder checker - check every 30 seconds
export const initReminderChecker = (): () => void => {
  // Immediately check for any due reminders
  checkDueReminders();
  
  const intervalId = setInterval(checkDueReminders, 30000);
  return () => clearInterval(intervalId);
};
