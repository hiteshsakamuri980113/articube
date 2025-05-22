/**
 * This test file checks the FloatingMenu component functionality.
 */
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import FloatingMenu from "../components/layout/FloatingMenu";

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    auth: () => ({ user: { username: "TestUser" } }),
  },
});

// Helper to wrap component with necessary providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
};

describe("FloatingMenu", () => {
  it("renders the menu button with user initial", () => {
    renderWithProviders(<FloatingMenu />);

    const button = screen.getByText("T");
    expect(button).toBeInTheDocument();
  });

  it("shows dropdown menu when button is clicked", () => {
    renderWithProviders(<FloatingMenu />);

    // Get the button and click it
    const button = document.querySelector(".header-button");
    expect(button).toBeInTheDocument();

    if (button) {
      fireEvent.click(button);
    }

    // Menu should be visible with navigation items
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("closes dropdown menu when clicking outside", () => {
    renderWithProviders(<FloatingMenu />);

    // Get the button and click it
    const button = document.querySelector(".header-button");
    expect(button).toBeInTheDocument();

    if (button) {
      fireEvent.click(button);
    }

    // Menu should be visible
    expect(screen.getByText("Home")).toBeInTheDocument();

    // Click outside the menu
    fireEvent.mouseDown(document.body);

    // Menu should be hidden
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
  });

  it("closes dropdown menu when nav item is clicked", () => {
    renderWithProviders(<FloatingMenu />);

    // Get the button and click it
    const button = document.querySelector(".header-button");
    expect(button).toBeInTheDocument();

    if (button) {
      fireEvent.click(button);
    }

    // Click a navigation item
    const homeLink = screen.getByText("Home");
    fireEvent.click(homeLink);

    // Menu should be hidden
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
  });
});
