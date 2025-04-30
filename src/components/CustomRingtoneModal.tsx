
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addCustomRingtone } from '@/services/reminderService';
import { toast } from '@/hooks/use-toast';
import { Upload, Globe } from 'lucide-react';

interface CustomRingtoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRingtoneAdded: () => void;
}

const CustomRingtoneModal = ({ open, onOpenChange, onRingtoneAdded }: CustomRingtoneModalProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check if file is an audio file
      if (!selectedFile.type.startsWith('audio/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an audio file (.mp3, .wav, etc.)",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };
  
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
      
      onRingtoneAdded();
      onOpenChange(false);
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Ringtone</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Ringtone Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for your ringtone"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant={isUrlMode ? "default" : "outline"}
              onClick={() => setIsUrlMode(true)}
              className="flex-1"
            >
              <Globe className="mr-2 h-4 w-4" />
              URL
            </Button>
            <Button
              type="button"
              variant={!isUrlMode ? "default" : "outline"}
              onClick={() => setIsUrlMode(false)}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
          
          {isUrlMode ? (
            <div className="grid gap-2">
              <Label htmlFor="url">Ringtone URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/audio.mp3"
              />
              <p className="text-sm text-muted-foreground">
                Enter a direct link to an audio file (.mp3, .wav, etc.)
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="file">Upload Audio File</Label>
              <Input
                id="file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground">
                {file ? `Selected: ${file.name}` : 'Select an audio file from your device'}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Add Ringtone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomRingtoneModal;
