import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllUsers } from "../utils/fetchUsers";

// --- Helper function to format date strings ---
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

const Explorers: React.FC = () => {
  const navigate = useNavigate();
  const [explorers, setExplorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleGoBack = () => navigate(-1);

  const loadExplorers = async () => {
    setLoading(true);
    try {
      const response = await fetchAllUsers();
      if (response && response.success && Array.isArray(response.data)) {
        const explorersOnly = response.data.filter(
          (user) => user.type === "explorer"
        );
        setExplorers(explorersOnly);
      } else {
        setExplorers([]);
      }
    } catch (err) {
      console.error("Failed to fetch explorers:", err);
      setExplorers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExplorers();
  }, []);

  // 🔍 Filter by username or name
  const filteredExplorers = explorers.filter((user) =>
    [user.username, user.first_name, user.last_name]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <h2 style={styles.pageTitle}>Explorers Dashboard</h2>
        <p style={styles.pageText}>
          This section displays all registered explorer users.
        </p>
        <button style={styles.backButton} onClick={handleGoBack}>
          &larr; Go Back
        </button>

        {/* 🔍 Search input */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {loading ? (
          <p>Loading explorers...</p>
        ) : filteredExplorers.length === 0 ? (
          <p style={{ marginTop: "20px" }}>No explorers found.</p>
        ) : (
          <div style={styles.tableContainer}>
            <h3 style={styles.tableTitle}>
              Explorers ({filteredExplorers.length})
            </h3>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>User ID</th>
                    <th style={styles.tableHeader}>Registration Date</th>
                    <th style={styles.tableHeader}>Username</th>
                    <th style={styles.tableHeader}>Profile Picture</th>
                    <th style={styles.tableHeader}>First Name</th>
                    <th style={styles.tableHeader}>Last Name</th>
                    <th style={styles.tableHeader}>Gender</th>
                    <th style={styles.tableHeader}>Birth Date</th>
                    <th style={styles.tableHeader}>Job Title</th>
                    <th style={styles.tableHeader}>Location</th>
                    <th style={styles.tableHeader}>Status</th>
                    <th style={styles.tableHeader}>Email</th>
                    <th style={styles.tableHeader}>Website</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExplorers.map((user) => (
                    <tr
                      key={user.user_id}
                      style={styles.tableRow}
                      onClick={() => navigate(`/user-balance/${user.user_id}`)} // ✅ Navigate to balance page
                      className="hover-row"
                    >
                      <td style={styles.tableCell} title={user.user_id}>
                        {user.user_id?.substring(0, 8)}...
                      </td>
                      <td style={styles.tableCell}>
                        {formatDate(user.registration_date)}
                      </td>
                      <td style={styles.tableCell}>{user.username || "N/A"}</td>
                      <td style={styles.tableCell}>
                        {user.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={user.username}
                            style={styles.thumbnail}
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {user.first_name || "N/A"}
                      </td>
                      <td style={styles.tableCell}>
                        {user.last_name || "N/A"}
                      </td>
                      <td style={styles.tableCell}>{user.gender || "N/A"}</td>
                      <td style={styles.tableCell}>
                        {formatDate(user.birthdate) || "N/A"}
                      </td>
                      <td style={styles.tableCell}>
                        {user.job_title || "N/A"}
                      </td>
                      <td style={styles.tableCell}>{user.location || "N/A"}</td>
                      <td style={styles.tableCell}>{user.status || "N/A"}</td>
                      <td style={styles.tableCell}>{user.email || "N/A"}</td>
                      <td style={styles.tableCell}>{user.website || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    padding: "32px",
    background: "linear-gradient(to bottom, #160F24, #24213C, #2E1F3A)",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    color: "#f0f0f0",
  },
  mainContent: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  pageTitle: {
    color: "#00BDD6",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  pageText: {
    fontSize: "16px",
    lineHeight: 1.6,
    marginBottom: "24px",
  },
  backButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },
  searchContainer: {
    marginTop: "20px",
    marginBottom: "20px",
  },
  searchInput: {
    width: "100%",
    maxWidth: "400px",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #00BDD6",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
    fontSize: "14px",
  },
  tableContainer: {
    marginTop: "32px",
  },
  tableTitle: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    padding: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1200px",
  },
  tableHeaderRow: {
    borderBottom: "2px solid #00BDD6",
  },
  tableHeader: {
    padding: "12px 8px",
    textAlign: "left",
    color: "#00BDD6",
    fontWeight: "bold",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  tableRow: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  tableCell: {
    padding: "12px 8px",
    fontSize: "13px",
    color: "#f0f0f0",
    whiteSpace: "nowrap",
  },
  thumbnail: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
};

export default Explorers;
