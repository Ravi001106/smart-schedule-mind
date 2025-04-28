
import React, { useState, useEffect } from 'react';
import VoiceAssistant from '@/components/VoiceAssistant';
import ReminderList from '@/components/ReminderList';
import ReminderForm from '@/components/ReminderForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initReminderChecker } from '@/services/reminderService';

const Index = () => {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('voice');

  // Initialize reminder checker on component mount
  useEffect(() => {
    const cleanupChecker = initReminderChecker();
    return () => cleanupChecker();
  }, []);

  const handleNewReminder = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 bg-card shadow-sm">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-heading text-primary">Voice Reminder</h1>
          <p className="text-muted-foreground hidden md:block">Your personal voice assistant</p>
        </div>
      </header>

      <main className="container py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="lg:sticky lg:top-6">
              <div className="hidden lg:block">
                <VoiceAssistant onNewReminder={handleNewReminder} />
              </div>
              
              <div className="block lg:hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="voice">Voice Assistant</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="voice" className="mt-0">
                    <VoiceAssistant onNewReminder={handleNewReminder} />
                  </TabsContent>
                  
                  <TabsContent value="manual" className="mt-0">
                    <ReminderForm onAddReminder={handleNewReminder} />
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="hidden lg:block mt-6">
                <ReminderForm onAddReminder={handleNewReminder} />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-heading mb-4">Your Reminders</h2>
            <ReminderList refreshFlag={refreshCounter} />
          </div>
        </div>
      </main>
      
      <footer className="p-4 bg-muted mt-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Voice Reminder App - Say "remind me to" followed by your task</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
