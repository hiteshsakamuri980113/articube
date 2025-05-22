import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import "../../styles/header-menu.css";

/**
 * Fixed menu component for navigation in protected routes
 */
const FloatingMenu: React.FC = () => {
  // States
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  // Redux state
  const { user } = useAppSelector((state: any) => state.auth);

  // Navigation items
  const navItems = [
    {
      name: "Home",
      path: "/app",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "Saved",
      path: "/app/saved",
      icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
    },
    {
      name: "Account",
      path: "/app/account",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
  ];

  // Handle button click to toggle menu
  const handleButtonClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Effect to handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node) &&
        (!dropdownMenuRef.current ||
          !dropdownMenuRef.current.contains(e.target as Node))
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="header-container">
      {/* Menu button - updated with glass effect */}
      <div
        ref={buttonRef}
        className={`header-button ${isOpen ? "open" : ""}`}
        onClick={handleButtonClick}
      >
        {/* User initial or app logo with elegant simple design */}
        <div className="header-button-inner">
          <span>
            {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
          </span>
        </div>
      </div>

      {/* Dropdown menu - updated with glass styling */}
      {isOpen && (
        <div ref={dropdownMenuRef} className="header-menu dropdown glass-card">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/app"}
              className={({ isActive }) => {
                return `dropdown-menu-item ${isActive ? "active" : ""}`;
              }}
              onClick={() => setIsOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`dropdown-menu-icon-container ${
                      isActive ? "active" : ""
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="dropdown-menu-icon"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <span
                    className={`dropdown-menu-label ${
                      isActive ? "text-gradient" : ""
                    }`}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default FloatingMenu;
