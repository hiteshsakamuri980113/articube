import React from "react";

/**
 * Root layout component that applies deep-space-bg to the entire app
 */
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen relative deep-space-bg">{children}</div>;
};

export default RootLayout;
