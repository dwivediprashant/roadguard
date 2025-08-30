import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

export default function NotificationTest() {
  const createTestTask = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/test/create-task');
      toast.success('Test task created!', {
        description: `Task assigned to ${response.data.worker.name}`
      });
    } catch (error) {
      console.error('Error creating test task:', error);
      toast.error('Failed to create test task');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Notification Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={createTestTask} className="w-full">
          Create Test Task & Send Notification
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          This will create a test task and send a real-time notification to the worker.
        </p>
      </CardContent>
    </Card>
  );
}