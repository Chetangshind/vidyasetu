import { useEffect, useState } from "react";
import "./ApprovedApplications.css";

export default function ApprovedApplications() {
  const [applications, setApplications] = useState([]);
  const [meetingBox, setMeetingBox] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const [meetingType, setMeetingType] = useState("");
  const [locationType, setLocationType] = useState("");
  const [digitalType, setDigitalType] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  /* ===============================
     FETCH APPROVED APPLICATIONS
  =============================== */
async function fetchApprovedApplications() {
  try {
    const res = await fetch(
      "http://${API}/api/applications/donor/approved",
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    const data = await res.json();
    setApplications(data || []);
  } catch (err) {
    console.error("Failed to load approved applications", err);
  }
}

useEffect(() => {
  fetchApprovedApplications();
}, []);
  /* ===============================
     FORMAT ADDRESS
  =============================== */
  const formatAddress = (addressObj) => {
    if (!addressObj) return "Address not available";

    const selected = addressObj.same
      ? addressObj.perm
      : addressObj.corr;

    if (!selected) return "Address not available";

    return `${selected.address || ""}, ${selected.village || ""}, ${
      selected.taluka || ""
    }, ${selected.district || ""}, ${selected.state || ""} - ${
      selected.pincode || ""
    }`;
  };

  return (
    <div className="approved-page pa-wrapper">
      <h2 className="pa-title">Approved Applications</h2>
      <div className="pa-title-underline" />

      <div className="pa-card">
        <div className="pa-scroll-area">
          <table className="pa-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Student Name</th>
                <th>Scheme Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-msg">
                    No approved applications
                  </td>
                </tr>
              ) : (
                applications.map((app, index) => (
                  <tr
                    key={app._id}
                    className={
                      index % 2 === 0 ? "pa-row-even" : "pa-row-odd"
                    }
                  >
                    <td className="pa-blue">{app._id}</td>
                    <td>
                      {app.studentProfile?.personal?.name || "-"}
                    </td>
                    <td>{app.schemeId?.schemeName || "-"}</td>
                    <td className="pa-status approved">Approved</td>
                    <td>
                     <button
  className={
    app.meeting ? "scheduled-btn" : "donate-btn"
  }
  onClick={() => {
    if (!app.meeting) {
      setSelectedApp(app);
      setMeetingBox(true);
    }
  }}
  disabled={!!app.meeting}
>
  {app.meeting ? "Scheduled" : "Schedule"}
</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meetingBox && selectedApp && (
        <div className="donate-overlay">
          <div className="donate-modal">
            <h3>
              Schedule Meeting with{" "}
              {selectedApp.studentProfile?.personal?.name || "Student"}
            </h3>

            {/* MEETING TYPE */}
            <div className="radio-group">
              <label>
  <input
    type="radio"
    value="physical"
    checked={meetingType === "physical"}
    onChange={(e) => setMeetingType(e.target.value)}
  />
  <span>Physical</span>
</label>

              <label>
  <input
    type="radio"
    value="digital"
    checked={meetingType === "digital"}
    onChange={(e) => setMeetingType(e.target.value)}
  />
  <span>Digital</span>
</label>
            </div>

            {/* PHYSICAL OPTIONS */}
            {meetingType === "physical" && (
              <>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="student_home"
                      checked={locationType === "student_home"}
                      onChange={(e) =>
                        setLocationType(e.target.value)
                      }
                    />
                    Student Home
                  </label>

                  <label>
                    <input
                      type="radio"
                      value="donor_home"
                      checked={locationType === "donor_home"}
                      onChange={(e) =>
                        setLocationType(e.target.value)
                      }
                    />
                    Donor Home / Office
                  </label>
                </div>

                {locationType === "student_home" && (
                  <div className="address-box">
                    <strong>Student Address:</strong>
                    <p>
                      {formatAddress(
                        selectedApp.studentProfile?.address
                      )}
                    </p>
                  </div>
                )}

                {locationType === "donor_home" && (
                  <textarea
                    placeholder="Enter your address"
                    value={donorAddress}
                    onChange={(e) =>
                      setDonorAddress(e.target.value)
                    }
                    style={{
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  />
                )}
              </>
            )}

{/* DIGITAL OPTIONS */}
{meetingType === "digital" && (
  <>
    {/* ✅ LINK INPUT ALWAYS VISIBLE */}
    <input
      type="url"
      placeholder="Enter meeting link (e.g., https://meet.google.com/abc-defg-hij)"
      value={meetingLink}
      onChange={(e) => setMeetingLink(e.target.value)}
      style={{
        width: "100%",
        marginBottom: "15px",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    />

    {/* Voice / Video Selection */}
    <div className="radio-group">
      <label>
        <input
          type="radio"
          value="voice"
          checked={digitalType === "voice"}
          onChange={(e) => setDigitalType(e.target.value)}
        />
        Voice Call
      </label>

      <label>
        <input
          type="radio"
          value="video"
          checked={digitalType === "video"}
          onChange={(e) => setDigitalType(e.target.value)}
        />
        Video Call
      </label>
    </div>

    {/* ✅ Show Phone Only If Voice/Video Selected */}
    {digitalType && (
      <div className="info-box">
        <strong>Student Phone:</strong>
        <p>
          {selectedApp.studentProfile?.personal?.mobile ||
            "Phone not available"}
        </p>
      </div>
    )}
  </>
)}

            {/* DATE & TIME */}
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <input
              type="time"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              style={{ width: "100%", marginBottom: "10px" }}
            />

            {/* CONFIRM BUTTON */}
            <button
              className="donate-option"
              onClick={async () => {

  if (!meetingType) {
    alert("Select meeting type");
    return;
  }

  if (meetingType === "physical" && !locationType) {
    alert("Select location");
    return;
  }

if (meetingType === "digital") {

if (meetingType === "digital") {

  // Only validate link if it is entered
  if (meetingLink.trim()) {
    const urlPattern = /^(https?:\/\/)/i;
    if (!urlPattern.test(meetingLink)) {
      alert("Enter valid meeting link starting with http or https");
      return;
    }
  }
}

  // If user entered link, validate it
  if (meetingLink) {
    const urlPattern = /^(https?:\/\/)/i;
    if (!urlPattern.test(meetingLink)) {
      alert("Enter valid meeting link starting with http or https");
      return;
    }
  }
}

  if (!meetingDate || !meetingTime) {
    alert("Select date and time");
    return;
  }

  try {
    const res = await fetch("http://${API}/api/meetings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer " + localStorage.getItem("token"),
      },
body: JSON.stringify({
  applicationId: selectedApp._id,
  meetingType,
  locationType,
  digitalType,
  meetingLink,   // ✅ ADD THIS LINE
  address:
    meetingType === "physical"
      ? locationType === "donor_home"
        ? donorAddress
        : formatAddress(selectedApp.studentProfile?.address)
      : "",
  date: meetingDate,
  time: meetingTime,
}),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

alert("Meeting Scheduled Successfully");

setMeetingBox(false);
fetchApprovedApplications();  // ✅ reload updated data

  } catch (err) {
    alert("Failed to schedule meeting");
  }
}}
            >
              Confirm Meeting
            </button>

            <button
              className="donate-cancel"
              onClick={() => setMeetingBox(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}