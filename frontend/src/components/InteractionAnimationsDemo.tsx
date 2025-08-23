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
  AlertCircle,
  Home,
  FileText,
  Mail
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
    { value: 'option1', label: 'Option 1', icon: <Star className="w-4 h-4" /> 
    { value: 'option2', label: 'Option 2', icon: <Heart className="w-4 h-4" /> 
    { value: 'option3', label: 'Option 3', icon: <Download className="w-4 h-4" /> 
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Animations', href: '/comp
  ];

  // Animated icon component
  const AnimatedIcon: React.FC<{ 
    children: React.ReactNo
    variant?: 'hover' | 'pulse' | 'bounce';
    size?: 'sm' | 'md' lg';
  }> = ({ children, variant = 'hover', size = 'md' }) => {
    const animations = useInteractionAnimations({
      component: 'icon',
      variant
    });

    const sis = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    };

    return (
      div
    `}
ons}
      >
        {children}
      </motion.div>
    );
  };

  // Animated link component
  const AnimatedLink: Re
    children:;
    hrering;

  }> = ({ ch}) => {
    const animamations({
      component: 'lnk',
      variant
    });

    return (
      <motion.a
      f}
    "
}
      >
        {children}
      </motion.a>
    );
  };

  // Animated badge component
  const AnimatedBadge: Re<{ 
    children:de;
    varse';
ellow';
  }> = ({ children, varian{
    const animations = useInteractionAnis({
      component: 'badge',
      variant
    });

{
      blue: e-800',
      green: 'bg-g0',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yello-800'
    };

    return (
      ion.span
    r]}`}
s}
      >
        {children}
      </motion.span>
    );
  };

  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 ">
            InDemo

          <p className="text-xl 
            Experience enhanced hovents.
            Every component responds to user interaction with smooth, purposeful ans.
          </p>
        </div>

        {/* Enhan/}
        <Card clas-12">
-6">
            <h2 className="t
            <div className="grid grap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Primary Buttons</h3>
                <div className="sp3">
                  <Button variant="primary" size="sm">
                    <Star className="w-4 />
                    Small Primary
                  </Button>
                  <Button variant="primary" size="md">
                    <Download className="w-4 h-4 mr-2" />
                    y
                  <
>
                    <Settings clas" />
                    Large Primary
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 
                <di3">
>
                    <User classNam
                    Small Secondary
                  </Button>
                  <Button variant="secondary" size="md">
                    <Search className="w-4 h-4 mr-2" />
                    Medium Secondary
                  </Button>
                  <Button variant="secondary" size="lg">
                    <Mail c />
                    Largedary
                  </n>
                </d


              <div className="space-y-4">
                <h3 className="text-lg fo>
                <div className="space-y-3">
                  <Button variant="outline" size="sm">
                    <Check className="w-4 h-4 mr-2" />
                    Small Outline
                  </Button>
                  <Buttod">
                    <Aler" />
                    tline
                  <
                ">
                  2" />

                  </Button
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Form Elements */}
        <Card clas
          <div clas6">
</h2>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                  d
                  <l>
Input
                    type="text"
                    placeholder="Type something..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  ull"
                  />
                


                  <label className">
                    Enhanced Select
                  </label>
                  <Select
                    options={selec
                    value={selectValue}
                    onChange={setSelectVa
                    pl"
                    className="w-full"
                  />
                </div>
              </div>

              <div cla6">
                <div>
                  <label className="blockb-2">
                  n
                  </la
                  <div className="relate">
                    <Input
                      type="text"
                      placeholder="Search..."
                  0"
                    />
                    <AnimatedIcon var
                      <Search className="abso>
                    </AnimatedIcon>
                  </div>
                </div>


                  <label className">
                    Input with Validation States
                  </label>
                  <div >
                    <Input
                      type="text"
                      placeholder="Va input"
                      className="w-full bor0"
                    />
                  put
                      t
                      placeholder="Invalid 
                      className="w-full b00"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Interactive Elem
        <Card className="mb-12">
          <div className="p
            <h2 className="text-2xl font-semibold te2>
            <div c>
              <div c4">
                <h3Icons</h3>
                 gap-4">
                  >
>
                  </AnimatedIcon>
                  <AnimatedIcon varze="lg">
                    <Star className="text-yellow-500" />
                  </AnimatedIcon>
                  <AnimatedIcon vag">
                    <Download className="text-blue-500" />
                  </AnimatedIcon>
                  <AnimatedIc>
                    <Settings class>
                  
                </div>
              </div>

              <div className=
                <h3 className="t
                <d3">
                  <div>
                    <AnimatedLink ve">
                  
                    </Animatek>
                  </div>
                  
                    <Animated
                      Scale Animatik
                  
                  </v>
                  <>
">
                      Color Transiion Link
                    </AnimatedLink>
                  </div>
                </div
              </div>

              <div className="spa
                <h3 cl3>
                <div -3">
                  <div>
                    <AnimatedBadge color="bl">
                      Default Badge
                    </dBadge>
                  </div>
                  <div>
                    <AnimatedBadge co
                    adge
                    </AnimatedBadge>
                  </div>
                  <div>
                    <A">
                    Badge
                   dge>
                
                  
ulse">
                      Warniadge
                    </AnimatedBadge
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Navigation Elements */}
        <Card className="mb-12">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray</h2>
            <div className=
              <div>
                <h3 className="text-lg font-medium text-grays</h3>
                <Breadcrumbs } />
              </div>

              <div>
                <h3 class>
                <div className>
                  ton
                 
                  tings />}
ings"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Modal */}
        <Card
          <div className"p-6">
            <h2 class2>
            ">
              <But
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
             dal
              </Button>
            </div>
          </div>
        </Card>

        {/* Modal Componen*/}
        <Modal
          isOpen={isModalOpen}
          onClose={se)}
          title="Enhanced Memo"
        >
          <div className=">
            <p className="text-gray-600"
              This modal demonstrates enhanced animations
            </p>
            <ul className=
              <li>Smooth fa
              <li>Scalntent</li>
              <li>Bali>
              <li>Ent</li>
            </ul>
            <div ct-4">
 <Button
                variant="outline"
                onClick={() =lse)}
              >
                Cancel
              </Button>
              <Button
          "

              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default InteractionAnimationsDemo;