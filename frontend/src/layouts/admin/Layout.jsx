import { useState } from "react";
import SSidebar from "../../components/admin/Sidebar.jsx";
import SHeader from "../../components/admin/Header.jsx";
import SFooter from "../../components/admin/Footer.jsx";

import { Outlet } from "react-router-dom";

export default function SLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      
      {/* SIDEBAR */}
      <SSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          background: "white", // ✅ Remove blue tint completely
        }}
      >

        {/* HEADER */}
        <SHeader openSidebar={() => setSidebarOpen(true)} />

        {/* MAIN CONTENT AREA */}
        <div
          className="no-scrollbar"
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "scroll",   // required for scrolling
          }}
        >
          <Outlet />
        </div>

        <SFooter />
      </div>

      {/* CSS TO HIDE SCROLLBAR */}
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
}
