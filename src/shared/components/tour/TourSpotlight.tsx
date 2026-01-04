/**
 * TourSpotlight Component
 * 
 * Creates an overlay with a "hole" highlighting the target element.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/shared/utils/utils';
import type { TourSpotlightProps } from './types';

/**
 * TourSpotlight - Overlay with highlighted target element
 * 
 * @example
 * ```tsx
 * <TourSpotlight
 *   target="#my-element"
 *   padding={8}
 *   onOverlayClick={() => skipTour()}
 * />
 * ```
 */
export function TourSpotlight({
  target,
  padding = 8,
  animationDuration = 300,
  onOverlayClick,
}: TourSpotlightProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(target);
      if (element) {
        const newRect = element.getBoundingClientRect();
        setRect(newRect);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Initial update
    updatePosition();

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    // Use ResizeObserver for element size changes
    const element = document.querySelector(target);
    if (element) {
      const resizeObserver = new ResizeObserver(updatePosition);
      resizeObserver.observe(element);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        resizeObserver.disconnect();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target]);

  if (!rect || !isVisible) {
    return null;
  }

  const holeStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${rect.left - padding}px`,
    top: `${rect.top - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`,
    borderRadius: '8px',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
    pointerEvents: 'none',
    transition: `all ${animationDuration}ms ease-out`,
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9998] pointer-events-auto',
        'transition-opacity',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      style={{ transitionDuration: `${animationDuration}ms` }}
      onClick={onOverlayClick}
    >
      {/* Overlay with hole */}
      <div
        style={holeStyle}
        className="pointer-events-none"
      />
      
      {/* Border highlight */}
      <div
        style={{
          position: 'absolute',
          left: `${rect.left - padding}px`,
          top: `${rect.top - padding}px`,
          width: `${rect.width + padding * 2}px`,
          height: `${rect.height + padding * 2}px`,
          borderRadius: '8px',
          border: '2px solid rgb(59, 130, 246)', // blue-500
          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
          pointerEvents: 'none',
          transition: `all ${animationDuration}ms ease-out`,
        }}
      />
    </div>
  );
}
