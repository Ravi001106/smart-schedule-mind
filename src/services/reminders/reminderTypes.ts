
// Define Reminder interface
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
