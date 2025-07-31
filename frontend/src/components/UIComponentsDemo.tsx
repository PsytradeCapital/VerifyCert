import React, { useState } from 'react';
import { Modal, Dialog } from './ui/Modal';
import { Alert, Notification } from './ui/Alert';
import { Badge, Tag } from './ui/Badge';
import { Tooltip } from './ui/Tooltip';
import Card from './ui/Card/Card';
import { Button } from './ui/Button';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Heart, 
  Zap, 
  Settings, 
  Info,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';

const UIComponentsDemo: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    variant: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>>([]);
  const [alerts, setAlerts] = useState([
    { id: 1, variant: 'success' as const, message: 'Operation completed successfully!' },
    { id: 2, variant: 'warning' as const, message: 'Please review your settings.' },
    { id: 3, variant: 'info' as const, message: 'New features are available.' },
  ]);

  const addNotification = (variant: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now().toString();
    const messages = {
      success: 'Your changes have been saved!',
      error: 'Something went wrong. Please try again.',
      warning: 'This action requires confirmation.',
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

  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UI Components Library Demo
          </h1>
          <p className="text-xl text-gray-600">
            A comprehensive showcase of all implemented UI components
          </p>
        </div>

        {/* Cards Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default" padding="md">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Default Card</h3>
                <p className="text-gray-600 text-sm">
                  Clean design with subtle border for organized content display.
                </p>
              </div>
            </Card>
            <Card variant="elevated" padding="md">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Elevated Card</h3>
                <p className="text-gray-600 text-sm">
                  Floating appearance with shadow for highlighting important content.
                </p>
              </div>
            </Card>
            <Card variant="outlined" padding="md">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Outlined Card</h3>
                <p className="text-gray-600 text-sm">
                  Strong border definition for structured content and forms.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Modals & Dialogs Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Modals & Dialogs</h2>
          <div className="flex space-x-4">
            <Button onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              Open Dialog
            </Button>
          </div>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
            size="md"
          >
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                This is a modal component with backdrop, animations, and keyboard navigation.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setModalOpen(false)}>
                  Save
                </Button>
              </div>
            </div>
          </Modal>

          <Dialog
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Confirm Action"
            description="Are you sure you want to delete this item? This action cannot be undone."
            actions={
              <>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => setDialogOpen(false)}>
                  Delete
                </Button>
              </>
            }
          >
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 text-sm">
                This item will be permanently removed from your account.
              </p>
            </div>
          </Dialog>
        </section>

        {/* Alerts Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Alerts</h2>
          <div className="space-y-4">
            {alerts.map(alert => (
              <Alert
                key={alert.id}
                variant={alert.variant}
                closable
                onClose={() => removeAlert(alert.id)}
              >
                {alert.message}
              </Alert>
            ))}
            {alerts.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                All alerts have been dismissed
              </p>
            )}
          </div>
        </section>

        {/* Notifications Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Notifications</h2>
          <div className="flex space-x-2 mb-4">
            <Button size="sm" onClick={() => addNotification('success')}>
              Success
            </Button>
            <Button size="sm" variant="destructive" onClick={() => addNotification('error')}>
              Error
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNotification('warning')}>
              Warning
            </Button>
            <Button size="sm" variant="secondary" onClick={() => addNotification('info')}>
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
              onClose={removeNotification}
              duration={5000}
              position="top-right"
            />
          ))}
        </section>

        {/* Badges & Tags Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Badges & Tags</h2>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Badges</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="secondary">Secondary</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
                Verified
              </Badge>
              <Badge variant="info" icon={<Star className="w-3 h-3" />} rounded>
                Premium
              </Badge>
              <Badge variant="warning" outline>
                Pending
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              <Tag color="blue" icon={<User />}>Frontend</Tag>
              <Tag color="green" icon={<Star />}>React</Tag>
              <Tag color="purple" icon={<Zap />}>TypeScript</Tag>
              <Tag color="yellow">JavaScript</Tag>
              <Tag color="red">CSS</Tag>
              <Tag color="indigo">Tailwind</Tag>
            </div>
          </div>
        </section>

        {/* Tooltips Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tooltips</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Tooltip content="This tooltip appears on top" position="top">
                <Button>Top</Button>
              </Tooltip>
            </div>
            <div className="text-center">
              <Tooltip content="This tooltip appears on the right" position="right">
                <Button>Right</Button>
              </Tooltip>
            </div>
            <div className="text-center">
              <Tooltip content="This tooltip appears on the bottom" position="bottom">
                <Button>Bottom</Button>
              </Tooltip>
            </div>
            <div className="text-center">
              <Tooltip content="This tooltip appears on the left" position="left">
                <Button>Left</Button>
              </Tooltip>
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <Tooltip content="Click to trigger tooltip" trigger="click">
              <Button variant="outline">Click Trigger</Button>
            </Tooltip>
            <Tooltip content="Focus to see tooltip" trigger="focus">
              <Button variant="secondary">Focus Trigger</Button>
            </Tooltip>
            <Tooltip 
              content={
                <div>
                  <strong>Complex Content</strong>
                  <p>Tooltips can contain rich content including HTML elements.</p>
                </div>
              }
            >
              <Button variant="outline">Rich Content</Button>
            </Tooltip>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interactive Examples</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Profile Card */}
            <Card variant="elevated" padding="lg" hover={true}>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-xl font-semibold text-gray-900">John Doe</h3>
                    <Badge variant="success" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">Senior Software Engineer</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>john.doe@example.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>San Francisco, CA</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Tag color="blue" size="sm">React</Tag>
                    <Tag color="green" size="sm">Node.js</Tag>
                    <Tag color="purple" size="sm">TypeScript</Tag>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Tooltip content="Edit profile">
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="More information">
                    <Button size="sm" variant="outline">
                      <Info className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </Card>

            {/* Certificate Status Card */}
            <Card variant="outlined" padding="lg">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Certificate Verified</h3>
                <p className="text-gray-600 mb-4">
                  This certificate has been successfully verified on the blockchain.
                </p>
                <div className="flex justify-center space-x-2 mb-4">
                  <Badge variant="success">Verified</Badge>
                  <Badge variant="info">Blockchain</Badge>
                  <Badge variant="secondary">NFT</Badge>
                </div>
                <div className="flex justify-center space-x-2">
                  <Tooltip content="View on blockchain">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </Tooltip>
                  <Tooltip content="Download certificate">
                    <Button size="sm">
                      Download
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm border-t pt-8">
          <p>UI Components Library - Built with React, TypeScript, Tailwind CSS, and Framer Motion</p>
        </footer>
      </div>
    </div>
  );
};

export default UIComponentsDemo;