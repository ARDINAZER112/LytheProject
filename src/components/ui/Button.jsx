import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-ocean-600 text-white hover:bg-ocean-700 shadow-sm",
    secondary: "bg-sand-500 text-white hover:bg-sand-600 shadow-sm",
    outline: "border border-ocean-600 text-ocean-600 hover:bg-ocean-50",
    ghost: "hover:bg-ocean-100 text-ocean-700 hover:text-ocean-900",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  };
  
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-8 text-base",
    icon: "h-9 w-9",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button };
