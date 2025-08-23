export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const addSkipLink = (targetId: string, linkText: string) => {
  const skipLink = document.createElement('a');
  skipLink.href = '#' + targetId;
  skipLink.textContent = linkText;
  skipLink.className = 'sr-only focus:not-sr-only';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
};
