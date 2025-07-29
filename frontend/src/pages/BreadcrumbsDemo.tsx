import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Layout/Container';
import Breadcrumbs, { AutoBreadcrumbs } from '../components/ui/Navigation/Breadcrumbs';
import Card from '../components/ui/Card/Card';

const BreadcrumbsDemo: React.FC = () => {
  const manualBreadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Navigation', href: '/components/navigation' },
    { label: 'Breadcrumbs Demo', active: true }
  ];

  const longBreadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Level 1', href: '/level1' },
    { label: 'Level 2', href: '/level2' },
    { label: 'Level 3', href: '/level3' },
    { label: 'Level 4', href: '/level4' },
    { label: 'Level 5', href: '/level5' },
    { label: 'Current Page', active: true }
  ];

  return (
    <Container className="py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Breadcrumbs Component Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Demonstration of the Breadcrumbs component with automatic route generation
            and various configuration options.
          </p>
        </div>

        {/* Auto-generated Breadcrumbs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Auto-generated Breadcrumbs</h2>
          <p className="text-gray-600 mb-4">
            These breadcrumbs are automatically generated based on the current route:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <AutoBreadcrumbs />
          </div>
        </Card>

        {/* Manual Breadcrumbs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Breadcrumbs</h2>
          <p className="text-gray-600 mb-4">
            These breadcrumbs are manually defined with custom items:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <Breadcrumbs items={manualBreadcrumbs} />
          </div>
        </Card>

        {/* Breadcrumbs without Home Icon */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Without Home Icon</h2>
          <p className="text-gray-600 mb-4">
            Breadcrumbs with the home icon disabled:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <Breadcrumbs items={manualBreadcrumbs} showHomeIcon={false} />
          </div>
        </Card>

        {/* Custom Separator */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Custom Separator</h2>
          <p className="text-gray-600 mb-4">
            Breadcrumbs with a custom separator:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <Breadcrumbs 
              items={manualBreadcrumbs} 
              separator={<span className="text-blue-500">→</span>}
            />
          </div>
        </Card>

        {/* Truncated Breadcrumbs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Truncated Breadcrumbs</h2>
          <p className="text-gray-600 mb-4">
            Long breadcrumb trails can be truncated with maxItems:
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Full breadcrumbs:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Breadcrumbs items={longBreadcrumbs} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Truncated to 4 items:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Breadcrumbs items={longBreadcrumbs} maxItems={4} />
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Links */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Navigation</h2>
          <p className="text-gray-600 mb-4">
            Navigate to different pages to see how auto-generated breadcrumbs change:
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/" 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/verify" 
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Verify Certificate
            </Link>
            <Link 
              to="/verify/123" 
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Verify Certificate #123
            </Link>
            <Link 
              to="/certificate/456" 
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Certificate #456
            </Link>
            <Link 
              to="/dashboard" 
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </Card>

        {/* Usage Examples */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Auto-generated:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`<AutoBreadcrumbs />`}</code>
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Manual with options:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`<Breadcrumbs 
  items={breadcrumbItems}
  showHomeIcon={false}
  maxItems={4}
  separator={<span>→</span>}
/>`}</code>
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default BreadcrumbsDemo;