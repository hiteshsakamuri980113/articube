import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { logout } from "../../store/slices/authSlice";
import { toggleSidebar } from "../../store/slices/uiSlice";
import ThemeToggle from "../common/ThemeToggle";
import "../../styles/glassmorphism.css";
import "../../styles/siri-text.css";

/**
 * Header component with glassmorphism style, app title, and user menu
 */
const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);
  const { sidebarOpen } = useAppSelector((state: any) => state.ui);

  return (
    <header className="sticky top-0 z-10 glass-translucent navbar-glass border-b border-[rgba(156,90,255,0.15)]">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Menu toggle and logo */}
        <div className="flex items-center">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="mr-4 p-2 rounded-md hover:bg-[rgba(255,255,255,0.1)]"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  sidebarOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>

          <div className="flex items-center">
            <span className="text-xl font-bold app-logo">ArtiCube</span>
          </div>
        </div>

        {/* Search bar with glassmorphism style */}
        <div className="hidden md:flex flex-1 mx-4 max-w-2xl">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search knowledge..."
              className="w-full py-2 pl-10 pr-4 glass rounded-full focus:outline-none focus:ring-1 focus:ring-[rgba(156,90,255,0.5)] transition-all"
              onClick={() => navigate("/app/search")}
              readOnly
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-[rgba(255,255,255,0.6)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center">
          <ThemeToggle />

          {/* User dropdown */}
          <div className="relative ml-3 group">
            <button
              type="button"
              className="flex items-center px-3 py-2 rounded-full transition-colors hover:bg-[rgba(156,90,255,0.15)]"
            >
              <span className="mr-2 text-sm hidden md:block siri-text-subtle">
                {user?.username || "User"}
              </span>
              <div className="w-8 h-8 rounded-full glass-blue flex items-center justify-center text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </div>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 glass-card p-0 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
              <div className="py-2 px-1">
                <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.1)]">
                  <p className="text-sm font-semibold siri-heading">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs siri-text-subtle truncate">
                    {user?.email || ""}
                  </p>
                </div>
                <a
                  href="/app/account"
                  className="block px-4 py-2 text-sm siri-text-subtle hover:bg-[rgba(255,255,255,0.1)] rounded-lg mx-1"
                >
                  Account Settings
                </a>
                <button
                  onClick={() => {
                    dispatch(logout());
                    navigate("/login");
                  }}
                  className="block w-full text-left px-4 py-2 text-sm siri-text-subtle hover:bg-[rgba(255,255,255,0.1)] rounded-lg mx-1"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
