import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Donors.css";
import { useLocation } from "react-router-dom";

export default function Donors() {
  const navigate = useNavigate();

  const [donors, setDonors] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [entityType, setEntityType] = useState("donor");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const location = useLocation();
const params = new URLSearchParams(location.search);
const filter = params.get("filter");

useEffect(() => {
  if (!filter) return;

  // ===== DONOR FILTERS =====
  if (filter === "warnings") {
    setEntityType("donor");
    setStatusFilter("Warning Issued");
  }

  if (filter === "suspended") {
    setEntityType("donor");
    setStatusFilter("Suspended");
  }

  if (filter === "underreview") {
    setEntityType("donor");
    setStatusFilter("Under Review");
  }

  // ===== SCHEME FILTERS =====
  if (filter === "scheme-underreview") {
    setEntityType("scheme");
    setStatusFilter("Under Review");
  }

  if (filter === "scheme-suspended") {
    setEntityType("scheme");
    setStatusFilter("Closed");   // because suspended = closed in schema
  }

}, [filter]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [donorRes, schemeRes] = await Promise.all([
      axios.get("http://localhost:5050/api/admin/donors"),
      axios.get("http://localhost:5050/api/admin/schemes"),
    ]);
    setDonors(donorRes.data);
    setSchemes(schemeRes.data);
  };

  const handleRefresh = () => fetchData();

  const sourceData = entityType === "donor" ? donors : schemes;

  const statusList =
    entityType === "donor"
      ? ["All", "Active", "Under Review", "Warning Issued", "Suspended"]
      : ["All", "Active", "Under Review", "Draft", "Closed"];

  const countStatus = (status) => {
    if (entityType === "scheme") {
      if (status === "Under Review") {
        return sourceData.filter(
          (item) => item.moderationStatus === "Under Review"
        ).length;
      }

      return sourceData.filter(
        (item) =>
          item.moderationStatus !== "Under Review" &&
          (item.status || "draft").toLowerCase() ===
            status.toLowerCase()
      ).length;
    }

    return sourceData.filter(
      (item) =>
        (item.status || "Active").toLowerCase() ===
        status.toLowerCase()
    ).length;
  };

  const filteredData = sourceData.filter((item) => {
    let matchStatus = false;

    if (statusFilter === "All") {
      matchStatus = true;
    } else if (
      entityType === "scheme" &&
      statusFilter === "Under Review"
    ) {
      matchStatus = item.moderationStatus === "Under Review";
    } else if (entityType === "scheme") {
      matchStatus =
        item.moderationStatus !== "Under Review" &&
        (item.status || "draft")
          .toLowerCase() === statusFilter.toLowerCase();
    } else {
      matchStatus =
        (item.status || "Active")
          .toLowerCase() === statusFilter.toLowerCase();
    }

    const matchSearch =
      (item.fullName || item.schemeName || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchStatus && matchSearch;
  });

  const getInitials = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    return words.length > 1
      ? words[0][0] + words[1][0]
      : words[0][0];
  };

  const avatarColors = [
    "avatar-yellow",
    "avatar-pink",
    "avatar-blue",
    "avatar-purple",
    "avatar-green",
    "avatar-teal",
  ];

  const getAvatarColor = (name) => {
    if (!name) return avatarColors[0];
    return avatarColors[name.charCodeAt(0) % avatarColors.length];
  };

  return (
    <div className="donor-admin-container">

      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h2 className="admin-title">
            {entityType === "donor"
              ? "Donor Management"
              : "Scheme Management"}
          </h2>
          <p className="admin-sub">
            Monitor and manage professionally
          </p>
        </div>

        <div className="header-right">
          <div className="summary-cards">
            {entityType === "donor" ? (
              <>
                <div className="summary-card active-box">
                  <h3>{countStatus("Active")}</h3>
                  <span>ACTIVE</span>
                </div>
                <div className="summary-card review-box">
                  <h3>{countStatus("Under Review")}</h3>
                  <span>REVIEW</span>
                </div>
                <div className="summary-card warned-box">
                  <h3>{countStatus("Warning Issued")}</h3>
                  <span>WARNED</span>
                </div>
                <div className="summary-card suspended-box">
                  <h3>{countStatus("Suspended")}</h3>
                  <span>SUSPENDED</span>
                </div>
              </>
            ) : (
              <>
                <div className="summary-card active-box">
                  <h3>{countStatus("Active")}</h3>
                  <span>ACTIVE</span>
                </div>
                <div className="summary-card warned-box">
                  <h3>{countStatus("Under Review")}</h3>
                  <span>UNDER REVIEW</span>
                </div>
                <div className="summary-card review-box">
                  <h3>{countStatus("Draft")}</h3>
                  <span>DRAFT</span>
                </div>
                <div className="summary-card suspended-box">
                  <h3>{countStatus("Closed")}</h3>
                  <span>CLOSED</span>
                </div>
              </>
            )}
          </div>

          <button className="refresh-btn" onClick={handleRefresh}>
            ⟳ Refresh
          </button>
        </div>
      </div>

      {/* SWITCH */}
      <div className="entity-switch">
        <button
          className={`switch-btn ${entityType === "donor" ? "active" : ""}`}
          onClick={() => {
            setEntityType("donor");
            setStatusFilter("All");
          }}
        >
          Donors
        </button>
        <button
          className={`switch-btn ${entityType === "scheme" ? "active" : ""}`}
          onClick={() => {
            setEntityType("scheme");
            setStatusFilter("All");
          }}
        >
          Schemes
        </button>
      </div>

      {/* FILTERS */}
      <div className="top-filters">
        {statusList.map((status) => (
          <button
            key={status}
            className={`top-filter-btn ${
              statusFilter === status ? "active" : ""
            }`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        className="search-bar"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email / Amount</th>
              <th>Warnings</th>
              <th>Status</th>
              <th>View</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item) => {
              const warningCount = item.warningCount || 0;

              const displayStatus =
                entityType === "scheme" &&
                item.moderationStatus === "Under Review"
                  ? "Under Review"
                  : item.status || "draft";

              return (
                <tr key={item._id}>
                  <td className="name-cell">
                    {entityType === "donor" && (
                      <div
                        className={`avatar ${getAvatarColor(
                          item.fullName
                        )}`}
                      >
                        {getInitials(item.fullName)}
                      </div>
                    )}
                    <span>{item.fullName || item.schemeName}</span>
                  </td>

                  <td>
                    {entityType === "donor"
                      ? item.email
                      : `₹${item.scholarshipAmount}`}
                  </td>

                  <td>
                    <div className="warning-dots">
                      {[1, 2, 3].map((num) => (
                        <span
                          key={num}
                          className={`dot ${
                            num <= warningCount ? "filled" : ""
                          }`}
                        ></span>
                      ))}
                      <span>{warningCount}/3</span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`status ${displayStatus
                        .toLowerCase()
                        .replace(/\s/g, "-")}`}
                    >
                      {displayStatus}
                    </span>
                  </td>

                  <td>
                    <button
                      className="investigate-btn"
                      onClick={() =>
                        navigate(
                          entityType === "donor"
                            ? `/admin/donors/profile/${item._id}`
                            : `/admin/donors/scheme/${item._id}`
                        )
                      }
                    >
                     {entityType === "donor" ? "View Profile" : "View Scheme"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}