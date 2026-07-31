import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 760px)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");

    const handleScreenChange = (event) => {
      setIsMobile(event.matches);

      if (!event.matches) {
        setMobileSidebarOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleScreenChange);

    return () => {
      mediaQuery.removeEventListener("change", handleScreenChange);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      isMobile && mobileSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, mobileSidebarOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen((previous) => !previous);
      return;
    }

    setCollapsed((previous) => !previous);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={!isMobile && collapsed}
        mobileOpen={mobileSidebarOpen}
        onNavigate={closeMobileSidebar}
      />

      {isMobile && mobileSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
          aria-label="Close navigation menu"
        />
      )}

      <div
        className={`app-main ${
          !isMobile && collapsed
            ? "app-main-sidebar-collapsed"
            : ""
        }`}
      >
        <Topbar
          collapsed={isMobile ? !mobileSidebarOpen : collapsed}
          onToggleSidebar={toggleSidebar}
        />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}