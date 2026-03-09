import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Auth.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import CaptchaBox from "./CaptchaBox";

export default function Login() {
  const location = useLocation();
  const direction = location.state?.direction;
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const defaultRole = queryParams.get("role") || "student";

  const [role, setRole] = useState(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  useEffect(() => {
  if (role === "admin") return; // 🚫 Stop Google for admin

  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-login-btn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  };

  document.body.appendChild(script);

  return () => {
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existingScript) document.body.removeChild(existingScript);
  };
}, [role]);

  const handleGoogleResponse = async (response) => {
    if (role === "admin") return;
    try {
      const res = await fetch(`${API}/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: response.credential,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Google login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.role === "student") navigate("/student/dashboard");
      else if (data.role === "donor") navigate("/donor/dashboard");
      else navigate("/admin/dashboard");
    } catch {
      setError("Server error during Google login");
    }
  };

  const handleLogin = async () => {
    setError("");

    if (!captchaText.trim()) {
      setError("Required Captcha.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          captchaText,
          captchaToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (role === "student") navigate("/student/dashboard");
      else if (role === "donor") navigate("/donor/dashboard");
      else navigate("/admin/dashboard");
    } catch {
      setError("Server error");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-split">
        {/* LEFT */}
        <div className="auth-left">
          <h2 className="auth-title">Login</h2>

          <div className="role-toggle">
            {["student", "donor", "admin"].map((r) => (
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
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <CaptchaBox
            captchaText={captchaText}
            setCaptchaText={setCaptchaText}
            setCaptchaToken={setCaptchaToken}
          />

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" onClick={handleLogin}>
            Login
          </button>

          {role !== "admin" && (
  <div id="google-login-btn" style={{ marginTop: "10px" }}></div>
)}

          <p className="auth-footer">
            Don’t have an account?{" "}
            <Link to={`/signup?role=${role}`} state={{ direction: "right-to-left" }}>
              Create Account
            </Link>
          </p>
        </div>

        {/* RIGHT */}
        <div className={`auth-right ${direction === "left-to-right" ? "blue-slide-right" : ""}`}>
          <div className="auth-illustration">
            <h2>Welcome Back!</h2>
            <p>Already have an account?</p>
            <Link to={`/signup?role=${role}`} state={{ direction: "right-to-left" }}>
              <button>Register</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
