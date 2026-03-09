import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../landing/Navbar";
import "./LandingPage.css";
import { FiCheckCircle } from "react-icons/fi";
import API from "../../api";

import donorFinancial from "../assets/features/donor_financial_aid.jpg";
import hero from "../assets/hero.jpg";
import logo from "../assets/logo.png";
import child1 from "../assets/children/child1.jpg";
import child2 from "../assets/children/child2.jpg";
import child3 from "../assets/children/child3.jpg";
import home1 from "../assets/children/home1.jpg";
import home3 from "../assets/children/home3.jpg";
import homebg from "../assets/children/homebg.jpg";

import documentsImg from "../assets/student/documents.jpg";
import studentImg from "../assets/children/student.jpg";
import ngoImg from "../assets/features/NGO.jpg";
import feature2Img from "../assets/features/feature2.png";

import student from "../assets/children/student.jpg";
import parent from "../assets/children/parent.png";
import studentp from "../assets/children/studentp.jpg";
import rularstu from "../assets/children/rularstu.png";
import indiaMap from "../assets/children/india-map.png";
import donorBg from "../assets/children/donor-bg.jpg";
import apply from "../assets/children/apply.jpg";
import supportQR from "../assets/supportQR.jpeg";
/* ================= Donor Types ================= */
import ss1 from "../assets/children/ss1.jpg";
import ss2 from "../assets/children/ss2.jpg";
import ngo1 from "../assets/children/ngo1.png";
import donor1 from "../assets/children/donor1.png";

import { FaSearch, FaChevronDown } from "react-icons/fa";

import {
  FaUserCheck,
  FaMoneyBillWave,
  FaHourglassHalf,
  FaGraduationCap,
  FaStar,
  FaCheckCircle
} from "react-icons/fa";

import chetan from "../assets/team/chetan.jpeg";
import darshani from "../assets/team/darshani.jpeg";
import siddhi from "../assets/team/siddhi.jpeg";
import almira from "../assets/team/almira.jpeg";
import anjum from "../assets/team/anjum.jpeg";
import team1 from "../assets/team/team1.jpeg";
import team2 from "../assets/team/team2.jpeg";
import team3 from "../assets/team/team3.jpeg";

/* ================= NGO LOGOS ================= */

import ngo01 from "../assets/ngo/ngo1.jpg";
import ngo02 from "../assets/ngo/ngo2.png";
import ngo03 from "../assets/ngo/ngo3.jpg";
import ngo04 from "../assets/ngo/ngo4.png";
import ngo05 from "../assets/ngo/ngo5.png";
import ngo06 from "../assets/ngo/ngo6.png";
import ngo07 from "../assets/ngo/ngo7.png";

import ngo08 from "../assets/ngo/ngo8.png";
import ngo09 from "../assets/ngo/ngo9.png";
import ngo10 from "../assets/ngo/ngo10.png";
import ngo11 from "../assets/ngo/ngo11.png";
import ngo12 from "../assets/ngo/ngo12.png";
import ngo13 from "../assets/ngo/ngo13.png";
import ngo14 from "../assets/ngo/ngo14.jpg";

import ngo15 from "../assets/ngo/ngo15.jpg";
import ngo16 from "../assets/ngo/ngo16.png";
import ngo17 from "../assets/ngo/ngo17.png";
import ngo18 from "../assets/ngo/ngo18.jpg";
import ngo19 from "../assets/ngo/ngo19.png";
import ngo20 from "../assets/ngo/ngo20.png";
import ngo21 from "../assets/ngo/ngo21.jpg";

/* ================= FAQ ================= */

function FAQSection() {
  const [activeTab, setActiveTab] = useState("donors");
  const [openIndex, setOpenIndex] = useState(null);

  const faqTabs = [
    { id: "general", label: "General Questions", icon: "❓" },
    { id: "students", label: "For Students", icon: "🎓" },
    { id: "donors", label: "For Donors", icon: "🤝" },
    { id: "security", label: "Security & Privacy", icon: "🔐" }
  ];

  const faqData = [
    { tab: "general", q: "What is VidyaSetu?", a: "VidyaSetu is a platform connecting students with verified donors and scholarships." },
    { tab: "general", q: "Is VidyaSetu free?", a: "Yes, registration and application are completely free." },

    { tab: "students", q: "Who can apply?", a: "Students from school, college and higher education can apply." },
    { tab: "students", q: "Are scholarships verified?", a: "Yes, all scholarships and donors are verified." },
    { tab: "students", q: "How long does approval take?", a: "Verification depends on documentation and partner approval." },

    { tab: "donors", q: "How can I donate?", a: "You can register as a donor and choose verified student profiles." },
    { tab: "donors", q: "Can I track my donation?", a: "Yes, you can track fund utilization and student progress." },

    { tab: "security", q: "Is my data secure?", a: "Yes, VidyaSetu follows strict data protection policies." },
    { tab: "security", q: "Are students verified?", a: "Yes, all student profiles go through verification." }
  ];


  const filteredFaq = faqData.filter(item => item.tab === activeTab);

  return (
    <section className="faq-page">

      {/* HEADER */}
      <div className="faq-header">
        <h2>
  Frequently Asked <span>Questions</span>
</h2>
<p>
  Find answers for students, donors and general queries.
</p>
      </div>

      {/* TABS */}
      <div className="faq-tabs">
        {faqTabs.map(tab => (
          <div
            key={tab.id}
            className={`faq-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab.id);
              setOpenIndex(null);
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <p>{tab.label}</p>
          </div>
        ))}
      </div>

      {/* QUESTIONS */}
      <div className="faq-accordion">
        {filteredFaq.map((item, index) => (
          <div
            key={index}
            className={`faq-card ${openIndex === index ? "open" : ""}`}
          >
            <div
              className="faq-question"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >
              <span>{item.q}</span>
              <span className="arrow">▾</span>
            </div>

            <div className="faq-answer">
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CONTACT */}
      <div className="faq-contact">
        <h3>Still Have Questions?</h3>

        <div className="contact-grid">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <textarea placeholder="Your Message" />
        </div>

        <button className="send-msg-btn">Send Message</button>
      </div>

    </section>
  );
}

/* ================= MAIN PAGE ================= */

export default function LandingPage() {
    const navigate = useNavigate();
  const [showSupport, setShowSupport] = useState(false);

  const goStudentLogin = () => navigate("/login?role=student");
  const goDonorLogin = () => navigate("/login?role=donor");
  const goStudentSignup = () => navigate("/signup?role=student");

useEffect(() => {
  const elements = document.querySelectorAll(
    ".fade-up, .fade-left, .fade-right"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {

        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        } else if (entry.boundingClientRect.top > 0) {
          // remove only when scrolling back up
          entry.target.classList.remove("show");
        }

      });
    },
    {
      threshold: 0.05   // lower threshold for mobile
    }
  );

  elements.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}, []);

const ngoRow1 = [ngo01, ngo02, ngo03, ngo04, ngo05, ngo06, ngo07];
const ngoRow2 = [ngo08, ngo09, ngo10, ngo11, ngo12, ngo13, ngo14];
const ngoRow3 = [ngo15, ngo16, ngo17, ngo18, ngo19, ngo20, ngo21];

  return (
    <>
      <Navbar />

      {/* HOME / HERO */}
      <>
          <section id="home" className="home-hero page-section">
            
            {/* Floating shapes */}
            <span className="shape dot"></span>
            <span className="shape dot small"></span>
            <span className="shape triangle"></span>
            <span className="shape triangle small"></span>

            <div className="home-container">

              {/* LEFT CONTENT */}
              <div className="home-text fade-left">
                <h1 className="hero-title">
  Empowering Education <br />
  <span>Bridging Dreams to Reality</span>
</h1>

               <p>
  VidyaSetu connects deserving students with verified scholarships,
  NGOs and compassionate donors across India.
</p>

                <div className="hero-buttons">

<button className="login-btn" onClick={goStudentLogin}>
  Get Started
</button>

<button
  className="login-btn"
  onClick={() => setShowSupport(true)}
>
  Support VidyaSetu ❤️
</button>

</div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="home-image fade-right">
                <div className="image-circle">
                  <img src={hero} alt="Students learning together" />
                </div>
              </div>

            </div>
          </section>

          {/* INFO IMAGE CARDS */}
          <section className="info-cards fade-up">
            <div className="info-card">
              <img src={home1} alt="Education challenges" />
              <div className="info-overlay">
                <h3>Breaking Financial <span>Barriers</span></h3>
<p>
  Many talented students struggle due to financial challenges.
  VidyaSetu ensures access to opportunities.
</p>
              </div>
            </div>

            <div className="info-card">
              <img src={home3} alt="Early support" />
              <div className="info-overlay">
<h3>Early Educational <span>Support</span></h3>
<p>
  Timely support can prevent students from dropping out
  and help them stay on track.
</p>
              </div>
            </div>

            <div className="info-card">
              <img src={rularstu} alt="Early support" />
              <div className="info-overlay">
                <h3>Support for Rural <span>Students</span></h3>
<p>
  We prioritize students from underrepresented and rural
  communities across India.
</p>
              </div>
            </div>

            <div className="info-card">
              <img src={student} alt="Early support" />
              <div className="info-overlay">
                <h3>Empowering Young <span>Dreams</span></h3>
<p>
  Education opens doors to opportunities and a brighter future.
</p>
              </div>
            </div>
          </section>
          {showSupport && (
  <div className="support-popup-overlay">

    <div className="support-popup">

      <h2>Support VidyaSetu</h2>

      <p>
        VidyaSetu is built to help students connect with
        scholarships, NGOs and donors. Your support helps
        us improve the platform and reach more students.
      </p>

      <img
        src={supportQR}
        alt="Support QR"
        className="support-qr"
      />

      <p className="qr-note">
        This QR code is for demonstration purposes only.
      </p>

      <button
        className="login-btn"
        onClick={() => setShowSupport(false)}
      >
        Close
      </button>

    </div>

  </div>
)}
        </>

      {/* ABOUT */}
     {/* ================= ABOUT US ================= */}

 <section
  id="about"
  className="about-bg-section fade-up"
    style={{ backgroundImage: `url(${child3})` }}
  >
    {/* HEADING (NO CONTAINER) */}
    <div className="about-heading">
      <h2>
  About <span>VidyaSetu</span>
</h2>
      <p>Bridging Education & Opportunity</p>
    </div>

 {/* OUR STORY */}

<div className="our-story">

  <p>
    VidyaSetu was developed as a final-year project by a group of four
    students who wanted to address the challenges many students face
    while searching for educational support. During our research, we
    observed that information about government schemes, scholarships,
    and educational assistance is scattered across multiple sources.
  </p>

  <p>
    Many students struggle to find reliable information about available
    schemes, where to apply, and how to complete the application process.
  </p>

  <p>
    Another major difficulty we identified was the traditional process
    involved in applying for such opportunities. In many cases, students
    are required to go through manual paperwork, submit physical
    documents, and visit multiple offices or organizations.
  </p>

  <p>
    To better understand these challenges, we conducted research and
    visited several NGOs and organizations working in education support.
  </p>

  <p>
    With guidance from our project mentor, we developed
    <strong> VidyaSetu — a platform that brings verified government
    schemes, NGOs, trusts, and donors together in one place.</strong>
  </p>

</div>


<div className="project-gallery">

  <h3 className="gallery-title">Project Journey</h3>

  <div className="gallery-frame">

    <div className="gallery-track">

      <img src={team1} alt="project 1" />
      <img src={team2} alt="project 2" />
      <img src={team3} alt="project 3" />

      {/* repeat for smooth infinite scroll */}
      <img src={team1} alt="project 4" />
      <img src={team2} alt="project 5" />
      <img src={team3} alt="project 6" />

    </div>

  </div>

</div>
{/* ================= OUR TEAM ================= */}

<div className="team-section fade-up">

<h3>Meet Our Team</h3>

<div className="team-grid">

  {/* GUIDE */}

  <div className="team-card guide">
    <img src={anjum} alt="Anjum" />
    <h4>Mr. Anjum Mujawar</h4>
    <p>Project Guide</p>
  </div>

  {/* STUDENTS */}

  <div className="team-card">
    <img src={chetan} alt="Chetan Shinde" />
    <h4>Chetan Shinde</h4>
    <p>Student Developer</p>
  </div>

  <div className="team-card">
    <img src={almira} alt="Almira" />
    <h4>Almira Karjikar</h4>
    <p>Student Developer</p>
  </div>

  <div className="team-card">
    <img src={darshani} alt="Darshani" />
    <h4>Darshani Shinde</h4>
    <p>Student Developer</p>
  </div>

  <div className="team-card">
    <img src={siddhi} alt="Siddhi" />
    <h4>Siddhi Lawand</h4>
    <p>Student Developer</p>
  </div>

</div>

</div>

    {/* MAP AT BOTTOM */}
    <div className="about-map">
      <img
        src={indiaMap}
        alt="India map showing VidyaSetu location"
        className="india-map-img"
      />

      <span className="map-pin">
        <span className="pulse"></span>
        Mumbai
      </span>
    </div>
  </section>

      {/* SERVICES */}
        <section id="services" className="services-wrapper fade-up">
          <div className="services-header">
            <h2>
  Our <span>Services</span>
</h2>
            <p>
              VidyaSetu builds a transparent and trustworthy bridge between
              students who need support and donors who want to make a real impact.
            </p>
          </div>

            {/* STUDENT SUPPORT */}
            <div className="services-grid">

  {/* STUDENT SUPPORT */}
  <div className="oval-card">
    <div className="blob"></div>
    <div className="oval-icon">
      <FaGraduationCap />
    </div>

    <h3>Student Support</h3>
    <p>
      We help deserving students continue their education by connecting
      them with verified scholarships and compassionate donors.
    </p>

  
  </div>

  {/* DONOR TRANSPARENCY */}
  <div className="oval-card">
    <div className="blob"></div>
    <div className="oval-icon">
      <FaMoneyBillWave />
    </div>

    <h3>NGO & Trust Support</h3>
    <p>
     We collaborate with education-focused NGOs and charitable trusts to support students by covering partial or full academic fees,
    </p>
  </div>

  

  {/* SECURE PLATFORM */}
  <div className="oval-card">
    <div className="blob"></div>
    <div className="oval-icon">
      <FaUserCheck />
    </div>

    <h3>CSR & Corporate Initiatives</h3>
    <p>
      CSR partners support students by funding educational fees through structured programs, enabling access to quality education and long-term academic growth.
    </p>
  </div>

  {/* INDIVIDUAL DONORS */}
<div className="oval-card">
  <div className="blob"></div>
  <div className="oval-icon">
    <FaStar />
  </div>

  <h3>Individual Donors</h3>
  <p>
    Compassionate individuals directly support verified students,
    ensuring transparency, accountability, and real educational outcomes.
  </p>
</div>

</div>
        </section>

     {/* IMPACT */}
  <section id="impact" className="impact-wrapper">
  <div className="fade-up">

    {/* HEADER */}
    <div className="impact-header fade-up">
      <h2>
  Creating <span>Impact</span>
</h2>
      <p>
        VidyaSetu connects students with verified scholarships, NGOs, CSR
        initiatives, and individual donors — ensuring education reaches
        those who need it the most.
      </p>
    </div>

    {/* STATS */}
    <div className="impact-stats fade-up">
      <div className="impact-card">
        <h3>2,500+</h3>
        <span>Students Supported</span>
        <p>Across school, college & higher education</p>
      </div>

      <div className="impact-card highlight">
        <h3>₹3.5 Cr+</h3>
        <span>Education Funding</span>
        <p>Scholarships, fees, books & digital access</p>
      </div>

      <div className="impact-card">
        <h3>1,200+</h3>
        <span>Donors & NGOs</span>
        <p>Individuals, trusts & CSR partners</p>
      </div>
    </div>

    {/* SCHOLARSHIP ECOSYSTEM */}
    <div className="impact-ecosystem fade-up">

      <h3>Our Scholarship & <span> Support Ecosystem </span></h3>

<div className="ecosystem-grid">

  <div className="ecosystem-card fade-left">
    <img src={documentsImg} alt="Student Verification Ecosystem" />
    <h4>Student Verification System</h4>
    <p>
      VidyaSetu verifies student profiles through structured
      documentation review and eligibility screening to ensure
      that only genuine and deserving applicants become part
      of the support ecosystem.
    </p>
  </div>

  <div className="ecosystem-card fade-up">
    <img src={studentImg} alt="Scholarship Integration Network" />
    <h4>Scholarship Integration Network</h4>
    <p>
      We connect students to verified government and private
      scholarship programs, simplifying discovery and application
      through guided and transparent support.
    </p>
  </div>

  <div className="ecosystem-card fade-up">
    <img src={ngoImg} alt="NGO & CSR Collaboration Hub" />
    <h4>NGO & CSR Collaboration Hub</h4>
    <p>
      VidyaSetu collaborates with trusted NGOs and corporate
      CSR initiatives to create structured funding pathways
      that ensure long-term educational continuity.
    </p>
  </div>

  <div className="ecosystem-card fade-right">
    <img src={feature2Img} alt="Transparent Donor Network" />
    <h4>Transparent Donor Network</h4>
    <p>
      Individual donors directly support verified student needs
      through a secure and transparent system that enables
      accountability, progress tracking, and measurable impact.
    </p>
  </div>

</div>
</div>
</div>
  </section>

     {/* ================= STUDENTS (UPDATED) ================= */}
  <section id="students" className="students-section fade-up">

    {/* Floating background shapes */}
    <span className="shape dot"></span>
    <span className="shape dot small"></span>
    <span className="shape triangle"></span>

    {/* MAIN CONTENT */}
    <div className="students-wrapper">

      {/* LEFT CONTENT */}
      <div className="students-content fade-left">
        <h2>
          For <span>Students</span>
        </h2>

        <p className="students-tagline">
          Because financial barriers should never decide your future.
        </p>

        <h3>Your Dreams Deserve a Fair Chance</h3>

        <p className="students-desc">
          Across India, millions of talented students struggle to continue
          their education due to financial hardship. These challenges often
          force dreams to pause — not because of lack of ability, but lack
          of access.
        </p>

        <p className="students-desc">
          <strong>Vidyasetu</strong> bridges this gap by connecting deserving
          students with <strong>verified scholarships</strong>,
          <strong> trusted NGOs</strong>, <strong>CSR initiatives</strong>,
          and <strong>compassionate donors</strong>.
        </p>

        <ul className="students-list">
          <li>Access to verified government & private scholarships</li>
          <li> NGO & trust-based education support</li>
          <li> Simple, guided & transparent application process</li>
          <li> Support for school, college & professional education</li>
          <li>Priority for rural & underrepresented students</li>
        </ul>

       <button className="login-btn"
          onClick={() => navigate("/login?role=student")}
        >
          Explore Opportunities
        </button>
      </div>

      {/* RIGHT IMAGE */}
      <div className="students-image fade-right">
        <img src={studentp} alt="Indian students learning together" />
      </div>

    </div>

    {/* HOW IT WORKS */}
    <div className="students-steps fade-up">
      <h3>How It Works</h3>

      <div className="steps-grid">
        <div className="step-card">
          <span>1</span>
          <h4>Create Profile</h4>
          <p>Register and complete your student profile.</p>
        </div>

        <div className="step-card">
          <span>2</span>
          <h4>Apply Easily</h4>
          <p>Submit documents with step-by-step guidance.</p>
        </div>

        <div className="step-card">
          <span>3</span>
          <h4>Get Verified</h4>
          <p>Profiles are verified by trusted partners.</p>
        </div>

        <div className="step-card">
          <span>4</span>
          <h4>Receive Support</h4>
          <p>Scholarships & NGO aid reach you directly.</p>
        </div>
      </div>
    </div>

    {/* IMPACT STRIP */}
    <div className="students-footer fade-up">
      <h3>Beyond Money — We Support Your Journey</h3>
      <p>
        Vidyasetu is not just funding education. We help students stay
        confident, motivated, and hopeful — knowing that someone believes
        in their potential.
      </p>

      <div className="student-stats">
        <div>
          <h4>100%</h4>
          <p>Verified Support</p>
        </div>
        <div>
          <h4>Zero</h4>
          <p>Middlemen</p>
        </div>
        <div>
          <h4>Pan-India</h4>
          <p>Reach</p>
        </div>
      </div>
    </div>
    

  </section>
  {/* ================= NGO PARTNERS ================= */}

<section className="ngo-scroll-section fade-up">

  <h3 className="ngo-title">
  Trusted NGO & <span>Scholarship Trust</span>
</h3>
  <p className="ngo-sub">
    VidyaSetu connects students with verified NGOs and scholarship
    organizations across India to expand educational opportunities.
  </p>

  <div className="ngo-scroll-wrapper">

    {/* Row 1 */}
    <div className="ngo-row scroll-left">
      <div className="ngo-track">
        {[...ngoRow1, ...ngoRow1].map((logo, i) => (
          <img key={i} src={logo} alt="ngo logo" />
        ))}
      </div>
    </div>

    {/* Row 2 */}
    <div className="ngo-row scroll-right">
      <div className="ngo-track">
        {[...ngoRow2, ...ngoRow2].map((logo, i) => (
          <img key={i} src={logo} alt="ngo logo" />
        ))}
      </div>
    </div>

    {/* Row 3 */}
    <div className="ngo-row scroll-left">
      <div className="ngo-track">
        {[...ngoRow3, ...ngoRow3].map((logo, i) => (
          <img key={i} src={logo} alt="ngo logo" />
        ))}
      </div>
    </div>

  </div>

</section>

      {/* DONORS */}

<section
  id="donors"
  className="donor-wrapper"
  style={{
    backgroundImage: `
      linear-gradient(
        rgba(247, 251, 255, 0.78),
        rgba(238, 244, 255, 0.78)
      ),
      url(${donorBg})
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  }}
>
  <div className="fade-up">

    {/* ================= HEADER ================= */}
    <div className="donor-header fade-up">
      <h2>
  For <span>Donors</span>
</h2>

      <p>
        VidyaSetu empowers individuals, NGOs, and organizations to support
        verified students across India through transparent and meaningful
        educational assistance.
      </p>
    </div>

    {/* ================= MAIN CONTENT ================= */}
    <div className="donor-content fade-up">

      {/* LEFT TEXT */}
      <div className="donor-text fade-left">
        <h3>Be the Bridge to Education</h3>

        <p>
          Across India, thousands of talented students are forced to pause
          or discontinue their education due to financial hardship.
          VidyaSetu connects donors directly with verified student needs,
          ensuring that support reaches the right place at the right time.
        </p>

        <ul className="donor-features">
          <li><FiCheckCircle /> Purpose-driven education support</li>
<li><FiCheckCircle /> Transparent fund utilization</li>
<li><FiCheckCircle /> Academic progress and impact tracking</li>
        </ul>

        <button className="login-btn" onClick={goDonorLogin}>
          Support a Student
        </button>
      </div>

      {/* RIGHT IMAGE */}
      <div className="donor-image fade-right">
        <img src={donorFinancial} alt="Donor supporting education" />
      </div>

    </div>

    {/* ================= Donor Types ================= */}
    <div className="story-section fade-up">
      <h3>Types of Donors</h3>
      <p className="story-sub">
        Vidyasetu connects students with individual donors and also provides verified links to government and NGO scholarship programs.
          to help students who are unaware of available opportunities.
      </p>

      <div className="story-grid">

          {/* Individual Donor */}
    <div className="story-card">
      <img src={donor1} alt="Individual Donor" />
      <h4>Individual Donor (Through Vidyasetu)</h4>
      <p>
        Individual donors register on Vidyasetu and directly support 
        verified student applications through our secure platform.
      </p>
      <span>Process: Apply → Verify → Direct Funding</span>
    </div>

    {/* Government */}
    <div className="story-card">
      <img src={ss2} alt="Government Scholarship" />
      <h4>Government Scholarship Schemes</h4>
      <p>
        We provide verified links to official government scholarship 
        portals so students can apply easily without confusion.
      </p>
      <span>Support: Scholarships, Grants, Education Schemes</span>
    </div>

    {/* NGO */}
    <div className="story-card">
      <img src={ngo1} alt="NGO Support" />
      <h4>NGO Educational Support</h4>
      <p>
        Vidyasetu connects students with trusted NGOs by providing 
        application links and proper guidance for eligibility.
      </p>
      <span>Support: Sponsorship, Fee Support, Skill Programs</span>
    </div>
</div>
  </div>
</div>

    {/* ================= IMPACT TIMELINE ================= */}
    <div className="timeline-section fade-up">
      <h3>
  Your <span>Impact Journey</span>
</h3>
      <p className="timeline-sub">
        From verification to graduation — see how your support makes a
        lasting difference.
      </p>

      <div className="timeline">

  <div className="timeline-step step-1 completed">
    <FaUserCheck className="timeline-icon" />
    <p>Student Verified</p>
  </div>

  <div className="timeline-step step-2 completed">
    <FaMoneyBillWave className="timeline-icon" />
    <p>Funds Allocated</p>
  </div>

  <div className="timeline-step active">
    <FaHourglassHalf className="timeline-icon" />
    <p>Education Support</p>
  </div>

  <div className="timeline-step step-4">
    <FaGraduationCap className="timeline-icon" />
    <p>Academic Progress</p>
  </div>

  <div className="timeline-step step-5">
    <FaStar className="timeline-icon" />
    <p>Milestone Achieved</p>
  </div>

      </div>
    </div>

  </section>

     {/* APPLY */}

  <section id="apply" className="apply-wrapper fade-up">

    {/* Floating shapes */}
    <span className="apply-shape dot"></span>
    <span className="apply-shape triangle"></span>

    <div className="apply-container">

      {/* LEFT CONTENT */}
      <div className="apply-text fade-left">
        <h2>
          Apply for <span>Educational Support</span>
        </h2>

        <p className="apply-sub">
          VidyaSetu helps deserving students across India continue their
          education through verified scholarships and compassionate donors.
        </p>

        {/* TRUST POINTS */}
        <div className="apply-points">
          <div><FiCheckCircle /> 100% Free & Secure Application</div>
<div><FiCheckCircle /> Verified Scholarships & Donors</div>
<div><FiCheckCircle /> Open for School, College & Higher Education</div>
<div><FiCheckCircle /> Support for Rural & Low-Income Students</div>
        </div>

        {/* STEPS */}
        <div className="apply-steps">
          <div className="step">
            <span>1</span>
            <p>Submit Application</p>
          </div>
          <div className="step">
            <span>2</span>
            <p>Profile Verification</p>
          </div>
          <div className="step">
            <span>3</span>
            <p>Get Education Support</p>
          </div>
        </div>

        <button className="login-btn" onClick={goStudentSignup}>
          Apply in 5 Minutes
        </button>

        <p className="apply-note">
          * No application fees • Transparent process • Trusted platform
        </p>
      </div>

      {/* RIGHT IMAGE */}
      <div className="apply-image fade-right">
        <div className="apply-img-card">
          <img src={apply} alt="Student applying for scholarship" />
        </div>
      </div>

    </div>
  </section>

      {/* FAQ */}
      <div id="faq">
  <FAQSection />
</div>
      
    </>
  );
}