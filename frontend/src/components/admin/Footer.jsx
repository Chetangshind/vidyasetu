import API from "../../api";
export default function AdminFooter() {
  return (
    <div
      style={{
        height: "55px",
        background: "#043b52",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 600,
        fontSize: "14px",
        textAlign: "center",
      }}
    >
      <span>
        Secure administration.
        <span style={{ fontWeight: 700, color: "#5eead4" }}>
          {" "}Powerful management.
        </span>
      </span>
    </div>
  );
}