import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import React from 'react';  // Add this import

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";