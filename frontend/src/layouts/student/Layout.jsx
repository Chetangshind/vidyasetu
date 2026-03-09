import { useState } from "react";
import SSidebar from "../../components/student/Sidebar.jsx";
import SHeader from "../../components/student/Header.jsx";
import SFooter from "../../components/student/Footer.jsx";
import StudentChatbot from "../../components/student/StudentChatbot";

import { Outlet } from "react-router-dom";

export default function SLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      
      {/* SIDEBAR WITH CONTROL */}
      <SSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >

        {/* HEADER WITH HAMBURGER CONTROL */}
        <SHeader openSidebar={() => setSidebarOpen(true)} />

        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            background: "#f9fbfd",
          }}
        >
          <Outlet />
        </div>

        <SFooter />
        <StudentChatbot />

      </div>
    </div>
  );
}
