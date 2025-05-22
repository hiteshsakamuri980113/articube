import React from "react";

interface AppleHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Apple-style header component inspired by Apple documentation
 */
const AppleHeader: React.FC<AppleHeaderProps> = ({
  title,
  subtitle,
  icon,
  className = "",
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)]">
            {icon}
          </div>
        )}
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-[var(--text-secondary)] max-w-xl">{subtitle}</p>
      )}
    </div>
  );
};

export default AppleHeader;
