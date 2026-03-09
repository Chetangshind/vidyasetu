import React, { useState } from "react";
import {
  FiGlobe,
  FiMoon,
  FiSun,
  FiLock,
  FiTrash2,
  FiChevronDown,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

import "../student/Settings.css";   // ⭐ reuse same CSS

const DonorSettings = () => {

  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState("light");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [showDel, setShowDel] = useState(false);

  const handlePasswordUpdate = async (e) => {

    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch("http://localhost:5050/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          role: localStorage.getItem("role"),
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.msg);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {

    if (!deletePassword) {
      alert("Please enter your password to confirm account deletion.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action is permanent."
    );

    if (!confirmDelete) return;

    try {

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch("http://localhost:5050/api/auth/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          role: localStorage.getItem("role"),
          password: deletePassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.clear();
        window.location.href = "/login";
      } else {
        alert(data.msg || "Account deletion failed");
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (

    <div className="settings-container">

      <header className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account preferences</p>
      </header>

      <div className="settings-grid">

        {/* 🌐 Language */}
        <div className="settings-card">

          <div className="card-header">
            <FiGlobe className="card-icon" />
            <h3>Language Preferences</h3>
          </div>

          <div className="card-body">

            <p className="description">
              Choose your preferred language
            </p>

            <div className="dropdown-container">

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="settings-select"
              >

                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
                <option>Gujarati</option>

              </select>

              <FiChevronDown className="dropdown-arrow" />

            </div>

          </div>

        </div>


        {/* 🎨 Appearance */}
        <div className="settings-card">

          <div className="card-header">
            <FiSun className="card-icon" />
            <h3>Appearance</h3>
          </div>

          <div className="card-body">

            <p className="description">
              Customize your theme
            </p>

            <div className="appearance-controls">

              <div className="theme-toggle-group">

                <button
                  className={`theme-btn ${theme === "light" ? "active" : ""}`}
                  onClick={() => setTheme("light")}
                >
                  <FiSun /> Light
                </button>

                <button
                  className={`theme-btn ${theme === "dark" ? "active" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  <FiMoon /> Dark
                </button>

              </div>

              <div className="accent-preview">
                <span>Accent Color</span>
                <div className="accent-dot"></div>
              </div>

            </div>

          </div>

        </div>


        {/* 🔐 Change Password */}
        <div className="settings-card full-width">

          <div className="card-header">
            <FiLock className="card-icon" />
            <h3>Change Password</h3>
          </div>

          <div className="card-body">

            <form className="password-form" onSubmit={handlePasswordUpdate}>

              {/* CURRENT */}
              <div className="form-group">

                <label>Current Password</label>

                <div className="password-input-wrapper">

                  <input
                    type={showCurr ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />

                  <span className="eye-icon" onClick={() => setShowCurr(!showCurr)}>
                    {showCurr ? <FiEyeOff /> : <FiEye />}
                  </span>

                </div>

              </div>


              <div className="form-row">

                {/* NEW */}
                <div className="form-group">

                  <label>New Password</label>

                  <div className="password-input-wrapper">

                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <span className="eye-icon" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <FiEyeOff /> : <FiEye />}
                    </span>

                  </div>

                </div>


                {/* CONFIRM */}
                <div className="form-group">

                  <label>Confirm Password</label>

                  <div className="password-input-wrapper">

                    <input
                      type={showConf ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <span className="eye-icon" onClick={() => setShowConf(!showConf)}>
                      {showConf ? <FiEyeOff /> : <FiEye />}
                    </span>

                  </div>

                </div>

              </div>

              <button type="submit" className="update-btn">
                Update Password
              </button>

            </form>

          </div>

        </div>


        {/* 🚨 Delete Account */}
        <div className="settings-card delete-card full-width">

          <div className="card-header">
            <FiTrash2 className="card-icon" />
            <h3>Delete Account</h3>
          </div>

          <div className="card-body">

            <div className="delete-content">

              <p className="warning-text">
                This action is permanent and cannot be undone.
              </p>

              <div className="form-group">

                <div className="password-input-wrapper delete-pass-input">

                  <input
                    type={showDel ? "text" : "password"}
                    placeholder="Enter password to confirm deletion"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />

                  <span className="eye-icon" onClick={() => setShowDel(!showDel)}>
                    {showDel ? <FiEyeOff /> : <FiEye />}
                  </span>

                </div>

              </div>

              <button className="delete-btn" onClick={handleDeleteAccount}>
                Delete Account
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
};

export default DonorSettings;