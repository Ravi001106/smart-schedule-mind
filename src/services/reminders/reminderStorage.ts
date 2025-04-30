
import { Reminder } from './reminderTypes';

// Mock database using localStorage
const STORAGE_KEY = 'voice-reminders';

// Load reminders from localStorage
export const loadReminders = (): Reminder[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.map((reminder: any) => ({
      ...reminder,
      dateTime: new Date(reminder.dateTime),
      createdAt: new Date(reminder.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load reminders:', error);
    return [];
  }
};

// Save reminders to localStorage
export const saveReminders = (reminders: Reminder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error('Failed to save reminders:', error);
  }
};
