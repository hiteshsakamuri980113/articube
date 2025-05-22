import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import "../../styles/assistive-menu.css";

// Type definitions
interface Position {
  x: number;
  y: number;
}

/**
 * Floating assistive touch menu component with both radial and dropdown options
 */
const FloatingMenu: React.FC = () => {
  // States
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [menuType, setMenuType] = useState<"radial" | "dropdown">("radial");
  const [position, setPosition] = useState<Position>({
    x: 20,
    y: window.innerHeight / 2,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showMenuTypePopup, setShowMenuTypePopup] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [lastTapTime, setLastTapTime] = useState<number>(0);

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const menuTypePopupRef = useRef<HTMLDivElement>(null);
  const longPressTimeoutRef = useRef<number | null>(null);
  const tooltipTimeoutRef = useRef<number | null>(null);

  // Refs for tracking drag state
  const dragStartXRef = useRef<number>(0);
  const dragStartYRef = useRef<number>(0);
  const buttonInitialXRef = useRef<number>(0);
  const buttonInitialYRef = useRef<number>(0);
  const isDragRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const savePositionDebounceRef = useRef<number | null>(null);

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
      name: "Search",
      path: "/app/search",
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
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

  // Calculate positions in a circle
  const getCirclePosition = (
    index: number,
    total: number,
    radius: number = 90
  ): Position => {
    // Start from the top (270 degrees in standard math)
    const angleOffset = -Math.PI / 2;
    // Calculate angle for this item
    const angle = angleOffset + index / total + 2 * Math.PI;
    // Calculate position
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  // Toggle menu type (radial or dropdown)
  const toggleMenuType = (): void => {
    setMenuType((prev) => (prev === "radial" ? "dropdown" : "radial"));
    // Store user preference
    localStorage.setItem(
      "menuType",
      menuType === "radial" ? "dropdown" : "radial"
    );

    // Show temporary tooltip to confirm change
    showTooltipWithDelay();
  };

  // Show tooltip for a brief period
  const showTooltipWithDelay = (): void => {
    setShowTooltip(true);

    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // Hide tooltip after delay
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setShowTooltip(false);
      tooltipTimeoutRef.current = null;
    }, 1500);
  };

  // Toggle menu type popup
  const toggleMenuTypePopup = (e?: React.MouseEvent): void => {
    if (e) {
      e.stopPropagation();
    }
    setShowMenuTypePopup((prev) => !prev);
  };

  // Set menu type and save preference
  const setMenuTypeAndSave = (type: "radial" | "dropdown"): void => {
    setMenuType(type);
    localStorage.setItem("menuType", type);
    setShowMenuTypePopup(false);
  };

  // Apply edge snapping and save position to localStorage
  const applyEdgeSnapping = (pos: Position): Position => {
    const edgeSnapThreshold = 30;
    let newX = pos.x;
    let newY = pos.y;

    // Horizontal edge snapping
    if (pos.x < edgeSnapThreshold) {
      newX = 10;
    } else if (pos.x > window.innerWidth - 60 - edgeSnapThreshold) {
      newX = window.innerWidth - 60;
    }

    // Vertical edge snapping
    if (pos.y < edgeSnapThreshold) {
      newY = 10;
    } else if (pos.y > window.innerHeight - 60 - edgeSnapThreshold) {
      newY = window.innerHeight - 60;
    }

    // Debounced save to localStorage
    if (savePositionDebounceRef.current) {
      clearTimeout(savePositionDebounceRef.current);
    }

    savePositionDebounceRef.current = window.setTimeout(() => {
      localStorage.setItem(
        "floatingMenuPosition",
        JSON.stringify({ x: newX, y: newY })
      );
      savePositionDebounceRef.current = null;
    }, 100);

    return { x: newX, y: newY };
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent): void => {
    if (isOpen) {
      return; // Don't start drag if menu is open
    }

    e.preventDefault();
    e.stopPropagation();

    // Setup for long press detection to toggle menu type
    longPressTimeoutRef.current = window.setTimeout(() => {
      // Toggle between radial and dropdown menu on long press
      toggleMenuType();
      hasDraggedRef.current = true; // Prevent menu from opening after long press
    }, 800); // 800ms for long press

    // Record the starting position
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    buttonInitialXRef.current = position.x;
    buttonInitialYRef.current = position.y;
    isDragRef.current = true;
    hasDraggedRef.current = false;

    // Set dragging state
    setIsDragging(true);

    // Add the event listeners to the document to ensure drag continues even if cursor leaves the button
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Add a class to the body to disable text selection during drag
    document.body.classList.add("assistive-dragging");
  };

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent): void => {
    if (!isDragRef.current) return;

    // Clear long press timer if movement occurs
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    // Calculate new position
    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - dragStartYRef.current;

    // If moved more than 5px, consider it a drag not a click
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasDraggedRef.current = true;
    }

    // Calculate new position
    let newX = buttonInitialXRef.current + deltaX;
    let newY = buttonInitialYRef.current + deltaY;

    // Keep button within window bounds
    newX = Math.max(10, Math.min(window.innerWidth - 60, newX));
    newY = Math.max(10, Math.min(window.innerHeight - 60, newY));

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setPosition({ x: newX, y: newY });
    });
  };

  // Handle mouse up after drag
  const handleMouseUp = (): void => {
    // Clear long press timer
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    // Clean up event listeners
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    // Remove the class from the body
    document.body.classList.remove("assistive-dragging");

    // If this was a drag, apply edge snapping
    if (isDragRef.current && hasDraggedRef.current) {
      setPosition(applyEdgeSnapping(position));
    } else if (isDragRef.current && !hasDraggedRef.current) {
      // Check for double-click
      const currentTime = new Date().getTime();
      const clickTimeDiff = currentTime - lastTapTime;

      if (clickTimeDiff < 300) {
        // Double-click detected
        toggleMenuType();
        setLastTapTime(0); // Reset tap time
      } else {
        // Single click - just toggle menu
        setIsOpen((prev) => !prev);
        setLastTapTime(currentTime);
      }
    }

    // Reset dragging state
    isDragRef.current = false;
    setIsDragging(false);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent): void => {
    if (isOpen) {
      return; // Don't start drag if menu is open
    }

    // Don't use preventDefault here as it can make the element unresponsive on iOS
    e.stopPropagation();

    // Setup for long press detection to toggle menu type
    longPressTimeoutRef.current = window.setTimeout(() => {
      // Toggle between radial and dropdown menu on long press
      toggleMenuType();
      hasDraggedRef.current = true; // Prevent menu from opening after long press
    }, 800); // 800ms for long press

    const touch = e.touches[0];

    // Record the starting position
    dragStartXRef.current = touch.clientX;
    dragStartYRef.current = touch.clientY;
    buttonInitialXRef.current = position.x;
    buttonInitialYRef.current = position.y;
    isDragRef.current = true;
    hasDraggedRef.current = false;

    // Set dragging state
    setIsDragging(true);

    // Add class to body
    document.body.classList.add("assistive-dragging");

    // Using document event listeners to ensure drag works even if touch leaves the button
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  // Handle touch move during drag
  const handleTouchMove = (e: TouchEvent): void => {
    if (!isDragRef.current) return;

    // Clear long press timer if movement occurs
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    // Prevent screen scrolling during drag
    e.preventDefault();

    const touch = e.touches[0];

    // Calculate new position
    const deltaX = touch.clientX - dragStartXRef.current;
    const deltaY = touch.clientY - dragStartYRef.current;

    // If moved more than 5px, consider it a drag not a tap
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasDraggedRef.current = true;
    }

    // Calculate new position
    let newX = buttonInitialXRef.current + deltaX;
    let newY = buttonInitialYRef.current + deltaY;

    // Keep button within window bounds
    newX = Math.max(10, Math.min(window.innerWidth - 60, newX));
    newY = Math.max(10, Math.min(window.innerHeight - 60, newY));

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setPosition({ x: newX, y: newY });
    });
  };

  // Handle touch end after drag
  const handleTouchEnd = (): void => {
    // Clear long press timer
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    // Clean up event listeners
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);

    // Remove the class from the body
    document.body.classList.remove("assistive-dragging");

    // If this was a drag, apply edge snapping
    if (isDragRef.current && hasDraggedRef.current) {
      setPosition(applyEdgeSnapping(position));
    } else if (isDragRef.current && !hasDraggedRef.current) {
      // Check for double-tap
      const currentTime = new Date().getTime();
      const tapTimeDiff = currentTime - lastTapTime;

      if (tapTimeDiff < 300) {
        // Double-tap detected
        toggleMenuType();
        setLastTapTime(0); // Reset tap time
      } else {
        // Single tap - just toggle menu
        setIsOpen((prev) => !prev);
        setLastTapTime(currentTime);
      }
    }

    // Reset dragging state
    isDragRef.current = false;
    setIsDragging(false);
  };

  // Handle direct clicks on the button
  const handleClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only handle as a click if we're not dragging
    if (!isDragging) {
      // Check for double-click
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime;

      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // This is a double-click
        toggleMenuType();
        
        // Show tooltip about the change
        setShowTooltip(true);
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
        tooltipTimeoutRef.current = window.setTimeout(() => {
          setShowTooltip(false);
          tooltipTimeoutRef.current = null;
        }, 2000);
        
        setLastTapTime(0);
      } else {
        // Toggle menu on single click
        setIsOpen(prev => !prev);
        setLastTapTime(now);
      }
    }
  };

  // Handle direct clicks on the button (for the tests)
  const handleClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    // Only handle as a click if we're not dragging
    if (!isDragging) {
      // Check for double-click
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime;

      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // This is a double-click
        toggleMenuType();
        setLastTapTime(0);
      } else {
        // Toggle menu on single click
        setIsOpen((prev) => !prev);
        setLastTapTime(now);
      }
    }
  };

  // Cleanup effect to ensure all event listeners are removed when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any event listeners
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.body.classList.remove("assistive-dragging");

      // Clear any timers
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
      if (savePositionDebounceRef.current) {
        clearTimeout(savePositionDebounceRef.current);
      }
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Load saved position, menu type, and set up event listeners
  useEffect(() => {
    // Load saved position from localStorage
    const savedPosition = localStorage.getItem("floatingMenuPosition");
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error("Invalid position in localStorage", e);
      }
    }

    // Load saved menu type preference
    const savedMenuType = localStorage.getItem("menuType");
    if (savedMenuType === "radial" || savedMenuType === "dropdown") {
      setMenuType(savedMenuType);
    }

    // Close menu when clicking outside
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
        // Close the menu
        setIsOpen(false);
      }
    };

    // Adjust position when window resizes
    const handleResize = (): void => {
      setPosition((prevPos: Position) => {
        const newPos = { ...prevPos };

        if (newPos.x > window.innerWidth - 60) {
          newPos.x = window.innerWidth - 60;
        }

        if (newPos.y > window.innerHeight - 60) {
          newPos.y = window.innerHeight - 60;
        }

        return newPos;
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating button */}
      <div
        ref={buttonRef}
        className={`assistive-button ${isOpen ? "open" : ""} ${
          isDragging ? "dragging" : ""
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
      >
        {/* User initial or app logo */}
        <div className="assistive-button-inner">
          {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
        </div>

        {/* Small indicator dot for menu type */}
        <div
          className={`menu-type-indicator ${menuType}`}
          title={`${
            menuType === "radial" ? "Radial menu" : "Dropdown menu"
          } active (long press to toggle)`}
        />
      </div>

      {/* Radial menu that appears when button is clicked */}
      {isOpen && menuType === "radial" && (
        <div
          ref={menuRef}
          className="assistive-menu radial"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          }}
        >
          {navItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/app"}
              className={({ isActive }) =>
                `assistive-menu-item ${isActive ? "active" : ""}`
              }
              onClick={() => setIsOpen(false)}
              style={
                {
                  "--index": index,
                  "--total": navItems.length,
                } as React.CSSProperties
              }
            >
              <div
                className="assistive-menu-item-content"
                style={{
                  left: `${getCirclePosition(index, navItems.length).x}px`,
                  top: `${getCirclePosition(index, navItems.length).y}px`,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="assistive-menu-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                <span className="assistive-menu-label">{item.name}</span>
              </div>
            </NavLink>
          ))}

          {/* Settings button in radial menu */}
          <div
            className="assistive-menu-item settings-item"
            style={
              {
                "--index": navItems.length,
                "--total": navItems.length + 1,
              } as React.CSSProperties
            }
          >
            <div
              className="assistive-menu-item-content"
              style={{
                left: `${
                  getCirclePosition(navItems.length, navItems.length + 1).x
                }px`,
                top: `${
                  getCirclePosition(navItems.length, navItems.length + 1).y
                }px`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleMenuTypePopup(e);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="assistive-menu-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="assistive-menu-label">Settings</span>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown menu that appears when button is clicked */}
      {isOpen && menuType === "dropdown" && (
        <div
          ref={dropdownMenuRef}
          className="assistive-menu dropdown"
          style={{
            transform: `translate3d(${position.x}px, ${position.y + 60}px, 0)`,
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/app"}
              className={({ isActive }) =>
                `dropdown-menu-item ${isActive ? "active" : ""}`
              }
              onClick={() => setIsOpen(false)}
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
                  strokeWidth={2}
                  d={item.icon}
                />
              </svg>
              <span className="dropdown-menu-label">{item.name}</span>
            </NavLink>
          ))}
          <div className="dropdown-menu-footer">
            <button
              className="menu-type-toggle"
              onClick={(e) => {
                e.stopPropagation();
                toggleMenuTypePopup(e);
              }}
              title="Menu settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Menu Settings
            </button>
          </div>
        </div>
      )}

      {/* Menu type selection popup */}
      {showMenuTypePopup && (
        <div
          ref={menuTypePopupRef}
          className="menu-type-popup"
          style={{
            transform: `translate3d(${position.x + 70}px, ${position.y}px, 0)`,
          }}
        >
          <div className="menu-type-popup-header">Menu Type</div>
          <button
            className={`menu-type-option ${
              menuType === "radial" ? "active" : ""
            }`}
            onClick={() => setMenuTypeAndSave("radial")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 15c.3173 0 .612.1.9035.1967a1.929 1.929 0 010 2.7266A1.929 1.929 0 0115 18c-.3173 0-.612-.1-.9035-.1967a1.929 1.929 0 010-2.7266c.2915-.2867.5862-.3767.9035-.3767zm-6 0c.3173 0 .612.1.9035.1967a1.929 1.929 0 010 2.7266A1.929 1.929 0 019 18c-.31725 0-.61203-.1-.90354-.1967a1.929 1.929 0 010-2.7266c.29151-.2867.58629-.3767.90354-.3767zm3-9c.3173 0 .612.1.9035.1967a1.929 1.929 0 010 2.7266A1.929 1.929 0 0112 9c-.3173 0-.612-.1-.9035-.1967a1.929 1.929 0 010-2.7266c.2915-.2867.5862-.3767.9035-.3767z"
              />
            </svg>
            Radial Menu
          </button>
          <button
            className={`menu-type-option ${
              menuType === "dropdown" ? "active" : ""
            }`}
            onClick={() => setMenuTypeAndSave("dropdown")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6h12M6 12h12m-6 6h6"
              />
            </svg>
            Dropdown Menu
          </button>
        </div>
      )}

      {/* Tooltip for menu type */}
      {showTooltip && (
        <div
          className="assistive-tooltip"
          style={{
            transform: `translate3d(${position.x + 70}px, ${position.y}px, 0)`,
          }}
        >
          {menuType === "radial"
            ? "Radial menu active"
            : "Dropdown menu active"}
        </div>
      )}
    </>
  );
};

export default FloatingMenu;
