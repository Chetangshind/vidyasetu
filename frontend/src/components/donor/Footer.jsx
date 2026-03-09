export default function Footer() {
  return (
    <div
      className="footer-bar"
      style={{
        height: "55px",
        background: "#043b52ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 600,
        fontSize: "14px",
        textAlign: "center",
        padding: "0 10px",
      }}
    >
      © {new Date().getFullYear()} Donor Portal — All rights reserved.

      <style>{`
        @media (max-width: 768px) {
          .footer-bar {
            font-size: 12px !important;
            height: 45px !important;
            padding: 0 6px !important;
          }
        }
      `}</style>
    </div>
  );
}
