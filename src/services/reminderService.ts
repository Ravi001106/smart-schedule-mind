
// This file serves as the main export point for all reminder-related services
import { addReminder, 
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
// Using 'export type' for the Reminder type to fix the TS1205 error
export type { Reminder } from './reminders/reminderTypes';
export {
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
