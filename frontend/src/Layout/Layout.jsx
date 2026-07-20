import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((previous) => !previous);
  };

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} />

      <div
        className={`app-main ${
          collapsed ? "app-main-sidebar-collapsed" : ""
        }`}
      >
        <Topbar
          collapsed={collapsed}
          onToggleSidebar={toggleSidebar}
        />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}