import { useEffect, useMemo, useState } from "react";
import { AlertCircle, LogOut, RefreshCw } from "lucide-react";

const API_URL = "http://localhost:5000/api";
const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Submitted", "In Progress", "Resolved", "Rejected"];
const PRIORITY_COLORS = {
  Critical: { background: "#fee4e2", color: "#b42318", border: "#fda29b" },
  High: { background: "#fff0df", color: "#a34b00", border: "#fdbb74" },
  Medium: { background: "#e8f1ff", color: "#1849a9", border: "#84adff" },
  Low: { background: "#e7f6ec", color: "#176b38", border: "#75d39a" },
};

async function adminRequest(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token || ""}`,
      ...options.headers,
    },
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    const error = new Error(data.message || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }

  return data;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function Admin({ onLogout }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingComplaint, setUpdatingComplaint] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  const loadDashboard = async (isRefresh = false) => {
    setErrorMessage("");
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [problemData, statsData] = await Promise.all([
        adminRequest("/admin/priority-problems"),
        adminRequest("/admin/priority-stats"),
      ]);
      setComplaints(problemData.complaints || []);
      setStats(statsData.stats);
      setNeedsLogin(false);
    } catch (error) {
      if (error.status === 401) {
        localStorage.removeItem("token");
        setNeedsLogin(true);
        setErrorMessage("Your session has expired. Please sign in again.");
      } else if (error.status === 403) {
        setNeedsLogin(true);
        setErrorMessage("This account does not have administrator access.");
      } else {
        setErrorMessage(error.message || "Could not load the priority dashboard.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;

    Promise.all([
      adminRequest("/admin/priority-problems"),
      adminRequest("/admin/priority-stats"),
    ])
      .then(([problemData, statsData]) => {
        if (!active) return;
        setComplaints(problemData.complaints || []);
        setStats(statsData.stats);
        setNeedsLogin(false);
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401) {
          localStorage.removeItem("token");
          setNeedsLogin(true);
          setErrorMessage("Your session has expired. Please sign in again.");
        } else if (error.status === 403) {
          setNeedsLogin(true);
          setErrorMessage("This account does not have administrator access.");
        } else {
          setErrorMessage(error.message || "Could not load the priority dashboard.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((complaint) => {
      const matchesPriority =
        priorityFilter === "All" || complaint.priority === priorityFilter;
      const matchesStatus =
        statusFilter === "All" || complaint.status === statusFilter;
      const searchableValues = [
        complaint.complaint_number,
        complaint.title,
        complaint.category,
        complaint.village,
      ];
      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      return matchesPriority && matchesStatus && matchesSearch;
    });
  }, [complaints, priorityFilter, search, statusFilter]);

  const updatePriority = async (complaintNumber, priority) => {
    setUpdatingComplaint(complaintNumber);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await adminRequest(
        `/admin/priority-problems/${encodeURIComponent(complaintNumber)}`,
        {
          method: "PUT",
          body: JSON.stringify({ priority }),
        }
      );
      setComplaints((current) =>
        current.map((complaint) =>
          complaint.complaint_number === complaintNumber
            ? data.complaint
            : complaint
        )
      );
      setSuccessMessage(data.message || "Complaint priority updated.");

      try {
        const [problemData, statsData] = await Promise.all([
          adminRequest("/admin/priority-problems"),
          adminRequest("/admin/priority-stats"),
        ]);
        setComplaints(problemData.complaints || []);
        setStats(statsData.stats);
      } catch (error) {
        setErrorMessage(
          `Priority was saved, but the summary counts could not refresh: ${
            error.message || "Unknown error."
          }`
        );
      }
    } catch (error) {
      if (error.status === 401) {
        localStorage.removeItem("token");
        setNeedsLogin(true);
      } else if (error.status === 403) {
        setNeedsLogin(true);
      }
      setErrorMessage(error.message || "Could not update complaint priority.");
    } finally {
      setUpdatingComplaint("");
    }
  };

  const returnToLogin = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
  };

  return (
    <main style={{ maxWidth: "1440px", margin: "0 auto", padding: "24px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 6px", color: "#173c30" }}>
            Priority Complaint Management
          </h1>
          <p style={{ margin: 0, color: "#66756e" }}>
            Review complaints and set priorities for follow-up.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing || loading}
            style={buttonStyle}
          >
            <RefreshCw size={16} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button type="button" onClick={returnToLogin} style={buttonStyle}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      {errorMessage && (
        <div role="alert" style={messageStyle("#fff0ef", "#a12622")}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
          {needsLogin && (
            <button type="button" onClick={returnToLogin} style={inlineButtonStyle}>
              Return to login
            </button>
          )}
        </div>
      )}
      {successMessage && (
        <p role="status" style={messageStyle("#e7f6ec", "#176b38")}>
          {successMessage}
        </p>
      )}

      <section
        aria-label="Complaint counts by priority"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {PRIORITIES.map((priority) => (
          <article
            key={priority}
            style={{
              background: "#fff",
              border: `1px solid ${PRIORITY_COLORS[priority].border}`,
              borderRadius: "14px",
              padding: "18px",
              boxShadow: "0 4px 16px rgba(15, 45, 35, 0.05)",
            }}
          >
            <p style={{ margin: "0 0 8px", color: "#475467", fontWeight: 600 }}>
              {priority === "Critical"
                ? "Critical Complaints"
                : `${priority} Priority Complaints`}
            </p>
            <strong style={{ fontSize: "30px", color: PRIORITY_COLORS[priority].color }}>
              {loading ? "…" : stats[priority]}
            </strong>
          </article>
        ))}
      </section>

      <section
        aria-label="Complaints"
        style={{
          background: "#fff",
          border: "1px solid #e2ebe6",
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 4px 16px rgba(15, 45, 35, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "end",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <label style={filterLabelStyle}>
            Search
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ID, title, category, or village"
              style={inputStyle}
            />
          </label>
          <label style={filterLabelStyle}>
            Priority
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              style={inputStyle}
            >
              <option>All</option>
              {PRIORITIES.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </label>
          <label style={filterLabelStyle}>
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={inputStyle}
            >
              <option>All</option>
              {STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p role="status" style={{ color: "#66756e" }}>
            Loading complaints...
          </p>
        ) : visibleComplaints.length === 0 ? (
          <p style={{ color: "#66756e" }}>
            {complaints.length === 0
              ? "There are no complaints to display."
              : "No complaints match these filters."}
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1050px" }}>
              <thead>
                <tr>
                  {[
                    "Complaint ID",
                    "Complaint Title",
                    "Category",
                    "Village",
                    "Location",
                    "Priority",
                    "Status",
                    "Date Submitted",
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} scope="col" style={tableHeaderStyle}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleComplaints.map((complaint) => (
                  <tr key={complaint.complaint_number}>
                    <td style={tableCellStyle}>{complaint.complaint_number}</td>
                    <td style={tableCellStyle}>{complaint.title}</td>
                    <td style={tableCellStyle}>{complaint.category}</td>
                    <td style={tableCellStyle}>{complaint.village}</td>
                    <td style={tableCellStyle}>{complaint.location || "—"}</td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          ...priorityBadgeStyle,
                          ...PRIORITY_COLORS[complaint.priority],
                        }}
                      >
                        {complaint.priority} priority
                      </span>
                    </td>
                    <td style={tableCellStyle}>{complaint.status}</td>
                    <td style={tableCellStyle}>{formatDate(complaint.created_at)}</td>
                    <td style={tableCellStyle}>
                      <label style={{ display: "grid", gap: "5px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600 }}>
                          Change priority
                        </span>
                        <select
                          aria-label={`Priority for complaint ${complaint.complaint_number}`}
                          value={complaint.priority}
                          disabled={updatingComplaint === complaint.complaint_number}
                          onChange={(event) =>
                            updatePriority(complaint.complaint_number, event.target.value)
                          }
                          style={inputStyle}
                        >
                          {PRIORITIES.map((priority) => (
                            <option key={priority}>{priority}</option>
                          ))}
                        </select>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && complaints.length > 0 && (
          <p style={{ margin: "14px 0 0", color: "#66756e", fontSize: "14px" }}>
            Showing {visibleComplaints.length} of {complaints.length} complaints.
          </p>
        )}
      </section>
    </main>
  );
}

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  padding: "10px 14px",
  border: "1px solid #d6e1da",
  borderRadius: "9px",
  background: "#fff",
  color: "#263b32",
  fontWeight: 600,
  cursor: "pointer",
};

const inlineButtonStyle = {
  padding: "6px 10px",
  border: "1px solid currentColor",
  borderRadius: "7px",
  background: "#fff",
  color: "inherit",
  fontWeight: 600,
  cursor: "pointer",
};

const messageStyle = (background, color) => ({
  display: "flex",
  alignItems: "center",
  gap: "9px",
  flexWrap: "wrap",
  padding: "12px 14px",
  margin: "0 0 18px",
  borderRadius: "9px",
  background,
  color,
});

const filterLabelStyle = {
  display: "grid",
  gap: "6px",
  minWidth: "180px",
  color: "#344054",
  fontSize: "14px",
  fontWeight: 600,
};

const inputStyle = {
  minHeight: "38px",
  padding: "7px 10px",
  border: "1px solid #d0d5dd",
  borderRadius: "8px",
  background: "#fff",
  color: "#263b32",
  font: "inherit",
};

const tableHeaderStyle = {
  padding: "12px 10px",
  borderBottom: "1px solid #dfe7e2",
  background: "#f7faf8",
  color: "#344054",
  textAlign: "left",
  whiteSpace: "nowrap",
  fontSize: "13px",
};

const tableCellStyle = {
  padding: "13px 10px",
  borderBottom: "1px solid #edf1ee",
  color: "#344054",
  verticalAlign: "top",
};

const priorityBadgeStyle = {
  padding: "5px 8px",
  border: "1px solid",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

export default Admin;
