
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
        
        // Validate URL format
        try {
          new URL(url);
          ringtoneUrl = url;
        } catch (e) {
          toast({
            title: "Invalid URL",
            description: "Please enter a valid URL",
            variant: "destructive",
          });
          return;
        }
      } 
      // For file upload mode
      else if (file) {
        // Create a local URL for the file and store it
        const reader = new FileReader();
        
        try {
          // Convert file to base64 data URL for storage
          return new Promise<void>((resolve, reject) => {
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                ringtoneUrl = reader.result;
                
                // Try to test the audio after we have the data URL
                const audio = new Audio(ringtoneUrl);
                
                // Add event listeners to handle loading errors
                audio.addEventListener('canplaythrough', async () => {
                  try {
                    await audio.play();
                    setTimeout(() => {
                      audio.pause();
                      audio.currentTime = 0;
                      
                      // If we reach here, audio played successfully
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
                      setIsLoading(false);
                      resolve();
                    }, 200);
                  } catch (error) {
                    handleAudioError();
                    reject(error);
                  }
                }, { once: true });
                
                audio.addEventListener('error', () => {
                  handleAudioError();
                  reject(new Error("Audio file could not be loaded"));
                }, { once: true });
                
                // Start loading the audio
                audio.load();
              } else {
                handleAudioError();
                reject(new Error("Failed to convert file to data URL"));
              }
            };
            
            reader.onerror = () => {
              handleAudioError();
              reject(new Error("Error reading file"));
            };
            
            reader.readAsDataURL(file);
          });
        } catch (error) {
          handleAudioError();
          return;
        }
      } else {
        toast({
          title: "File Required",
          description: "Please select an audio file",
          variant: "destructive",
        });
        return;
      }
      
      // For URL mode, test the audio
      if (isUrlMode) {
        const audio = new Audio();
        
        try {
          // Set up event listeners before setting src
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', async () => {
              try {
                await audio.play();
                setTimeout(() => {
                  audio.pause();
                  audio.currentTime = 0;
                  resolve(true);
                }, 200);
              } catch (error) {
                reject(error);
              }
            }, { once: true });
            
            audio.addEventListener('error', () => {
              reject(new Error("Cannot play audio from this URL"));
            }, { once: true });
            
            // Set crossOrigin to anonymous to handle CORS issues
            audio.crossOrigin = "anonymous";
            audio.src = ringtoneUrl;
            audio.load();
            
            // Set a timeout for loading
            setTimeout(() => reject(new Error("Audio loading timeout")), 5000);
          });
          
        } catch (error) {
          console.error("Error testing audio:", error);
          toast({
            title: "Invalid Audio",
            description: "Could not play the audio file. Please check the URL.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
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
      handleAudioError();
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for handling audio errors
  const handleAudioError = () => {
    toast({
      title: "Invalid Audio",
      description: "Could not play the audio file. Please check the URL or file.",
      variant: "destructive",
    });
    setIsLoading(false);
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
