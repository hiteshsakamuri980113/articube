import { Outlet } from "react-router-dom";
import FloatingMenu from "./FloatingMenu";
import { useAppSelector } from "../../hooks/reduxHooks";

/**
 * Main layout component containing the fixed header menu and content area
 */
const Layout = () => {
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content area */}
      <div className="flex-1 flex relative">
        {/* Fixed header menu */}
        <FloatingMenu />

        {/* Main content */}
        <main
          className={`flex-1 p-4 md:p-6 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "md:ml-64" : "ml-0"
          }`}
        >
          <div className="glass glass-card p-4 md:p-6 min-h-[calc(100vh-7rem)] overflow-auto rounded-2xl shadow-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
