import React from 'react';
import Card from './ui/Card/Card';
import { User, Star, TrendingUp, Award, Download, Share2, Heart } from 'lucide-react';

const CardDemo: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Card Component Variants</h1>
        
        {/* Basic Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Basic Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default" padding="md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Default Card</h3>
              <p className="text-gray-600">
                Clean and minimal with a subtle border. Perfect for content that needs clear boundaries.
              </p>
            </Card>
            
            <Card variant="elevated" padding="md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Elevated Card</h3>
              <p className="text-gray-600">
                Floating appearance with shadow. Great for highlighting important content.
              </p>
            </Card>
            
            <Card variant="outlined" padding="md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Outlined Card</h3>
              <p className="text-gray-600">
                Prominent border for strong definition. Ideal for forms and structured content.
              </p>
            </Card>
          </div>
        </section>

        {/* Interactive Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interactive Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              variant="default" 
              padding="md" 
              hover={true} 
              onClick={() => alert('Default card clicked!')}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Clickable Default</h3>
                <p className="text-gray-600 text-sm">Hover and click me!</p>
              </div>
            </Card>
            
            <Card 
              variant="elevated" 
              padding="md" 
              hover={true} 
              onClick={() => alert('Elevated card clicked!')}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Clickable Elevated</h3>
                <p className="text-gray-600 text-sm">Enhanced hover effects!</p>
              </div>
            </Card>
            
            <Card 
              variant="outlined" 
              padding="md" 
              hover={true} 
              onClick={() => alert('Outlined card clicked!')}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Clickable Outlined</h3>
                <p className="text-gray-600 text-sm">Border animations!</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Padding Variations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Padding Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card variant="elevated" padding="none">
              <div className="p-2 bg-blue-50 text-blue-700 text-sm">
                <strong>No Padding</strong><br />
                Content touches edges
              </div>
            </Card>
            
            <Card variant="elevated" padding="sm">
              <div className="text-sm">
                <strong>Small Padding</strong><br />
                Compact spacing
              </div>
            </Card>
            
            <Card variant="elevated" padding="md">
              <div className="text-sm">
                <strong>Medium Padding</strong><br />
                Default comfortable spacing
              </div>
            </Card>
            
            <Card variant="elevated" padding="lg">
              <div className="text-sm">
                <strong>Large Padding</strong><br />
                Generous spacing
              </div>
            </Card>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Real-world Examples</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* User Profile Card */}
            <Card variant="elevated" padding="lg" hover={true}>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">John Doe</h3>
                  <p className="text-gray-600 mb-3">Senior Software Engineer</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>San Francisco, CA</span>
                    <span>•</span>
                    <span>5 years experience</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card variant="default" padding="md">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">1,234</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">Total Users</div>
                <div className="text-xs text-green-600 flex items-center justify-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12% from last month</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Product Card */}
          <Card variant="outlined" padding="none" hover={true} className="max-w-sm">
            <div>
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 rounded-t-lg"></div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Premium Course</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.9</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Learn advanced concepts with hands-on projects and expert guidance.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">$99</span>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-500 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Animation Showcase */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Animation Showcase</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default" padding="md" hover={true} onClick={() => {}}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Default Animation</h3>
              <p className="text-gray-600 text-sm">
                Hover me to see the subtle lift and shadow effect.
              </p>
            </Card>
            
            <Card variant="elevated" padding="md" hover={true} onClick={() => {}}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Elevated Animation</h3>
              <p className="text-gray-600 text-sm">
                Enhanced shadow and lift for a more dramatic effect.
              </p>
            </Card>
            
            <Card variant="outlined" padding="md" hover={true} onClick={() => {}}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Outlined Animation</h3>
              <p className="text-gray-600 text-sm">
                Border color change with subtle lift animation.
              </p>
            </Card>
          </div>
        </section>

        {/* Disabled Animations */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Accessibility - Disabled Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              variant="default" 
              padding="md" 
              hover={true} 
              enableAnimations={false}
              onClick={() => alert('No animations!')}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Animations</h3>
              <p className="text-gray-600 text-sm">
                This card has animations disabled for accessibility.
              </p>
            </Card>
            
            <Card 
              variant="elevated" 
              padding="md" 
              hover={true} 
              enableAnimations={false}
              onClick={() => alert('Reduced motion!')}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reduced Motion</h3>
              <p className="text-gray-600 text-sm">
                Respects user preferences for reduced motion.
              </p>
            </Card>
            
            <Card 
              variant="outlined" 
              padding="md" 
              hover={true} 
              enableAnimations={false}
              onClick={() => alert('Static interaction!')}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Static Interaction</h3>
              <p className="text-gray-600 text-sm">
                Still interactive but without motion effects.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CardDemo;