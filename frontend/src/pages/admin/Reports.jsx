import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Reports.css";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";



// COLORS
const COLORS = ["#4f46e5", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

export default function ReportsAnalytics() {
  const [overviewData, setOverviewData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [schemeApplications, setSchemeApplications] = useState([]);
  const [applicationTrend, setApplicationTrend] = useState([]);
  const [processingTimeData, setProcessingTimeData] = useState([]);
  const [delayStatusData, setDelayStatusData] = useState([]);
  const [studentTypeData, setStudentTypeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5050/api/admin/reports"
      );

      const data = res.data;

      // Overview Cards
      setOverviewData([
        { title: "Total Students", value: data.overview?.totalStudents || 0 },
        { title: "Applications", value: data.overview?.totalApplications || 0 },
        { title: "Approved", value: data.overview?.approved || 0 },
        { title: "Pending", value: data.overview?.pending || 0 },
        { title: "Rejected", value: data.overview?.rejected || 0 },
        { title: "Schemes", value: data.overview?.totalSchemes || 0 },
      ]);

      setGenderData(data.genderData || []);
      setCategoryData(data.categoryData || []);
      setSchemeApplications(data.schemeApplications || []);
      setApplicationTrend(data.applicationTrend || []);
      setProcessingTimeData(data.processingTimeData || []);
      setDelayStatusData(data.delayStatusData || []);
      setStudentTypeData(data.studentTypeData || []);

      setLoading(false);
    } catch (error) {
      console.error("Reports Fetch Error:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="reports-container">Loading Reports...</div>;
  }

  return (
    <div className="reports-container">
      <h1 className="reports-title">Reports & Analytics</h1>

      {/* OVERVIEW */}
      <div className="overview-grid">
        {overviewData.map((item, i) => (
          <div key={i} className="overview-card">
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </div>
        ))}
      </div>

      {/* STUDENT ANALYTICS */}
      <div className="section">
        <h2>Student Analytics</h2>
        <div className="chart-grid">
          <div className="chart-box">
            <h4>Gender Distribution</h4>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
             <Pie
  data={genderData}
  dataKey="value"
  nameKey="name"
  innerRadius={60}
  outerRadius={90}
>
  {genderData.map((_, i) => (
    <Cell key={i} fill={COLORS[i % COLORS.length]} />
  ))}
</Pie>
<Legend />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h4>Category-wise Students</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SCHEME ANALYTICS */}
      <div className="section">
        <h2>Scheme Analytics</h2>
        <div className="chart-box full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={schemeApplications}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="applications"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* APPLICATION TREND */}
      <div className="section">
        <h2>Application Trends</h2>
        <div className="chart-box full">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={applicationTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4f46e5"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PROCESSING & DELAY */}
      <div className="section">
        <h2>Application Processing & Delay Analytics</h2>
        <div className="chart-grid">
          <div className="chart-box">
            <h4>Average Processing Time (Days)</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={processingTimeData}>
                <XAxis dataKey="scheme" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="days"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h4>On-Time vs Delayed Applications</h4>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={delayStatusData}
                  dataKey="value"
                  innerRadius={65}
                  outerRadius={90}
                >
                  {delayStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

     
    </div>
  );
}