import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllUsers, type UserData } from "../utils/fetchUsers";

// Helper function to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const Businesses: React.FC = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<UserData[]>([]);
  const [filtered, setFiltered] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load business accounts
  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const response = await fetchAllUsers({ businesses: true });
      if (response?.success && Array.isArray(response.data)) {
        setBusinesses(response.data);
        setFiltered(response.data);
      } else {
        console.warn("Unexpected data format:", response);
      }
    } catch (err) {
      console.error("❌ Failed to load businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(businesses);
    } else {
      const lower = searchTerm.toLowerCase();
      setFiltered(
        businesses.filter((b) =>
          Object.values(b).some((val) =>
            String(val || "")
              .toLowerCase()
              .includes(lower)
          )
        )
      );
    }
  }, [searchTerm, businesses]);

  const handleGoBack = () => navigate(-1);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm("");

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <h2 style={styles.pageTitle}>Business Accounts</h2>
        <p style={styles.pageText}>
          Manage all registered business accounts. You can view their balance,
          tools, or vacancies.
        </p>
        <button style={styles.backButton} onClick={handleGoBack}>
          &larr; Go Back
        </button>

        {/* Search */}
        <div style={styles.searchSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>All Businesses</h3>
            <div style={styles.searchContainer}>
              <div style={styles.searchInputWrapper}>
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={styles.searchInput}
                />
                {searchTerm && (
                  <button style={styles.clearButton} onClick={clearSearch}>
                    ×
                  </button>
                )}
              </div>
              {searchTerm && (
                <span style={styles.resultsText}>
                  Showing {filtered.length} of {businesses.length} businesses
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading businesses...</p>
        ) : filtered.length === 0 ? (
          <div style={styles.noResults}>
            <p>
              {searchTerm
                ? "No businesses found matching your search."
                : "No businesses available."}
            </p>
            {searchTerm && (
              <button style={styles.clearSearchButton} onClick={clearSearch}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <h3 style={styles.tableTitle}>Businesses ({filtered.length})</h3>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>Profile Picture</th>
                    <th style={styles.tableHeader}>Username</th>
                    <th style={styles.tableHeader}>Business Name</th>
                    <th style={styles.tableHeader}>Reg Date</th>
                    <th style={styles.tableHeader}>Location</th>
                    <th style={styles.tableHeader}>Email</th>
                    <th style={styles.tableHeader}>Phone</th>
                    <th style={styles.tableHeader}>Balance</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.user_id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        {user.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={user.username}
                            style={styles.thumbnail}
                          />
                        ) : (
                          <span>N/A</span>
                        )}
                      </td>
                      <td style={styles.tableCell}>{user.username || "N/A"}</td>
                      <td style={styles.tableCell}>
                        {user.business_name || "N/A"}
                      </td>
                      <td style={styles.tableCell}>
                        {formatDate(user.registration_date)}
                      </td>
                      <td style={styles.tableCell}>{user.location || "N/A"}</td>
                      <td style={styles.tableCell}>{user.email || "N/A"}</td>
                      <td style={styles.tableCell}>
                        {user.phone_number || "N/A"}
                      </td>
                      <td style={styles.balanceCell}>
                        {user.balance ? `${user.balance}` : "—"}
                      </td>
                      <td style={{ ...styles.tableCell, whiteSpace: "nowrap" }}>
                        <div style={styles.actionsContainer}>
                          <button
                            style={{
                              ...styles.actionButton,
                              background: "#007bff",
                            }}
                            onClick={() =>
                              navigate(`/user-balance/${user.user_id}`)
                            }
                          >
                            View Balance
                          </button>
                          <button
                            style={{
                              ...styles.actionButton,
                              background: "#00BDD6",
                            }}
                            onClick={() =>
                              navigate(`/user-tools/${user.user_id}`)
                            }
                          >
                            View Tools
                          </button>
                          <button
                            style={{
                              ...styles.actionButton,
                              background: "#7A3FFF",
                            }}
                            onClick={() =>
                              navigate(`/user-vacancies/${user.user_id}`)
                            }
                          >
                            View Vacancies
                          </button>
                        </div>
                      </td>
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

type StyleMap = { [key: string]: React.CSSProperties };

const styles: StyleMap = {
  container: {
    minHeight: "100vh",
    padding: "32px",
    background: "linear-gradient(to bottom, #160F24, #24213C, #2E1F3A)",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    color: "#f0f0f0",
  },
  mainContent: {
    width: "100%",
    maxWidth: "90vw",
    margin: "0 auto",
  },
  pageTitle: {
    color: "#00BDD6",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  pageText: {
    fontSize: "16px",
    marginBottom: "20px",
  },
  backButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    fontSize: "14px",
    cursor: "pointer",
  },
  searchSection: { marginTop: "32px" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "16px",
  },
  sectionTitle: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
  },
  searchContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  searchInputWrapper: { position: "relative" },
  searchInput: {
    padding: "8px 12px",
    paddingRight: "30px",
    borderRadius: "6px",
    border: "1px solid #00BDD6",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#f0f0f0",
    fontSize: "14px",
    minWidth: "250px",
    outline: "none",
  },
  clearButton: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#00BDD6",
    fontSize: "18px",
    cursor: "pointer",
  },
  resultsText: { fontSize: "12px", color: "#00BDD6", opacity: 0.8 },
  noResults: { textAlign: "center", padding: "40px", color: "#f0f0f0" },
  clearSearchButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "12px",
  },
  tableContainer: { marginBottom: "32px" },
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
    minWidth: "1100px",
  },
  tableHeaderRow: { borderBottom: "2px solid #00BDD6" },
  tableHeader: {
    padding: "12px 8px",
    textAlign: "left",
    color: "#00BDD6",
    fontWeight: "bold",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  tableRow: { borderBottom: "1px solid rgba(255, 255, 255, 0.1)" },
  tableCell: {
    padding: "12px 8px",
    fontSize: "13px",
    color: "#f0f0f0",
    whiteSpace: "nowrap",
  },
  balanceCell: {
    padding: "12px 8px",
    fontSize: "13px",
    color: "#00FF9D",
    whiteSpace: "nowrap",
  },
  thumbnail: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  actionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  actionButton: {
    border: "none",
    color: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
  },
};

export default Businesses;
