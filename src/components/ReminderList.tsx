
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReminderCard from './ReminderCard';
import { Reminder, getAllReminders } from '@/services/reminderService';

interface ReminderListProps {
  refreshFlag: number;
}

const ReminderList = ({ refreshFlag }: ReminderListProps) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>(getAllReminders());
  
  // Refresh reminders when refreshFlag changes
  React.useEffect(() => {
    setReminders(getAllReminders());
  }, [refreshFlag]);
  
  const filteredReminders = reminders
    .filter(reminder => {
      if (filter === 'active') return !reminder.isCompleted;
      if (filter === 'completed') return reminder.isCompleted;
      return true;
    })
    .filter(reminder => {
      if (!searchQuery) return true;
      return reminder.title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      // Sort by datetime (most urgent first)
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    });
  
  const handleRefresh = () => {
    setReminders(getAllReminders());
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search reminders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" onClick={handleRefresh}>
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-2">
          {filteredReminders.length > 0 ? (
            filteredReminders.map(reminder => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                onUpdate={handleRefresh}
              />
            ))
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              {searchQuery 
                ? "No reminders match your search" 
                : "No reminders found. Create one with the voice assistant!"}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4 mt-2">
          {filteredReminders.length > 0 ? (
            filteredReminders.map(reminder => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                onUpdate={handleRefresh}
              />
            ))
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              {searchQuery 
                ? "No active reminders match your search" 
                : "No active reminders. All done!"}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4 mt-2">
          {filteredReminders.length > 0 ? (
            filteredReminders.map(reminder => (
              <ReminderCard 
                key={reminder.id} 
                reminder={reminder} 
                onUpdate={handleRefresh}
              />
            ))
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              {searchQuery 
                ? "No completed reminders match your search" 
                : "No completed reminders yet."}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReminderList;
