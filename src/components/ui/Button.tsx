import * as React from "react";
import clsx from "clsx";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "accent" | "outline";
  size?: "small" | "medium" | "large";
};

export default React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "medium", ...props },
  ref
) {
  const baseClasses = "btn";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary", 
    accent: "btn-accent",
    outline: "btn-secondary",
  } as const;
  
  const sizeClasses = {
    small: "btn-small",
    medium: "",
    large: "btn-large",
  } as const;
  
  return (
    <button 
      ref={ref} 
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )} 
      {...props} 
    />
  );
});
