import React from 'react';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' }
];

export const SkipLinks: React.FC<SkipLinksProps> = ({
  links = defaultLinks,
  className = ''
}) => {
  return (
    <div className={`sr-only focus-within:not-sr-only ${className}`}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="
            absolute top-0 left-0 z-50 px-4 py-2 text-white bg-blue-600 
            focus:relative focus:z-auto focus:block
            transform -translate-y-full focus:translate-y-0
            transition-transform duration-200
          "
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default SkipLinks;