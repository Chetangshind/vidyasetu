import React, { useEffect, useState } from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaUserGraduate,
  FaUsers,
  FaClipboardList,
  FaQuestionCircle,
  FaSignInAlt,
  FaInfoCircle,
  FaCogs,
  FaChartLine,
  FaBars,
  FaTimes
} from "react-icons/fa";
import API from "../api";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

const scrollToSection = (id) => {
  const element = document.getElementById(id);

  if (element) {
    const animatedElements = element.querySelectorAll(
      ".fade-up, .fade-left, .fade-right"
    );

    // 🔁 Reset animation
    animatedElements.forEach((el) => {
      el.classList.remove("show");

      // Force browser reflow
      void el.offsetWidth;
    });

    element.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    // 🔁 Re-add animation after slight delay
    setTimeout(() => {
      animatedElements.forEach((el) => {
        el.classList.add("show");
      });
    }, 200);
  }
};

  // 🔹 Detect Active Section While Scrolling
useEffect(() => {
  const sections = document.querySelectorAll("section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    },
    {
      threshold: 0.25
    }
  );

  sections.forEach((section) => {
    if (section.id) observer.observe(section);
  });

  return () => observer.disconnect();
}, []);

  return (
 <nav className="navbar">

  {/* LEFT SIDE */}
  <div className="nav-left">
    <img src={logo} className="nav-logo" alt="logo" />
    <h1 className="nav-title">VIDYASETU</h1>
  </div>

{/* OVERLAY */}
  {menuOpen && (
    <div
      className="menu-overlay"
      onClick={() => setMenuOpen(false)}
    />
  )}
  
  {/* MENU LINKS */}
<div className={`nav-menu ${menuOpen ? "open" : ""}`}>

  <div
    className={`nav-link ${activeSection === "home" ? "active" : ""}`}
    onClick={() => {
      scrollToSection("home");
      setMenuOpen(false);
    }}
  >
    <FaHome /> Home
  </div>

  <div
    className={`nav-link ${activeSection === "about" ? "active" : ""}`}
    onClick={() => {
      scrollToSection("about");
      setMenuOpen(false);
    }}
  >
    <FaInfoCircle /> About Us
  </div>

  <div
    className={`nav-link ${activeSection === "services" ? "active" : ""}`}
    onClick={() => {
      scrollToSection("services");
      setMenuOpen(false);
    }}
  >
    <FaCogs /> Services
  </div>

  <div
    className={`nav-link ${activeSection === "impact" ? "active" : ""}`}
    onClick={() => {
      scrollToSection("impact");
      setMenuOpen(false);
    }}
  >
    <FaChartLine /> Impacts
  </div>

  <div
    className={`nav-link ${activeSection === "students" ? "active" : ""}`}
    onClick={() => {
      scrollToSection("students");
      setMenuOpen(false);
    }}
  >
    <FaUserGraduate /> Students
  </div>

  <div
    className={`nav-link ${activeSection === "donors" ? "active" : ""}`}
    onClick={() => {
      scrollToSection("donors");
      setMenuOpen(false);
    }}
  >
    <FaUsers /> Donors
  </div>

  <div
    className={`nav-link ${activeSection === "apply" ? "active" : ""}`}
    onClick={() => {
      scrollToSection("apply");
      setMenuOpen(false);
    }}
  >
    <FaClipboardList /> Apply
  </div>

  <div
    className={`nav-link ${activeSection === "faq" ? "active" : ""}`}
    onClick={() => {
      scrollToSection("faq");
      setMenuOpen(false);
    }}
  >
    <FaQuestionCircle /> FAQ
  </div>

</div>

<div className="nav-right">

  <Link to="/login" className="nav-login-btn">
    <FaSignInAlt /> Login
  </Link>

  <div
    className="menu-icon"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    {menuOpen ? <FaTimes /> : <FaBars />}
  </div>

</div>

</nav>
  );
}