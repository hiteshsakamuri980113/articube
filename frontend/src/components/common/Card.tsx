import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  glassMorphism?: boolean;
}

/**
 * Apple-styled card component with refined design
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  className = "",
  glassMorphism = false, // Default to solid background like modern Apple UI
}) => {
  return (
    <div
      className={`
        ${
          glassMorphism
            ? "bg-[var(--surface-primary)] backdrop-blur-xl bg-opacity-70"
            : "bg-[var(--surface-primary)]"
        }
        border border-[var(--border)] rounded-lg shadow-sm
        overflow-hidden transition-all duration-200
        ${className}
      `}
    >
      {title && (
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center">
          <h3 className="font-medium text-[15px] text-[var(--text-primary)]">
            {title}
          </h3>
        </div>
      )}
      <div className={`p-4 ${title ? "" : ""}`}>{children}</div>
    </div>
  );
};

export default Card;
