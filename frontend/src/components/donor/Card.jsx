export default function Card({ icon, title }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "28px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        minHeight: "120px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
    >
      <div style={{ fontSize: "32px", color: "#1e40af" }}>{icon}</div>
      <p style={{ marginTop: "14px", fontWeight: 600, color: "#1f2937" }}>
        {title}
      </p>
    </div>
  );
}
