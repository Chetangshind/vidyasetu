import React from "react";

export default function AnnouncementBar() {
  const messages = [
    "Application acceptance for VidyaSetu Scholarships closes on 15 December 2025.",
    "Document verification window opens on 10 December.",
    "Submit missing documents to avoid rejection.",
  ];

  return (
    <div
      style={{
        width: "100%",
        padding: "10px 0",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(to right, #ffeaea, #fff5f5)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
      }}
    >

      {/* Modern Soft Red Accent Bar */}
      <div
        style={{
          width: "5px",
          height: "100%",
          background: "linear-gradient(#ff3b3b, #ff7a7a)",
          marginRight: "10px",
          borderRadius: "4px",
        }}
      ></div>

      {/* Scroll Text */}
      <div
        className="scroll-text"
        style={{
          whiteSpace: "nowrap",
          display: "inline-block",
          animation: "scroll-left 28s linear infinite",
          color: "#d62828",
          fontWeight: 600,
          fontSize: "15px",
          paddingRight: "100%",
        }}
      >
        {messages.join("  •  ")}
      </div>

      <style>
        {`
          @keyframes scroll-left {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }

          .scroll-text:hover {
            animation-play-state: paused;
          }

          @media (max-width: 768px) {
            .scroll-text {
              font-size: 13px !important;
            }
          }
        `}
      </style>
    </div>
  );
}
