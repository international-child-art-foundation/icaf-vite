import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface InputIconWrapperProps extends React.ComponentProps<'input'> {
  icon: LucideIcon;
  className?: string;
}

const InputIconWrapper = React.forwardRef<
  HTMLInputElement,
  InputIconWrapperProps
>(({ className, icon: Icon, ...props }, ref) => {
  return (
    <div
      className={cn(
        'flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
    >
      <Icon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        ref={ref}
        {...props}
        className="w-full bg-transparent text-base placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      />
    </div>
  );
});
InputIconWrapper.displayName = 'InputIconWrapper';

export { InputIconWrapper };
