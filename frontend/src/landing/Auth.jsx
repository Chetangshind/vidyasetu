import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Auth.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import CaptchaBox from "./CaptchaBox";

// --- LOGIN COMPONENT (LOGIC PRESERVED) ---
function LoginForm({ role, setRole, isSignUp, toggleForm }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  useEffect(() => {
    if (role === "admin") return;
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
        const btnContainer = document.getElementById("google-login-btn");
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, { theme: "outline", size: "large", width: "100%" });
        }
      }
    };
    document.body.appendChild(script);
    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, [role, isSignUp]);

  const handleGoogleResponse = async (response) => {
    if (role === "admin") return;
    try {
      const res = await fetch("http://localhost:5050/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg || "Google login failed"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.role === "student") navigate("/student/dashboard");
      else if (data.role === "donor") navigate("/donor/dashboard");
      else navigate("/admin/dashboard");
    } catch { setError("Server error during Google login"); }
  };

  const handleLogin = async () => {
    setError("");
    if (!captchaText.trim()) { setError("Required Captcha."); return; }
    try {
      const res = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, captchaText, captchaToken }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.msg || "Login failed"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (role === "student") navigate("/student/dashboard");
      else if (role === "donor") navigate("/donor/dashboard");
      else navigate("/admin/dashboard");
    } catch { setError("Server error"); }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-title">Login</h2>
      <div className="role-toggle">
        {["student", "donor", "admin"].map((r) => (
          <button key={r} type="button" className={role === r ? "active" : ""} onClick={() => setRole(r)}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>
      <input type="email" placeholder="Email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="password-box">
        <input type={showPassword ? "text" : "password"} placeholder="Password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
      </div>
      <CaptchaBox captchaText={captchaText} setCaptchaText={setCaptchaText} setCaptchaToken={setCaptchaToken} />
      {error && <p className="auth-error">{error}</p>}
      <button className="auth-btn" onClick={handleLogin}>Login</button>
      {role !== "admin" && <div id="google-login-btn" style={{ marginTop: "10px" }}></div>}
      <div className="mobile-toggle">Don’t have an account? <span onClick={toggleForm}>Create Account</span></div>
    </div>
  );
}

// --- SIGNUP COMPONENT (LOGIC PRESERVED) ---
function SignupForm({ role, setRole, toggleForm }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

const handleSignup = async () => {
  setError("");
  try {
    const res = await fetch("http://localhost:5050/api/auth/signup", {
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

    // redirect to login page
    navigate(`/login?role=${role}`);

  } catch {
    setError("Server error");
  }
};

  return (
    <div className="auth-form">
      <h2 className="auth-title">Create Account</h2>
      <div className="role-toggle">
        {["student", "donor"].map((r) => (
          <button key={r} type="button" className={role === r ? "active" : ""} onClick={() => setRole(r)}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>
      <input className="auth-input" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="auth-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="password-box">
        <input type={showPassword ? "text" : "password"} className="auth-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
      </div>
      {error && <p className="auth-error">{error}</p>}
      <button className="auth-btn" onClick={handleSignup}>Sign Up</button>
      <div className="mobile-toggle">Already have an account? <span onClick={toggleForm}>Login</span></div>
    </div>
  );
}

// --- MAIN AUTH CONTAINER ---
export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignUp = location.pathname.includes("signup");
  const queryParams = new URLSearchParams(location.search);
  const defaultRole = queryParams.get("role") || "student";
  const [role, setRole] = useState(defaultRole);

  const toggleForm = () => {
    if (isSignUp) navigate(`/login?role=${role}`);
    else navigate(`/signup?role=${role}`);
  };

  return (
    <div className={`auth-page ${isSignUp ? "right-panel-active" : ""}`}>
      <div className="auth-container">
        <div className="form-container sign-up-container">
          <SignupForm role={role} setRole={setRole} toggleForm={toggleForm} />
        </div>
        <div className="form-container sign-in-container">
          <LoginForm role={role} setRole={setRole} isSignUp={isSignUp} toggleForm={toggleForm} />
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h2>Welcome Back!</h2>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost auth-btn" onClick={toggleForm}>Login</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2>Hello, Friend!</h2>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost auth-btn" onClick={toggleForm}>Register</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
