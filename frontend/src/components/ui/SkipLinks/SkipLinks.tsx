import React from 'react';
import { focusUtils } from '../../../utils/focusManagement';

interface SkipLink {
  targetId: string;
  label: string;

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;

const defaultSkipLinks: SkipLink[] = [
  { targetId: 'main-content', label: 'Skip to main content' },
  { targetId: 'main-navigation', label: 'Skip to navigation' },
  { targetId: 'search', label: 'Skip to search' },
];

const SkipLinks: React.FC<SkipLinksProps> = ({ 
  links = defaultSkipLinks, 
  className = '' 
}) => {
  const handleSkipClick = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    
    const target = document.getElementById(targetId);
    if (target) {
      // Make target focusable if it isn't already
      if (target.tabIndex === -1) {
        target.tabIndex = -1;
      
      target.focus();
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Announce to screen readers
      focusUtils.announce(`Skipped to ${target.getAttribute('aria-label') || targetId}`, 'polite');
  };

  return (
    <div className={`skip-links ${className}`}>
      {links.map(({ targetId, label }) => (
        <a
          key={targetId}
          href={`#${targetId}`}
          onClick={(e) => handleSkipClick(e, targetId)}
          className="
            sr-only 
            focus:not-sr-only 
            focus:absolute 
            focus:top-4 
            focus:left-4 
            focus:z-50 
            focus:px-4 
            focus:py-2 
            focus:bg-blue-600 
            focus:text-white 
            focus:rounded-md 
            focus:shadow-lg 
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500 
            focus:ring-offset-2
            transition-all
            duration-200
          "
          aria-describedby={`${targetId}-skip-description`}
        >
          {label}
          <span id={`${targetId}-skip-description`} className="sr-only">
            Press Enter to jump to {label.toLowerCase()}
          </span>
        </a>
      ))}
    </div>
  );
};

export default SkipLinks;
}}}}