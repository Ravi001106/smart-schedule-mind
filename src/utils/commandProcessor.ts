
import { toast } from "@/hooks/use-toast";
import { addReminder, parseDateFromText, getAllCustomRingtones, ringtones } from "@/services/reminderService";
import { SpeechRecognitionStatus } from "@/utils/speechRecognition";

export const processVoiceCommand = (
  text: string, 
  onNewReminder: () => void, 
  setStatus: (status: SpeechRecognitionStatus) => void
) => {
  setStatus('processing');
  
  // Normalize the text
  const normalizedText = text.toLowerCase().trim();
  
  // Simple command detection
  if (normalizedText.includes('remind me to') || normalizedText.includes('add reminder')) {
    // Extract reminder details
    let title = '';
    let description = '';
    let dateTime = new Date();
    let priority = 'normal';
    let notificationType = 'alarm';
    let ringtone = '';

    // Extract title (text between "remind me to" and any time indicators)
    const titleMatch = normalizedText.match(/remind me to (.*?)(?:at|in|tomorrow|when|today|on|by|every|after|before|urgent|important|call|ring|alarm|with|using)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      // If no time indicators, take everything after "remind me to"
      const simpleTitleMatch = normalizedText.match(/remind me to (.*)/i);
      if (simpleTitleMatch) {
        title = simpleTitleMatch[1].trim();
      } else {
        // Try "add reminder" format
        const addReminderMatch = normalizedText.match(/add reminder (.*?)(?:at|in|tomorrow|when|today|on|by|every|after|before|urgent|important|call|ring|alarm|with|using)/i);
        if (addReminderMatch) {
          title = addReminderMatch[1].trim();
        } else {
          const simpleAddMatch = normalizedText.match(/add reminder (.*)/i);
          if (simpleAddMatch) {
            title = simpleAddMatch[1].trim();
          }
        }
      }
    }
    
    // Check priority
    if (normalizedText.includes('urgent') || normalizedText.includes('important')) {
      priority = 'urgent';
    }
    
    // Check notification type
    if (normalizedText.includes('call')) {
      notificationType = 'call';
    } else if (normalizedText.includes('ring')) {
      notificationType = 'ring';
    }
    
    // Parse date and time
    const parsedDate = parseDateFromText(normalizedText);
    if (parsedDate) {
      dateTime = parsedDate;
    }
    
    // Check for ringtone specification
    const ringtoneMatch = normalizedText.match(/with (.*?) (?:ringtone|sound|tone)/i) || 
                          normalizedText.match(/using (.*?) (?:ringtone|sound|tone)/i);
    
    if (ringtoneMatch) {
      const requestedTone = ringtoneMatch[1].toLowerCase().trim();
      
      // Get all available ringtones
      const allRingtones = {
        ...ringtones,
        ...getAllCustomRingtones()
      };
      
      // Check for exact match
      if (allRingtones[requestedTone]) {
        ringtone = requestedTone;
      } else {
        // Check for partial matches
        const possibleMatches = Object.keys(allRingtones).filter(tone => 
          tone.includes(requestedTone) || requestedTone.includes(tone)
        );
        
        if (possibleMatches.length > 0) {
          ringtone = possibleMatches[0]; // Use the first match
        }
      }
    }
    
    // Capitalize the first letter of the title
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    // Add the reminder
    if (title) {
      const reminder = addReminder({
        title,
        description,
        dateTime,
        priority: priority as 'normal' | 'urgent',
        notificationType: notificationType as 'alarm' | 'ring' | 'call',
        ringtone: ringtone || undefined
      });
      
      onNewReminder();
      
      toast({
        title: "Reminder Added",
        description: `"${title}" scheduled for ${dateTime.toLocaleString()}`,
        variant: "default",
      });
    } else {
      toast({
        title: "Could Not Add Reminder",
        description: "I didn't understand what to remind you about. Please try again.",
        variant: "destructive",
      });
    }
  } else {
    toast({
      title: "Command Not Recognized",
      description: "Try saying 'remind me to' followed by your reminder.",
      variant: "default",
    });
  }
  
  // Reset status after a delay
  setTimeout(() => {
    setStatus('inactive');
  }, 2000);
};
