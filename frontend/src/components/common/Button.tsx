import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "outline" | "danger";
  color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

/**
 * iOS-styled button component
 */
const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  className = "",
}) => {
  // Base styles - Apple-like with refined transitions
  const baseStyle =
    "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-light)] active:scale-[0.98]";

  // Size styles - Apple-like (more compact like modern Apple UI)
  const sizeStyles = {
    sm: "py-1 px-3 text-xs leading-normal",
    md: "py-1.5 px-4 text-sm leading-normal",
    lg: "py-2 px-5 text-base leading-normal",
  };

  // Variant styles - Apple-like with subtle shadows
  const variantStyles = {
    primary:
      "bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-secondary)] hover:shadow",
    secondary:
      "bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-tertiary)]",
    outline:
      "bg-transparent border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-light)] hover:text-[var(--accent-secondary)]",
    danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow",
  };

  // Disabled style
  const disabledStyle = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  // Width style
  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${disabledStyle} ${widthStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
