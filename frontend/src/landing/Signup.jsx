import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Auth.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../../api";

export default function Signup() {
  const location = useLocation();
  const direction = location.state?.direction;
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const defaultRole = queryParams.get("role") || "student";

  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

 const handleSignup = async () => {
  setError("");

  try {
    const res = await fetch(`${API}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.msg || "Signup failed");
      return;
    }

    alert("Account created successfully! Please login.");

    navigate(`/login?role=${role}&email=${email}`);

  } catch {
    setError("Server error");
  }
};

  return (
    <div className="auth-page">
      <div className="auth-card auth-split reverse">
        <div className="auth-left">
          <h2 className="auth-title">Create Account</h2>

          <div className="role-toggle">
            {["student", "donor"].map((r) => (
              <button
                key={r}
                className={role === r ? "active" : ""}
                onClick={() => setRole(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <input
            className="auth-input"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" onClick={handleSignup}>
            Sign Up
          </button>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to={`/login?role=${role}`} state={{ direction: "left-to-right" }}>
              Login
            </Link>
          </p>
        </div>

        <div className={`auth-right ${direction === "right-to-left" ? "blue-slide-left" : ""}`}>
          <div className="auth-illustration">
            <h2>Hello, Welcome!</h2>
            <p>Don’t have an account?</p>
            <Link to={`/login?role=${role}`} state={{ direction: "left-to-right" }}>
              <button>Login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
