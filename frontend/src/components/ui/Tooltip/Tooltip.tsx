import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipProps {
children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  className?: string;
  tooltipClassName?: string;
  arrow?: boolean;
  disabled?: boolean;

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  trigger = 'hover',
  delay = 200,
  className = '',
  tooltipClassName = '',
  arrow = true,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.top + scrollY - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.bottom + scrollY + 8;
        break;
      case 'left':
        x = triggerRect.left + scrollX - tooltipRect.width - 8;
        y = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;
      case 'right':
        x = triggerRect.right + scrollX + 8;
        y = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;

    // Keep tooltip within viewport
    const padding = 8;
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipRect.width - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipRect.height - padding));

    setTooltipPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
  }, [isVisible, position]);

  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        calculatePosition();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    };
  }, [isVisible]);

  const handleTriggerEvents = () => {
    const events: { [key: string]: () => void } = {};

    if (trigger === 'hover') {
      events.onMouseEnter = showTooltip;
      events.onMouseLeave = hideTooltip;
    } else if (trigger === 'click') {
      events.onClick = () => {
        if (isVisible) {
          hideTooltip();
        } else {
          showTooltip();
      };
    } else if (trigger === 'focus') {
      events.onFocus = showTooltip;
      events.onBlur = hideTooltip;

    return events;
  };

  const getArrowClasses = () => {
    const arrowBase = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    
    switch (position) {
      case 'top':
        return ${arrowBase} -bottom-1 left-1/2 -translate-x-1/2;
      case 'bottom':
        return ${arrowBase} -top-1 left-1/2 -translate-x-1/2;
      case 'left':
        return ${arrowBase} -right-1 top-1/2 -translate-y-1/2;
      case 'right':
        return ${arrowBase} -left-1 top-1/2 -translate-y-1/2;
      default:
        return arrowBase;
  };

  const tooltipVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={inline-block ${className}}
        {...handleTriggerEvents()}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y
            }
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div
              className={
                relative bg-gray-900 text-white text-sm rounded-md px-3 py-2 max-w-xs
                shadow-lg ${tooltipClassName}
              }
              role="tooltip"
            >
              {content}
              {arrow && <div className={getArrowClasses()} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Tooltip;
}
}