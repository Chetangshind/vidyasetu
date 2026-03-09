import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  FaClipboardList, 
  FaCheckCircle, 
  FaUsers, 
  FaGraduationCap, 
  FaDownload,
  FaFilter,
  FaTrophy,
  FaChartLine,
  FaArrowUp,
  FaExclamationCircle,
  FaSync,
  FaVideo,
  FaCalendarAlt,
  FaPercent,
  FaLightbulb
} from 'react-icons/fa';
import './DonorReport.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://${API}/api";

const DonorReport = () => {
  const [selectedScheme, setSelectedScheme] = useState("All Schemes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  const fetchReportData = async (scheme) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const url = scheme && scheme !== "All Schemes" 
        ? `${API_BASE}/donor/report?scheme=${encodeURIComponent(scheme)}`
        : `${API_BASE}/donor/report`;
        
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to fetch report data");
      const data = await res.json();
      
      if (data.success) {
        setReportData(data.data);
      } else {
        throw new Error(data.message || "Failed to load report data");
      }
    } catch (err) {
      setError(err.message || "Unable to load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(selectedScheme);
  }, [selectedScheme]);

  const handleDownload = () => {
    window.print();
  };

  const handleRefresh = () => {
    fetchReportData(selectedScheme);
  };

  if (loading) {
    return (
      <div className="report-loading-container">
        <div className="loader">
          <FaSync className="spin-icon" />
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-error-container">
        <FaExclamationCircle className="error-icon" />
        <p>{error}</p>
        <button onClick={() => fetchReportData(selectedScheme)} className="retry-btn">Retry</button>
      </div>
    );
  }

  if (!reportData) return null;

  // Calculate Approval Rate
  const approvalRate = reportData.totalApplications > 0
    ? Math.round((reportData.totalApproved / reportData.totalApplications) * 100)
    : 0;

  // Extract Approved vs Rejected for Ratio
  const approvedCount = reportData.statusData?.find(s => s.name === "Approved")?.value || 0;
  const rejectedCount = reportData.statusData?.find(s => s.name === "Rejected")?.value || 0;

  const summaryStats = [
    { title: 'Total Schemes Created', value: reportData.totalSchemes, icon: <FaClipboardList />, gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
    { title: 'Active Schemes', value: reportData.activeSchemes, icon: <FaCheckCircle />, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { title: 'Total Applications Received', value: reportData.totalApplications, icon: <FaUsers />, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { title: 'Students Selected', value: reportData.totalApproved, icon: <FaGraduationCap />, gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { title: 'Approval Rate', value: `${approvalRate}%`, icon: <FaPercent />, gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' },
    { title: 'Total Meetings', value: reportData.totalMeetings || 0, icon: <FaVideo />, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    { title: 'Upcoming Meetings', value: reportData.upcomingMeetings || 0, icon: <FaCalendarAlt />, gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
  ];

  const STATUS_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  const MEETING_COLORS = ['#6366f1', '#ec4899'];

  const schemesOptions = ["All Schemes", ...(reportData.schemes?.map(s => s.schemeName) || [])];

  return (
    <div className="donor-report-container">
      {/* Header Section */}
      <header className="report-header">
        <div className="header-text">
          <h1>Donor Reports</h1>
          <p>Track the performance and impact of your scholarship schemes</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={handleRefresh} title="Refresh Data">
            <FaSync />
          </button>
          <button className="download-btn" onClick={handleDownload}>
            <FaDownload /> <span>Download Report</span>
          </button>
        </div>
      </header>

      {/* Filter Section */}
      <div className="filter-wrapper">
        <div className="filter-container">
          <label htmlFor="scheme-filter">
            <FaFilter className="filter-icon" /> Filter by Scheme
          </label>
          <select 
            id="scheme-filter" 
            value={selectedScheme} 
            onChange={(e) => setSelectedScheme(e.target.value)}
            className="scheme-select"
          >
            {schemesOptions.map((scheme, idx) => (
              <option key={`${scheme}-${idx}`} value={scheme}>{scheme}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Section */}
      <section className="stats-grid">
        {summaryStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: stat.gradient }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <div className="stat-value-container">
                <p className="stat-value">{stat.value}</p>
                <span className="stat-trend"><FaArrowUp /> Live</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="charts-section">
        <div className="section-header">
          <FaChartLine className="section-icon" />
          <h2>Performance & Meetings</h2>
        </div>
        <div className="charts-container">
          <div className="chart-card">
            <h3>Applications per Scheme</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={reportData.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar dataKey="applications" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <h3>Application Status Distribution</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={reportData.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {reportData.statusData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <h3>Meeting Type Distribution</h3>
            <div className="chart-wrapper">
              {reportData.totalMeetings > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={reportData.meetingTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {reportData.meetingTypes?.map((entry, index) => (
                        <Cell key={`cell-meeting-${index}`} fill={MEETING_COLORS[index % MEETING_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart-msg">
                  <FaVideo className="empty-chart-icon" />
                  <p>No meeting data recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section className="insights-section">
        <div className="insight-card">
          <div className="insight-header">
            <FaLightbulb className="insight-icon" />
            <h3>Application Status Ratio</h3>
          </div>
          <div className="insight-content">
            <p className="ratio-label">Approved : Rejected</p>
            <div className="ratio-display">
              <span className="ratio-val approved">{approvedCount}</span>
              <span className="ratio-sep">:</span>
              <span className="ratio-val rejected">{rejectedCount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Performing Scheme Card */}
      {reportData.topScheme && (
        <section className="top-performing-section">
          <div className="top-performing-card">
            <div className="top-performing-header">
               <div className="trophy-badge">
                 <FaTrophy className="trophy-icon" />
               </div>
               <h2>Top Performing Scheme</h2>
            </div>
            <div className="top-performing-content">
              <h3 className="scheme-name-highlight">{reportData.topScheme.name}</h3>
              <div className="performance-metrics">
                <div className="metric">
                  <span className="metric-label">Applications</span>
                  <span className="metric-value">{reportData.topScheme.applications}</span>
                </div>
                <div className="metric-divider"></div>
                <div className="metric">
                  <span className="metric-label">Approved</span>
                  <span className="metric-value">{reportData.topScheme.approved}</span>
                </div>
                <div className="metric-divider"></div>
                <div className="metric">
                  <span className="metric-label">Success Rate</span>
                  <span className="metric-value rate">{reportData.topScheme.successRate}%</span>
                </div>
              </div>
            </div>
            <div className="card-footer-decoration"></div>
          </div>
        </section>
      )}

      {/* Upcoming Meetings Section */}
      <section className="report-table-section">
        <div className="section-header">
          <FaCalendarAlt className="section-icon" />
          <h2>Upcoming Meetings</h2>
        </div>
        <div className="table-card">
          <div className="table-responsive">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Scheme</th>
                  <th>Meeting Type</th>
                  <th>Date</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {reportData.upcomingMeetingsList?.map((row, index) => (
                  <tr key={index}>
                    <td className="font-medium">{row.studentName}</td>
                    <td>{row.scheme}</td>
                    <td>{row.meetingType}</td>
                    <td className="date-cell">{row.date}</td>
                    <td>
                      <span className={`status-badge ${row.mode.toLowerCase() === 'online' ? 'active' : 'pending'}`}>
                         {row.mode}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!reportData.upcomingMeetingsList || reportData.upcomingMeetingsList.length === 0) && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-gray)' }}>
                      No upcoming meetings scheduled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Scheme Table Section */}
      <section className="report-table-section">
        <div className="section-header">
          <FaClipboardList className="section-icon" />
          <h2>Scheme Wise Report</h2>
        </div>
        <div className="table-card">
          <div className="table-responsive">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Scheme Name</th>
                  <th>Applications</th>
                  <th>Approved</th>
                  <th>Rejected</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.schemes?.map((row, index) => (
                  <tr key={index}>
                    <td className="scheme-td">
                      <div className="scheme-name-cell">
                        <div className="scheme-dot" style={{ background: row.status?.toLowerCase() === 'active' ? '#10b981' : '#ef4444' }}></div>
                        {row.schemeName}
                      </div>
                    </td>
                    <td><span className="count-pill apps">{row.applications}</span></td>
                    <td><span className="count-pill approved">{row.approved}</span></td>
                    <td><span className="count-pill rejected">{row.rejected}</span></td>
                    <td>
                      <span className={`status-badge ${row.status?.toLowerCase()}`}>
                        {row.status?.toLowerCase() === 'active' ? <FaCheckCircle /> : null} {row.status}
                      </span>
                    </td>
                    <td className="date-cell">{row.createdDate}</td>
                  </tr>
                ))}
                {(!reportData.schemes || reportData.schemes.length === 0) && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-gray)' }}>
                      No scheme data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonorReport;
