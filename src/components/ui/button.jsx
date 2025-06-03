import { forwardRef } from "react";
import { LoadingSpinner } from "./loading-spinner";

export const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors dark:text-black";

    const variantStyles = {
      primary:
        "bg-primary hover:bg-primary-dark text-white focus:ring-primary dark:bg-parimary-light dark:text-primary",
      secondary:
        "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 focus:ring-gray-500",
      outline:
        "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300 focus:ring-gray-500",
      danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
      success:
        "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    };

    const sizeStyles = {
      sm: "px-2.5 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

    const buttonClasses = `
      ${baseStyles}
      ${variantStyles[variant] || variantStyles.primary}
      ${sizeStyles[size] || sizeStyles.md}
      ${disabled || isLoading ? disabledStyles : ""}
      ${className}
    `;

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
