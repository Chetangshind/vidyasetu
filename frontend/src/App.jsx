import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import LandingPage from "./landing/LandingPage";

// 🔥 UPDATED AUTH IMPORTS
import Auth from "./landing/Auth";

// ============ LAYOUTS ============
import StudentLayout from "./layouts/student/Layout.jsx";
import DonorLayout from "./layouts/donor/Layout.jsx";
import AdminLayout from "./layouts/admin/Layout.jsx";

// ============ ADMIN PAGES ============
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminReports from "./pages/admin/Reports.jsx";
import GovSchemeManagement from "./pages/admin/GovSchemeManagement.jsx";
import Donors from "./pages/admin/Donors";
import AdminViewDonorProfile from "./pages/admin/AdminViewDonorProfile";
import AdminViewDonorScheme from "./pages/admin/AdminViewDonorScheme";
import Students from "./pages/admin/Students"; // ✅
import AdminNotifications from "./pages/admin/Notifications.jsx";
import AdminSupportDesk from "./pages/admin/AdminSupportDesk";

// ============ DONOR PAGES ============
import DonorDashboard from "./pages/donor/Dashboard.jsx";
import DonorProfile from "./pages/donor/Profile.jsx";
import CreateScheme from "./pages/donor/CreateScheme.jsx";
import DonorNotifications from "./pages/donor/Notifications.jsx";
import DHelpSupport from "./pages/donor/DHelpSupport";
import DonorReports from "./pages/donor/DonorReport.jsx"; 
import DonorSettings from "./pages/donor/Settings";

// Applications
import ApprovedApplications from "./pages/donor/Applications/ApprovedApplications.jsx";
import PendingApplications from "./pages/donor/Applications/PendingApplications.jsx";
import RejectedApplications from "./pages/donor/Applications/RejectedApplications.jsx";
import SpecialRequests from "./pages/donor/Applications/SpecialRequests.jsx";
import DonorViewForm from "./pages/donor/Applications/ViewForm.jsx";

// Donations
import DonationHistory from "./pages/donor/Donations/History.jsx";
import DonationPending from "./pages/donor/Donations/Pending.jsx";
import DonationReceipt from "./pages/donor/Donations/Receipt.jsx";

// My Schemes
import ActiveSchemes from "./pages/donor/MySchemes/ActiveSchemes.jsx";
import ClosedSchemes from "./pages/donor/MySchemes/ClosedSchemes.jsx";
import DraftSchemes from "./pages/donor/MySchemes/DraftSchemes.jsx";
import ViewScheme from "./pages/donor/MySchemes/ViewScheme.jsx";


// ============ STUDENT PAGES ============
import SDashboard from "./pages/student/SDashboard.jsx";
import AvailableSchemes from "./pages/student/AvailableSchemes.jsx";
import Guidelines from "./pages/student/guidelines.jsx";
import MyAppliedSchemes from "./pages/student/MyAppliedSchemes.jsx";
import TrackExpenses from "./pages/student/TrackExpenses.jsx";
import StudentProfile from "./pages/student/Profile.jsx";
import HelpSupport from "./pages/student/HelpSupport";
import Notifications from "./pages/student/Notifications";
import StudentViewForm  from "./pages/student/ViewForm";
import StudentSettings from "./pages/student/Settings.jsx";

// ====================== MAIN APP ROUTER ======================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================== LANDING PAGE ================== */}
        <Route path="/" element={<LandingPage />} />

{/* ================== ADMIN MODULE ================== */}
  <Route path="/admin" element={<AdminLayout />}>
  <Route index element={<Navigate to="dashboard" />} />

  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="schemes" element={<GovSchemeManagement />} />
  <Route path="reports" element={<AdminReports />} />
  <Route path="students" element={<Students />} /> {/* ✅ REAL PAGE */}
  <Route path="notifications" element={<AdminNotifications />} />
<Route path="students/view-form/:id" element={<StudentViewForm />} />
  

  {/* DONOR MANAGEMENT */}
  <Route path="donors" element={<Donors />} />
  <Route path="donors/profile/:id" element={<AdminViewDonorProfile />} />
  <Route path="donors/scheme/:id" element={<AdminViewDonorScheme />} />

  {/* OTHER */}
  <Route path="support" element={<AdminSupportDesk />} />
  <Route path="settings" element={<div>Settings Page</div>} />
</Route>

        {/* ================== DONOR MODULE ================== */}
        <Route path="/donor" element={<DonorLayout />}>
          <Route index element={<Navigate to="/donor/dashboard" />} />
          <Route path="dashboard" element={<DonorDashboard />} />
          <Route path="profile" element={<DonorProfile />} />
          <Route path="create-scheme" element={<CreateScheme />} />
      <Route path="notifications" element={<DonorNotifications />} />
      <Route path="help-support" element={<DHelpSupport />} />
<Route path="reports" element={<DonorReports />} />
<Route path="settings" element={<DonorSettings />} />
          <Route path="view-scheme/:id" element={<ViewScheme />} />{" "}
          {/* ✅ CORRECT */}
          <Route
            path="applications/pending"
            element={<PendingApplications />}
          />
          <Route
            path="applications/approved"
            element={<ApprovedApplications />}
          />
          <Route
            path="applications/rejected"
            element={<RejectedApplications />}
          />
          <Route path="applications/special" element={<SpecialRequests />} />
          <Route path="applications/view/:id" element={<DonorViewForm />} />
          <Route path="my-schemes/active" element={<ActiveSchemes />} />
          <Route path="my-schemes/draft" element={<DraftSchemes />} />
          <Route path="my-schemes/closed" element={<ClosedSchemes />} />
          <Route path="donations/history" element={<DonationHistory />} />
          <Route path="donations/pending" element={<DonationPending />} />
          <Route path="donations/receipt" element={<DonationReceipt />} />
        </Route>

        {/* ================== AUTH PAGES ================== */}
        <Route path="/student/login" element={<Auth />} />
        <Route path="/student/signup" element={<Auth />} />

        {/* Global fallback → role-based login works with ?role=student */}
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />

        {/* ================== STUDENT MODULE ================== */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" />} />
          <Route path="dashboard" element={<SDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="schemes" element={<AvailableSchemes />} />
          <Route path="Guidlines" element={<Guidelines />} />
          <Route path="expenses" element={<TrackExpenses />} />
          <Route path="applied" element={<MyAppliedSchemes />} />
          <Route path="help-support" element={<HelpSupport />} />
          <Route path="/student/settings" element={<StudentSettings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="view-form" element={<StudentViewForm />} />
          <Route path="application-form/:id" element={<StudentViewForm />} />
          <Route path="view-scheme/:id" element={<ViewScheme />} />{" "}
          {/* ✅ ADD THIS */}
        </Route>

        {/* ================== 404 ================== */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
