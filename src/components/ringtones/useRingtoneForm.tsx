
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { addCustomRingtone } from '@/services/reminderService';

export const useRingtoneForm = (onSuccess: () => void, onClose: () => void) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      if (name.trim() === '') {
        toast({
          title: "Name Required",
          description: "Please enter a name for the ringtone",
          variant: "destructive",
        });
        return;
      }
      
      let ringtoneUrl = '';
      
      // For URL mode
      if (isUrlMode) {
        if (url.trim() === '') {
          toast({
            title: "URL Required",
            description: "Please enter a URL for the ringtone",
            variant: "destructive",
          });
          return;
        }
        ringtoneUrl = url;
      } 
      // For file upload mode
      else if (file) {
        // Create a local URL for the file
        ringtoneUrl = URL.createObjectURL(file);
      } else {
        toast({
          title: "File Required",
          description: "Please select an audio file",
          variant: "destructive",
        });
        return;
      }
      
      // Try playing the audio to verify it works
      try {
        const audio = new Audio(ringtoneUrl);
        await audio.play();
        setTimeout(() => audio.pause(), 200);
      } catch (error) {
        console.error("Error testing audio:", error);
        toast({
          title: "Invalid Audio",
          description: "Could not play the audio file. Please check the URL or file.",
          variant: "destructive",
        });
        return;
      }
      
      // Add the custom ringtone
      addCustomRingtone(name.toLowerCase().replace(/\s+/g, '-'), ringtoneUrl);
      
      // Reset form
      setName('');
      setUrl('');
      setFile(null);
      
      toast({
        title: "Ringtone Added",
        description: `"${name}" has been added to your ringtones`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding ringtone:", error);
      toast({
        title: "Error",
        description: "Failed to add ringtone. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    name,
    setName,
    url, 
    setUrl,
    isUrlMode,
    setIsUrlMode,
    file,
    setFile,
    isLoading,
    handleSubmit
  };
};
