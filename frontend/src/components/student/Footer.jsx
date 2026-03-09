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
      <span style={{ fontSize: "17px", fontWeight: 500 }}>
  One platform.
  <span style={{ fontWeight: 700, color: "#5eead4" }}>
    {" "}Many opportunities.
  </span>
</span>

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