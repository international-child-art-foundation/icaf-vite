import * as React from 'react';
import { cn } from '@/utils/utils';
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
        'border-input bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full items-center rounded-md border px-3 py-2 text-base focus-within:ring-2 focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
    >
      <Icon className="text-muted-foreground mr-2 h-4 w-4 shrink-0" />
      <input
        ref={ref}
        {...props}
        className="placeholder:text-muted-foreground w-full bg-transparent text-base focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      />
    </div>
  );
});
InputIconWrapper.displayName = 'InputIconWrapper';

export { InputIconWrapper };
