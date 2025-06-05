import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { logout } from "../store/slices/authSlice";
import { setCurrentView } from "../store/slices/uiSlice";
import "../styles/glassmorphism.css";
import "../styles/siri-text.css";
import "../styles/common-pages.css";
import "../styles/text-utilities.css";
import "../styles/deep-space-bg.css";
import "../styles/account-page.css";

/**
 * Simple Account page component
 */
const AccountPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // Use the current date for "Member Since" display
  const memberSince = "May 25, 2025"; // Current date hardcoded for now

  useEffect(() => {
    // Set current view
    dispatch(setCurrentView("account"));
  }, [dispatch]);

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative overflow-hidden deep-space-bg">
      {/* Main content container with proper spacing */}
      <main className="main-content py-8">
        <div className="app-container max-w-5xl mx-auto px-4">
          {/* Main header */}
          <section className="account-header">
            <h1 className="text-gradient">Your Account</h1>
          </section>

          {/* Account details section */}
          <section className="flex justify-center items-center">
            <div className="account-card">
              {/* Account information */}
              <div className="mb-8">
                <div className="user-info-item">
                  <div className="info-label">Username</div>
                  <div className="info-value">
                    {user?.username || "Not set"}
                  </div>
                </div>

                <div className="user-info-item">
                  <div className="info-label">Email Address</div>
                  <div className="info-value">
                    {user?.email || "Not available"}
                  </div>
                </div>

                <div className="user-info-item">
                  <div className="info-label">Full Name</div>
                  <div className="info-value">
                    {user?.fullName || "Not provided"}
                  </div>
                </div>

                <div className="user-info-item">
                  <div className="info-label">Member Since</div>
                  <div className="info-value">{memberSince}</div>
                </div>
              </div>

              {/* Sign out button */}
              <button className="account-signout-btn" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AccountPage;
