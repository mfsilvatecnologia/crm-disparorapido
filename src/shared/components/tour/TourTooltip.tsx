/**
 * TourTooltip Component
 * 
 * Displays tour step content with navigation buttons.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/utils';
import type { TourTooltipProps } from './types';

/**
 * TourTooltip - Tooltip with step content and navigation
 * 
 * @example
 * ```tsx
 * <TourTooltip
 *   step={currentStep}
 *   stepNumber={1}
 *   totalSteps={5}
 *   onNext={() => nextStep()}
 *   onPrev={() => prevStep()}
 *   onSkip={() => skipTour()}
 *   isFirst={true}
 *   isLast={false}
 * />
 * ```
 */
export function TourTooltip({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isFirst,
  isLast,
}: TourTooltipProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(step.target);
      if (!element || !tooltipRef.current) return;

      const rect = element.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const padding = 16;
      const defaultPosition = step.position || 'bottom';

      let top = 0;
      let left = 0;

      switch (defaultPosition) {
        case 'top':
          top = rect.top - tooltipRect.height - padding;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.left - tooltipRect.width - padding;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.right + padding;
          break;
        case 'center':
          top = window.innerHeight / 2 - tooltipRect.height / 2;
          left = window.innerWidth / 2 - tooltipRect.width / 2;
          break;
      }

      // Keep tooltip within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < padding) left = padding;
      if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding;
      }

      if (top < padding) top = padding;
      if (top + tooltipRect.height > viewportHeight - padding) {
        top = viewportHeight - tooltipRect.height - padding;
      }

      setPosition({ top, left });
    };

    // Initial position
    updatePosition();

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [step.target, step.position]);

  if (!position) {
    return null;
  }

  const handlePrimaryAction = () => {
    if (step.actions?.primary?.onClick) {
      step.actions.primary.onClick();
    }
    if (!isLast) {
      onNext();
    } else {
      onNext(); // Will complete tour
    }
  };

  const handleSecondaryAction = () => {
    if (step.actions?.secondary?.onClick) {
      step.actions.secondary.onClick();
    }
  };

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] pointer-events-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '320px',
        maxWidth: '420px',
      }}
    >
      <Card className="shadow-lg border-2 border-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">
                Passo {stepNumber} de {totalSteps}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {step.content}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              {!isFirst && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrev}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              {step.actions?.secondary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSecondaryAction}
                >
                  {step.actions.secondary.label}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
              >
                Pular
              </Button>
              {step.actions?.primary ? (
                <Button
                  size="sm"
                  onClick={handlePrimaryAction}
                >
                  {step.actions.primary.label}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onNext}
                >
                  {isLast ? 'Finalizar' : 'Próximo'}
                  {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
