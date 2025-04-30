
// Storage key for custom ringtones
const CUSTOM_RINGTONES_KEY = 'voice-reminders-custom-ringtones';

// Available default ringtones with their URLs
export const ringtones = {
  'classic': 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3',
  'gentle': 'https://assets.mixkit.co/sfx/preview/mixkit-classic-short-alarm-993.mp3',
  'urgent': 'https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3',
  'bell': 'https://assets.mixkit.co/sfx/preview/mixkit-elevator-tone-2864.mp3',
  'chime': 'https://assets.mixkit.co/sfx/preview/mixkit-interface-hint-notification-911.mp3',
};

// Get all custom ringtones
export const getAllCustomRingtones = (): Record<string, string> => {
  try {
    const data = localStorage.getItem(CUSTOM_RINGTONES_KEY);
    if (!data) return {};
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load custom ringtones:', error);
    return {};
  }
};

// Add a new custom ringtone
export const addCustomRingtone = (name: string, url: string): void => {
  try {
    const customRingtones = getAllCustomRingtones();
    customRingtones[name] = url;
    localStorage.setItem(CUSTOM_RINGTONES_KEY, JSON.stringify(customRingtones));
  } catch (error) {
    console.error('Failed to save custom ringtone:', error);
  }
};

// Remove a custom ringtone
export const removeCustomRingtone = (name: string): void => {
  try {
    const customRingtones = getAllCustomRingtones();
    if (customRingtones[name]) {
      delete customRingtones[name];
      localStorage.setItem(CUSTOM_RINGTONES_KEY, JSON.stringify(customRingtones));
    }
  } catch (error) {
    console.error('Failed to remove custom ringtone:', error);
  }
};

// Get all available ringtones (default + custom)
export const getAllRingtones = (): Record<string, string> => {
  return {
    ...ringtones,
    ...getAllCustomRingtones()
  };
};
