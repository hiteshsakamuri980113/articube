import React from "react";
import type { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

/**
 * iOS-styled input field component
 */
const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  icon,
  id,
  className = "",
  ...rest
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium mb-1 text-ios-gray-800 dark:text-ios-gray-200"
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          className={`
            w-full px-4 py-2 rounded-lg text-ios-gray-900 dark:text-white
            bg-background-light dark:bg-background-dark backdrop-blur-sm
            border ${
              error
                ? "border-ios-red"
                : "border-ios-gray-300 dark:border-ios-gray-700"
            }
            focus:outline-none focus:ring-2 focus:ring-ios-blue focus:border-ios-blue
            ${icon ? "pl-10" : ""}
          `}
          {...rest}
        />
      </div>

      {error && <p className="mt-1 text-xs text-ios-red">{error}</p>}
    </div>
  );
};

export default InputField;
