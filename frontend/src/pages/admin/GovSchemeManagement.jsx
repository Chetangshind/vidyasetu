import React, { useState, useEffect } from 'react';
import axios from "axios";
import './GovSchemeManagement.css';
import { FaChartBar, FaClock, FaLayerGroup, FaSyncAlt } from "react-icons/fa";
import API from "../../api";

const GovSchemeManagement = () => {
  
  const [schemes, setSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: ''
  });

  useEffect(() => {
  fetchSchemes();
}, []);

const fetchSchemes = async () => {
  try {
    const res = await axios.get(`${API}/api/gov-schemes`);
    setSchemes(res.data);
  } catch (error) {
    console.error("Error fetching schemes:", error);
  }
};

  const filteredSchemes = schemes.filter(scheme => {
  const today = new Date();
  const schemeDate = new Date(scheme.createdAt);

  const isToday =
    schemeDate.getDate() === today.getDate() &&
    schemeDate.getMonth() === today.getMonth() &&
    schemeDate.getFullYear() === today.getFullYear();

  if (activeFilter === "today" && !isToday) return false;
  if (activeFilter === "other" && isToday) return false;

  return scheme.name.toLowerCase().includes(searchTerm.toLowerCase());
});

  const totalSchemes = schemes.length;

  // For UI layout (replacing category logic)
  const recentlyAdded = schemes.filter(s => {
  const today = new Date();
  const schemeDate = new Date(s.createdAt);

  return (
    schemeDate.getDate() === today.getDate() &&
    schemeDate.getMonth() === today.getMonth() &&
    schemeDate.getFullYear() === today.getFullYear()
  );
}).length;

  const otherSchemes = totalSchemes - recentlyAdded;

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ name: '', website: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (scheme) => {
    setEditingId(scheme._id);
    setFormData({
      name: scheme.name,
      website: scheme.website,
      description: scheme.description
    });
    setIsModalOpen(true);
  };

 const handleDeleteClick = async (id) => {
  try {
    await axios.delete(
      `${API}/api/gov-schemes/${id}`
    );

    fetchSchemes(); // refresh list from backend
  } catch (error) {
    console.error("Error deleting scheme:", error);
  }
};

const handleFormChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
const handleSaveScheme = async () => {
  if (formData.name && formData.website && formData.description) {
    try {
      if (editingId) {
        // UPDATE
        await axios.put(
          `${API}/api/gov-schemes/${editingId}`,
          formData
        );
      } else {
        // CREATE
        await axios.post(
          `${API}/api/gov-schemes`,
          formData
        );
      }

      fetchSchemes();   // refresh data
      handleCloseModal();
    } catch (error) {
      console.error("Error saving scheme:", error);
    }
  }
};

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', website: '', description: '' });
  };

  return (
    <div className="gov-scheme-container">
      <div className="scheme-header">
        <div className="header-content">
          <h1 className="management-heading">
  Government Scheme Management
</h1>
<div className="header-underline"></div>
          <p className="header-subtitle">Add, Update and Manage Official Government Scheme Links</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchSchemes}>
            <FaSyncAlt className="refresh-icon" /> Refresh
          </button>
          <button className="btn-add-scheme" onClick={handleAddClick}>
            + Add Scheme
          </button>
        </div>
      </div>

      {/* Compact Stats Layout */}
      <div className="stats-section">
        <div 
          className="stat-card"
          onClick={() => setActiveFilter("all")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon-wrapper">
            <FaChartBar />
          </div>
          <div className="stat-content">
            <div className="stat-number">{totalSchemes}</div>
            <div className="stat-label">Total Schemes</div>
          </div>
        </div>

        <div 
          className="stat-card"
          onClick={() => setActiveFilter("today")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon-wrapper">
            <FaClock />
          </div>
          <div className="stat-content">
            <div className="stat-number">{recentlyAdded}</div>
            <div className="stat-label">Recently Added</div>
          </div>
        </div>

        <div 
          className="stat-card"
          onClick={() => setActiveFilter("other")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon-wrapper">
            <FaLayerGroup />
          </div>
          <div className="stat-content">
            <div className="stat-number">{otherSchemes}</div>
            <div className="stat-label">Other Schemes</div>
          </div>
        </div>
      </div>
      <div className="table-section">
        <table className="schemes-table">
          <thead>
            <tr>
              <th>Scheme Name</th>
              <th>Official Website</th>
              <th>Description</th>
              <th>Added Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchemes.map(scheme => (
              <tr key={scheme._id}>
                <td className="scheme-name">{scheme.name}</td>
                <td>
                  <a href={scheme.website} target="_blank" rel="noopener noreferrer" className="website-link">
                    Visit
                  </a>
                </td>
                <td className="description">{scheme.description}</td>
               <td className="date">
  {scheme.createdAt
    ? new Date(scheme.createdAt).toLocaleDateString()
    : ""}
</td>
                <td className="actions">
  <button
    className="btn-edit"
    onClick={() => handleEditClick(scheme)}
  >
    Edit
  </button>

  <button
    className="btn-delete"
    onClick={() => handleDeleteClick(scheme._id)}
  >
    Delete
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Scheme' : 'Add Government Scheme'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="name">Scheme Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter scheme name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Official Website URL</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleFormChange}
                  placeholder="https://example.gov.in"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Short Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Describe the scheme briefly"
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
              <button className="btn-save" onClick={handleSaveScheme}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovSchemeManagement;