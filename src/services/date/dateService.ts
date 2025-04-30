
// Parse natural language date strings
export const parseDateFromText = (text: string): Date | null => {
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
