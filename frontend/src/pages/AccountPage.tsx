import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { logout } from "../store/slices/authSlice";
import { setTheme, setCurrentView } from "../store/slices/uiSlice";
import { fetchQueryHistory } from "../store/slices/knowledgeSlice";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import InputField from "../components/common/InputField";

/**
 * Account settings page component
 */
const AccountPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.ui);
  const { history } = useAppSelector((state) => state.knowledge);

  const [userPreferences, setUserPreferences] = useState({
    notificationsEnabled: true,
    fontSizePreference: "medium",
    colorMode: theme,
  });

  useEffect(() => {
    // Set current view
    dispatch(setCurrentView("account"));

    // Fetch data
    dispatch(fetchQueryHistory(10));
  }, [dispatch]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    dispatch(setTheme(newTheme));
    setUserPreferences((prev) => ({ ...prev, colorMode: newTheme }));
  };

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Account Settings</h1>
        <p className="text-ios-gray-600 dark:text-ios-gray-400">
          Manage your account preferences and settings
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile section */}
        <Card title="Profile Information" className="lg:col-span-2">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-ios-blue flex items-center justify-center text-white text-2xl">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="ml-6">
              <h3 className="text-xl font-semibold">
                {user?.username || "User"}
              </h3>
              <p className="text-ios-gray-600 dark:text-ios-gray-400">
                {user?.email || "Email not available"}
              </p>
            </div>
          </div>

          <form className="space-y-4">
            <InputField
              label="Username"
              type="text"
              value={user?.username || ""}
              disabled
            />

            <InputField
              label="Email Address"
              type="email"
              value={user?.email || ""}
              disabled
            />

            <InputField
              label="Full Name"
              type="text"
              value={user?.fullName || ""}
              placeholder="Enter your full name"
            />

            <div className="flex justify-end">
              <Button type="button">Update Profile</Button>
            </div>
          </form>
        </Card>

        {/* Preferences section */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Appearance">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["light", "dark", "system"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`
                        p-3 rounded-lg border text-center
                        ${
                          userPreferences.colorMode === mode
                            ? "border-ios-blue bg-ios-blue bg-opacity-10"
                            : "border-ios-gray-300 dark:border-ios-gray-700"
                        }
                      `}
                      onClick={() => handleThemeChange(mode)}
                    >
                      <div className="flex justify-center mb-2">
                        {mode === "light" && <div className="text-2xl">☀️</div>}
                        {mode === "dark" && <div className="text-2xl">🌙</div>}
                        {mode === "system" && (
                          <div className="text-2xl">💻</div>
                        )}
                      </div>
                      <div className="text-sm capitalize">{mode}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Account Actions">
            <div className="space-y-4">
              <Button variant="secondary" fullWidth>
                Change Password
              </Button>

              <Button variant="outline" fullWidth onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </Card>
        </div>

        {/* Search history section */}
        <Card title="Search History" className="lg:col-span-3">
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ios-gray-200 dark:border-ios-gray-800">
                    <th className="py-2 px-4 text-left">Query</th>
                    <th className="py-2 px-4 text-left">Date & Time</th>
                    <th className="py-2 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-ios-gray-200 dark:border-ios-gray-800 last:border-b-0"
                    >
                      <td className="py-3 px-4 font-medium">{item.query}</td>
                      <td className="py-3 px-4 text-ios-gray-600 dark:text-ios-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate("/app/search")}
                          className="text-ios-blue hover:underline"
                        >
                          Search Again
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-ios-gray-500">
              <p>No search history available</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AccountPage;
