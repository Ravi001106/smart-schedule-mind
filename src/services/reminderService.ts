
import { toast } from "@/hooks/use-toast";

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dateTime: Date;
  isCompleted: boolean;
  notificationType: 'alarm' | 'ring' | 'call';
  priority: 'normal' | 'urgent';
  createdAt: Date;
  ringtone?: string;
}

// Available ringtones with their URLs
export const ringtones = {
  'classic': 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3',
  'gentle': 'https://assets.mixkit.co/sfx/preview/mixkit-classic-short-alarm-993.mp3',
  'urgent': 'https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3',
  'bell': 'https://assets.mixkit.co/sfx/preview/mixkit-elevator-tone-2864.mp3',
  'chime': 'https://assets.mixkit.co/sfx/preview/mixkit-interface-hint-notification-911.mp3',
};

// Mock database using localStorage
const STORAGE_KEY = 'voice-reminders';

// Load reminders from localStorage
const loadReminders = (): Reminder[] => {
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
const saveReminders = (reminders: Reminder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error('Failed to save reminders:', error);
  }
};

// Add a new reminder
const addReminder = (reminder: Omit<Reminder, 'id' | 'isCompleted' | 'createdAt'>): Reminder => {
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
const updateReminder = (id: string, updates: Partial<Reminder>): Reminder | null => {
  const reminders = loadReminders();
  const index = reminders.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  reminders[index] = { ...reminders[index], ...updates };
  saveReminders(reminders);
  return reminders[index];
};

// Delete a reminder
const deleteReminder = (id: string): boolean => {
  const reminders = loadReminders();
  const filteredReminders = reminders.filter(r => r.id !== id);
  
  if (filteredReminders.length === reminders.length) {
    return false; // No reminder was deleted
  }
  
  saveReminders(filteredReminders);
  return true;
};

// Get all reminders
const getAllReminders = (): Reminder[] => {
  return loadReminders();
};

// Mark a reminder as completed
const completeReminder = (id: string): Reminder | null => {
  return updateReminder(id, { isCompleted: true });
};

// Audio objects cache to prevent issues with multiple audio instances
const audioCache: Record<string, HTMLAudioElement> = {};

// Preload audio files to ensure they're ready to play
const preloadAudioFiles = () => {
  Object.entries(ringtones).forEach(([type, src]) => {
    const audio = new Audio();
    audio.src = src;
    audio.preload = 'auto';
    audio.load(); // Explicitly load the audio file
    audioCache[type] = audio;
  });
};

// Initialize the audio cache when the module loads
preloadAudioFiles();

// Check if there are any reminders due now
const checkDueReminders = (): void => {
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

// Play notification sound based on type and selected ringtone
const playNotificationSound = (type: 'alarm' | 'ring' | 'call', customRingtone?: string): void => {
  console.log(`Playing ${customRingtone || type} sound`);
  
  try {
    // Determine which sound to play
    let soundKey = customRingtone || type;
    if (!ringtones[soundKey]) {
      // Fallback to type-based sounds if custom ringtone not found
      soundKey = type === 'alarm' ? 'classic' : 
                 type === 'ring' ? 'gentle' : 'urgent';
    }
    
    // Get the cached audio or create a new one if not available
    let audio = audioCache[soundKey];
    
    if (!audio) {
      audio = new Audio();
      audio.src = ringtones[soundKey];
      
      // Save to cache for future use
      audioCache[soundKey] = audio;
    }
    
    // Reset the audio to the beginning and play it
    audio.currentTime = 0;
    
    // Set audio to loop a few times for longer notification
    let playCount = 0;
    const maxPlays = 3;
    
    audio.onended = () => {
      playCount++;
      if (playCount < maxPlays) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error('Failed to replay notification sound:', e));
      }
    };
    
    // Play the sound with a Promise to catch any errors
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Audio playback failed:', error);
        // Try an alternative approach for browsers with autoplay restrictions
        document.addEventListener('click', function audioUnlock() {
          audio.play().catch(e => console.error('Still failed to play after user interaction:', e));
          document.removeEventListener('click', audioUnlock);
        });
      });
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Initialize reminder checker - check every 30 seconds
const initReminderChecker = (): () => void => {
  // Immediately check for any due reminders
  checkDueReminders();
  
  const intervalId = setInterval(checkDueReminders, 30000);
  return () => clearInterval(intervalId);
};

// Parse natural language date strings
const parseDateFromText = (text: string): Date | null => {
  const now = new Date();
  
  // Match patterns like "tomorrow at 3pm" or "in 5 minutes"
  if (text.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Try to extract time if specified
    const timeMatch = text.match(/(\d{1,2})(:\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2].substring(1)) : 0;
      const isPM = timeMatch[3]?.toLowerCase() === 'pm';
      
      tomorrow.setHours(isPM && hours < 12 ? hours + 12 : hours);
      tomorrow.setMinutes(minutes);
    } else {
      // Default to 9 AM if no time specified
      tomorrow.setHours(9, 0, 0, 0);
    }
    
    return tomorrow;
  }
  
  // Match "in X minutes/hours"
  const inTimeMatch = text.match(/in\s+(\d+)\s+(minute|hour|day)s?/i);
  if (inTimeMatch) {
    const amount = parseInt(inTimeMatch[1]);
    const unit = inTimeMatch[2].toLowerCase();
    
    const result = new Date(now);
    if (unit === 'minute') {
      result.setMinutes(result.getMinutes() + amount);
    } else if (unit === 'hour') {
      result.setHours(result.getHours() + amount);
    } else if (unit === 'day') {
      result.setDate(result.getDate() + amount);
    }
    
    return result;
  }
  
  // Try to parse today at specific time
  const todayTimeMatch = text.match(/at\s+(\d{1,2})(:\d{2})?\s*(am|pm)/i);
  if (todayTimeMatch) {
    const hours = parseInt(todayTimeMatch[1]);
    const minutes = todayTimeMatch[2] ? parseInt(todayTimeMatch[2].substring(1)) : 0;
    const isPM = todayTimeMatch[3]?.toLowerCase() === 'pm';
    
    const result = new Date(now);
    result.setHours(isPM && hours < 12 ? hours + 12 : hours);
    result.setMinutes(minutes);
    result.setSeconds(0);
    
    // If the time is already past for today, assume tomorrow
    if (result < now) {
      result.setDate(result.getDate() + 1);
    }
    
    return result;
  }
  
  return null;
};

export {
  addReminder,
  updateReminder,
  deleteReminder,
  getAllReminders,
  completeReminder,
  checkDueReminders,
  initReminderChecker,
  parseDateFromText
};
