import { useState } from "react";
import DSidebar from "../../components/donor/Sidebar.jsx";
import DHeader from "../../components/donor/Header.jsx";
import DFooter from "../../components/donor/Footer.jsx";
import { Outlet } from "react-router-dom";
import DonorChatbot from "../../components/donor/DonorChatbot.jsx";

export default function DLayout() {
  // ⭐ Sidebar open/close state (MOBILE ONLY)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT SIDEBAR */}
      <DSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* RIGHT SECTION */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* HEADER — ⭐ pass openSidebar to hamburger */}
        <DHeader openSidebar={openSidebar} />

        {/* MAIN CONTENT */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            background: "#f9fbfd",
            overflowY: "auto",
            overflowX: "hidden",
          }}
          className="content-scroll"
        >
          <Outlet />
        </div>

        {/* FOOTER */}
        <DFooter />

         {/* ⭐ DONOR CHATBOT */}
        <DonorChatbot />
        
      </div>

      {/* HIDE SCROLLBAR CSS */}
      <style>{`
        .content-scroll::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
        }
        .content-scroll {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>
    </div>
  );
}
