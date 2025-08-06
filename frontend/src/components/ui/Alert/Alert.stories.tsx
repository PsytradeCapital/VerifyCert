import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Alert, Notification } from './index';
import { Button } from '../Button/Button';
import { Heart, Star, Zap } from 'lucide-react';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Alert>;

// Alert Stories
export const AlertVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert variant="success" title="Success">
        Your changes have been saved successfully.
      </Alert>
      <Alert variant="error" title="Error">
        There was an error processing your request.
      </Alert>
      <Alert variant="warning" title="Warning">
        This action cannot be undone.
      </Alert>
      <Alert variant="info" title="Information">
        New features are available in this update.
      </Alert>
    </div>
  ),
};

export const AlertWithoutTitle: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert variant="success">
        Your changes have been saved successfully.
      </Alert>
      <Alert variant="error">
        There was an error processing your request.
      </Alert>
      <Alert variant="warning">
        This action cannot be undone.
      </Alert>
      <Alert variant="info">
        New features are available in this update.
      </Alert>
    </div>
  ),
};

export const ClosableAlerts: Story = {
  render: () => {
    const [alerts, setAlerts] = useState([
      { id: 1, variant: 'success' as const, message: 'Success alert' },
      { id: 2, variant: 'error' as const, message: 'Error alert' },
      { id: 3, variant: 'warning' as const, message: 'Warning alert' },
      { id: 4, variant: 'info' as const, message: 'Info alert' },
    ]);

    const removeAlert = (id: number) => {
      setAlerts(alerts.filter(alert => alert.id !== id));
    };

    return (
      <div className="space-y-4">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            variant={alert.variant}
            closable
            onClose={() => removeAlert(alert.id)}
          >
            {alert.message} - Click the X to dismiss
          </Alert>
        ))}
        {alerts.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            All alerts have been dismissed
          </p>
        )}
      </div>
    );
  },
};

export const AlertWithCustomIcon: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert variant="success" icon={<Heart className="h-5 w-5 text-red-500" />}>
        Custom heart icon alert
      </Alert>
      <Alert variant="info" icon={<Star className="h-5 w-5 text-yellow-500" />}>
        Custom star icon alert
      </Alert>
      <Alert variant="warning" icon={<Zap className="h-5 w-5 text-purple-500" />}>
        Custom lightning icon alert
      </Alert>
    </div>
  ),
};

export const AlertWithoutIcon: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert variant="success" showIcon={false}>
        Success alert without icon
      </Alert>
      <Alert variant="error" showIcon={false}>
        Error alert without icon
      </Alert>
      <Alert variant="warning" showIcon={false}>
        Warning alert without icon
      </Alert>
      <Alert variant="info" showIcon={false}>
        Info alert without icon
      </Alert>
    </div>
  ),
};

export const ComplexAlert: Story = {
  render: () => (
    <Alert variant="info" title="System Update Available" closable onClose={() => {}}>
      <div className="mt-2">
        <p className="text-sm">
          A new system update is available with the following improvements:
        </p>
        <ul className="mt-2 text-sm list-disc list-inside space-y-1">
          <li>Enhanced security features</li>
          <li>Improved performance</li>
          <li>Bug fixes and stability improvements</li>
        </ul>
        <div className="mt-4 flex space-x-3">
          <Button size="sm">Update Now</Button>
          <Button variant="outline" size="sm">Remind Me Later</Button>
        </div>
      </div>
    </Alert>
  ),
};

// Notification Stories
export const NotificationDemo: Story = {
  render: () => {
    const [notifications, setNotifications] = useState<Array<{
      id: string;
      variant: 'success' | 'error' | 'warning' | 'info';
      title?: string;
      message: string;
    }>>([]);

    const addNotification = (variant: 'success' | 'error' | 'warning' | 'info') => {
      const id = Date.now().toString();
      const messages = {
        success: 'Operation completed successfully!',
        error: 'An error occurred while processing.',
        warning: 'Please review your input.',
        info: 'Here\'s some helpful information.'
      };

      setNotifications(prev => [...prev, {
        id,
        variant,
        title: variant.charAt(0).toUpperCase() + variant.slice(1),
        message: messages[variant]
      }]);
    };

    const removeNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={() => addNotification('success')} variant="default">
            Success
          </Button>
          <Button onClick={() => addNotification('error')} variant="destructive">
            Error
          </Button>
          <Button onClick={() => addNotification('warning')} variant="outline">
            Warning
          </Button>
          <Button onClick={() => addNotification('info')} variant="secondary">
            Info
          </Button>
        </div>

        {notifications.map(notification => (
          <Notification
            key={notification.id}
            id={notification.id}
            variant={notification.variant}
            title={notification.title}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
            duration={5000}
          />
        ))}
      </div>
    );
  },
};

export const NotificationPositions: Story = {
  render: () => {
    const [position, setPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'>('top-right');
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = () => {
      const id = Date.now().toString();
      setNotification(id);
    };

    const positions = [
      'top-right', 'top-left', 'bottom-right', 
      'bottom-left', 'top-center', 'bottom-center'
    ] as const;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {positions.map(pos => (
            <Button
              key={pos}
              onClick={() => setPosition(pos)}
              variant={position === pos ? 'default' : 'outline'}
              size="sm"
            >
              {pos}
            </Button>
          ))}
        </div>

        <Button onClick={showNotification}>
          Show Notification at {position}
        </Button>

        {notification && (
          <Notification
            id={notification}
            variant="info"
            title="Position Demo"
            message={`This notification appears at ${position}`}
            position={position}
            onClose={() => setNotification(null)}
            duration={3000}
          />
        )}
      </div>
    );
  },
};

export const PersistentNotification: Story = {
  render: () => {
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = () => {
      setNotification(Date.now().toString());
    };

    return (
      <div>
        <Button onClick={showNotification}>
          Show Persistent Notification
        </Button>

        {notification && (
          <Notification
            id={notification}
            variant="warning"
            title="Persistent Notification"
            message="This notification won't auto-dismiss. You must close it manually."
            onClose={() => setNotification(null)}
            duration={0} // No auto-dismiss
          />
        )}
      </div>
    );
  },
};