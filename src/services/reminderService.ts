
// This file serves as the main export point for all reminder-related services
import { Reminder } from './reminders/reminderTypes';
import { 
  addReminder, 
  updateReminder, 
  deleteReminder, 
  getAllReminders, 
  completeReminder, 
  checkDueReminders, 
  initReminderChecker 
} from './reminders/reminderService';
import { ringtones, getAllCustomRingtones, addCustomRingtone, removeCustomRingtone } from './ringtones/ringtoneService';
import { parseDateFromText } from './date/dateService';
import { playNotificationSound } from './audio/audioService';

// Re-export everything for backwards compatibility
export {
  // Reminder types
  Reminder,
  
  // Reminder operations
  addReminder,
  updateReminder,
  deleteReminder,
  getAllReminders,
  completeReminder,
  checkDueReminders,
  initReminderChecker,
  
  // Ringtone operations
  ringtones,
  getAllCustomRingtones,
  addCustomRingtone,
  removeCustomRingtone,
  
  // Date parsing
  parseDateFromText,
  
  // Audio operations
  playNotificationSound
};
