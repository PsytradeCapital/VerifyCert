/**
 * Interactive Animations Demo Component
 * Showcases enhanced hover and focus animations for all interactive elements
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Star, 
  Download, 
  Settings, 
  User, 
  Search,
  ChevronDown,
  X,
  Check,
  AlertCircle,;
  Home,;;
  FileText,;;
  Mail;;
} from 'lucide-react';

// Import enhanced components
import { Button } from './ui/Button/Button';
import Card from './ui/Card/Card';
import Input from './ui/Input/Input';
import Select from './ui/Select/Select';
import { Modal } from './ui/Modal/Modal';
import FloatingActionButton from './ui/Navigation/FloatingActionButton';
import Breadcrumbs from './ui/Navigation/Breadcrumbs';

// Import animation utilities
import { useInteractionAnimations } from '../hooks/useInteractionAnimations';
import { iconInteractions, linkInteractions, badgeInteractions } from '../utils/interactionAnimations';

const InteractionAnimationsDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  // Demo data
  const selectOptions = [
    { value: 'option1', label: 'Option 1', icon: <Star className="w-4 h-4" />,
    { value: 'option2', label: 'Option 2', icon: <Heart className="w-4 h-4" />,
    { value: 'option3', label: 'Option 3', icon: <Download className="w-4 h-4" />,
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Animations', active: true
  ];

  // Animated icon component
  const AnimatedIcon: React.FC<{ 
    icon: React.ReactNode; 
    variant?: 'default' | 'spin' | 'bounce';
    className?: string;
  }> = ({ icon, variant = 'default', className = '' }) => {
    const animations = useInteractionAnimations({
      component: 'icon',
      variant
    });

    return (
      <motion.div
        className={`inline-flex items-center justify-center ${className}`}
        {...animations}
      >
        {icon}
      </motion.div>
    );
  };

  // Animated link component
  const AnimatedLink: React.FC<{ 
    href: string; 
    children: React.ReactNode;
    variant?: 'default' | 'underline';
  }> = ({ href, children, variant = 'default' }) => {
    const animations = useInteractionAnimations({
      component: 'link',
      variant
    });

    return (
      <motion.a
        href={href}
        className="text-blue-600 hover:text-blue-800 cursor-pointer"
        {...animations}
      >
        {children}
      </motion.a>
    );
  };

  // Animated badge component
  const AnimatedBadge: React.FC<{ 
    children: React.ReactNode;
    variant?: 'default' | 'pulse';
    color?: 'blue' | 'green' | 'red' | 'yellow';
  }> = ({ children, variant = 'default', color = 'blue' }) => {
    const animations = useInteractionAnimations({
      component: 'badge',
      variant
    });

    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <motion.span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}
        {...animations}
      >
        {children}
      </motion.span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Interactive Animations Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience enhanced hover and focus animations across all interactive elements.
            All animations respect user preferences for reduced motion.
          </p>
        </div>

        {/* Breadcrumbs Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Navigation</h2>
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Breadcrumbs</h3>
            <Breadcrumbs items={breadcrumbItems} enableAnimations={true} />
          </Card>
        </section>

        {/* Buttons Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Primary</h3>
              <div className="space-y-3">
                <Button variant="default" size="sm">Small Button</Button>
                <Button variant="default" size="default">Medium Button</Button>
                <Button variant="default" size="lg">Large Button</Button>
                <Button variant="default" loading>Loading...</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Secondary</h3>
              <div className="space-y-3">
                <Button variant="secondary" size="sm">Small Button</Button>
                <Button variant="secondary" size="default">Medium Button</Button>
                <Button variant="secondary" size="lg">Large Button</Button>
                <Button variant="secondary" disabled>Disabled</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tertiary</h3>
              <div className="space-y-3">
                <Button variant="outline" size="sm">Small Button</Button>
                <Button variant="outline" size="default">Medium Button</Button>
                <Button variant="outline" size="lg">Large Button</Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  With Icon
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Danger</h3>
              <div className="space-y-3">
                <Button variant="destructive" size="sm">Delete</Button>
                <Button variant="destructive" size="default">Remove</Button>
                <Button variant="destructive" size="lg">Destroy</Button>
                <Button variant="destructive">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Cards Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default" hover className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Default Card</h3>
              <p className="text-gray-600">
                This card has subtle hover animations that lift it slightly and add shadow.
              </p>
            </Card>

            <Card variant="elevated" hover className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Elevated Card</h3>
              <p className="text-gray-600">
                This elevated card has more pronounced hover effects with enhanced shadows.
              </p>
            </Card>

            <Card variant="outlined" hover className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Outlined Card</h3>
              <p className="text-gray-600">
                This outlined card changes border color and adds subtle shadow on hover.
              </p>
            </Card>
          </div>
        </section>

        {/* Form Elements Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Input Fields</h3>
              <div className="space-y-4">
                <Input
                  label="Default Input"
                  placeholder="Type something..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input
                  label="Input with Icon"
                  placeholder="Search..."
                />
                <Input
                  label="Success State"
                  placeholder="Valid input"
                  validationState="success"
                  helperText="This looks good!"
                />
                <Input
                  label="Error State"
                  placeholder="Invalid input"
                  error="This field is required"
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Dropdown</h3>
              <div className="space-y-4">
                <Select
                  label="Basic Select"
                  options={selectOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                  placeholder="Choose an option..."
                />
                <Select
                  label="Searchable Select"
                  options={selectOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                  searchable
                  placeholder="Search options..."
                />
                <Select
                  label="Clearable Select"
                  options={selectOptions}
                  value={selectValue}
                  onChange={setSelectValue}
                  clearable
                  placeholder="Select with clear..."
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Icons and Links Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Icons & Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Animated Icons</h3>
              <div className="flex flex-wrap gap-4">
                <AnimatedIcon
                  variant="default"
                />
                <AnimatedIcon
                  variant="bounce"
                />
                <AnimatedIcon
                  variant="spin"
                />
                <AnimatedIcon
                  variant="default"
                />
                <AnimatedIcon
                  variant="bounce"
                />
                <AnimatedIcon
                  variant="default"
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Animated Links</h3>
              <div className="space-y-3">
                <div>
                  <AnimatedLink href="#" variant="default">
                    Default Link Animation
                  </AnimatedLink>
                </div>
                <div>
                  <AnimatedLink href="#" variant="underline">
                    Underline Link Animation
                  </AnimatedLink>
                </div>
                <div className="flex items-center gap-2">
                  <AnimatedIcon
                    variant="default"
                  />
                  <AnimatedLink href="#" variant="default">
                    Link with Icon
                  </AnimatedLink>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Badges Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Badges</h2>
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Interactive Badges</h3>
            <div className="flex flex-wrap gap-3">
              <AnimatedBadge variant="default" color="blue">
                Default Badge
              </AnimatedBadge>
              <AnimatedBadge variant="pulse" color="green">
                Pulsing Badge
              </AnimatedBadge>
              <AnimatedBadge variant="default" color="red">
                Error Badge
              </AnimatedBadge>
              <AnimatedBadge variant="pulse" color="yellow">
                Warning Badge
              </AnimatedBadge>
              <AnimatedBadge variant="default" color="blue">
                <Check className="w-3 h-3 mr-1" />
                With Icon
              </AnimatedBadge>
            </div>
          </Card>
        </section>

        {/* Modal Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Modal</h2>
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Animated Modal</h3>
            <Button 
              variant="default" 
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal
            </Button>
            
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Animated Modal"
            >
              <div className="space-y-4">
                <p className="text-gray-600">
                  This modal demonstrates smooth entrance and exit animations with backdrop blur.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="default" 
                    onClick={() => setIsModalOpen(false)}
                  >
                    Confirm
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Modal>
          </Card>
        </section>

        {/* Floating Action Button Demo */}
        <FloatingActionButton
          variant="primary"
          position="bottom-right"
          tooltip="Like this demo"
          enableAnimations={true}
        />

        {/* Performance Note */}
        <section className="mt-12">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Performance & Accessibility
                </h3>
                <p className="text-blue-800">
                  All animations respect user preferences for reduced motion and are optimized for performance.
                  Focus states are enhanced for keyboard navigation, and all interactive elements meet WCAG accessibility guidelines.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default InteractionAnimationsDemo;
}}}}