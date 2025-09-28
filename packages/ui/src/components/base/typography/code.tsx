import React from 'react';
import { cn } from '../../../lib/utils';

export interface CodeProps {
  children: React.ReactNode;
  variant?: 'inline' | 'block';
  className?: string;
  language?: string;
}

export const Code: React.FC<CodeProps> = ({
  children,
  variant = 'inline',
  className,
  language
}) => {
  if (variant === 'block') {
    return (
      <pre
        className={cn(
          'rounded-md bg-muted p-4 overflow-x-auto text-sm font-mono',
          className
        )}
        data-language={language}
      >
        <code>{children}</code>
      </pre>
    );
  }

  return (
    <code
      className={cn(
        'rounded bg-muted px-1.5 py-0.5 text-sm font-mono font-medium',
        className
      )}
    >
      {children}
    </code>
  );
};