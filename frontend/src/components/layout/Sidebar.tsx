import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import "../../styles/glassmorphism.css";
import "../../styles/siri-text.css";

/**
 * Sidebar navigation component with glassmorphism styling
 */
const Sidebar = () => {
  const { sidebarOpen } = useAppSelector((state: any) => state.ui);
  const { user } = useAppSelector((state: any) => state.auth);

  // Navigation items - sharing the same items used in FloatingMenu
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

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 glass-translucent backdrop-blur-xl pt-16 transition-transform transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 border-r border-[rgba(156,90,255,0.15)]`}
    >
      {/* User info */}
      <div className="px-4 py-6 border-b border-[rgba(156,90,255,0.1)]">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full glass-blue flex items-center justify-center text-white text-xl font-semibold">
            {user?.username?.charAt(0).toUpperCase() || "A"}
          </div>
          <div>
            <p className="font-medium siri-heading">
              {user?.username || "User"}
            </p>
            <p className="text-sm siri-text-subtle">
              {user?.email || "Email not available"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/app"}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? "glass-blue glass text-white"
                      : "hover:bg-[rgba(255,255,255,0.05)]"
                  }`
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
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
                <span className="siri-text-subtle">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* App version */}
      <div className="absolute bottom-4 px-4 w-full">
        <p className="text-xs siri-text-subtle flex items-center">
          ArtiCube v0.1.0
          <span className="heart-icon mx-2">❤</span>
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
