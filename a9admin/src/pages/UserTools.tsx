import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  fetchUserTools,
  updateToolStatus,
  type PendingTool,
} from "../utils/fetchPendingTools";
import {
  MdArrowBack,
  MdAccountCircle,
  MdBuild,
  MdBusiness,
  MdPerson,
  MdSearch,
  MdClear,
} from "react-icons/md";

const UserTools: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const [tools, setTools] = useState<PendingTool[]>([]);
  const [filteredTools, setFilteredTools] = useState<PendingTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingToolId, setUpdatingToolId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get user profile data from navigation state
  const { profilePicture, username, businessName } = location.state || {};

  // Fetch user tools
  const loadUserTools = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetchUserTools(userId);
      console.log("User tools response:", res);
      setTools(res.data || res);
      setFilteredTools(res.data || res);
    } catch (err) {
      console.error("❌ Error loading user tools:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserTools();
  }, [userId]);

  // Search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTools(tools);
    } else {
      const filtered = tools.filter((tool) =>
        Object.values(tool).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredTools(filtered);
    }
  }, [searchTerm, tools]);

  // Handle status update
  const handleStatusUpdate = async (toolId: string, newStatus: string) => {
    setUpdatingToolId(toolId);
    try {
      await updateToolStatus(toolId, newStatus);
      setTools((prevTools) =>
        prevTools.map((tool) =>
          tool.id === toolId ? { ...tool, status: newStatus } : tool
        )
      );
    } catch (err) {
      console.error("Failed to update tool status:", err);
      alert("Failed to update tool status. Please try again.");
    } finally {
      setUpdatingToolId(null);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Helper formatting functions
  const formatLikes = (likes: any) =>
    likes && Array.isArray(likes) ? likes.length.toString() : "0";
  const formatComments = (comments: any) =>
    comments && Array.isArray(comments) ? comments.length.toString() : "0";
  const formatPlan = (plan: any) =>
    !plan ? "N/A" : typeof plan === "string" ? plan : JSON.stringify(plan);

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#FFA500";
      case "approved":
        return "#28a745";
      case "rejected":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const StatusDropdown: React.FC<{ tool: PendingTool }> = ({ tool }) => {
    const statusOptions = [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ];

    return (
      <select
        value={tool.status || "pending"}
        onChange={(e) => handleStatusUpdate(tool.id, e.target.value)}
        disabled={updatingToolId === tool.id}
        style={{
          padding: "6px 10px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "bold",
          border: "none",
          cursor: updatingToolId === tool.id ? "not-allowed" : "pointer",
          backgroundColor: getStatusColor(tool.status),
          color: tool.status === "pending" ? "#000" : "#fff",
          minWidth: "100px",
        }}
      >
        {statusOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            style={{ backgroundColor: "#2a2a2a", color: "#fff" }}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const clearSearch = () => setSearchTerm("");

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* Back Button - Now at the top */}
        <button style={styles.backButton} onClick={handleGoBack}>
          <MdArrowBack size={18} style={styles.buttonIcon} />
          Go Back
        </button>

        {/* User Profile Header */}
        <div style={styles.userInfoSection}>
          <div style={styles.userProfile}>
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={username || businessName}
                style={styles.profileImage}
              />
            ) : (
              <div style={styles.profilePlaceholder}>
                <MdAccountCircle size={32} />
              </div>
            )}
            <div style={styles.userDetails}>
              <h2 style={styles.userName}>
                <MdBuild size={24} style={styles.titleIcon} />
                {businessName || username || "User"} Tools
              </h2>
              <p style={styles.userId}>
                <MdPerson size={14} style={styles.iconInline} />
                User ID: {userId}
              </p>
              {username && businessName && username !== businessName && (
                <p style={styles.username}>
                  <MdBusiness size={14} style={styles.iconInline} />@{username}
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Tools by User</h3>

          <div style={styles.searchContainer}>
            <div style={styles.searchInputWrapper}>
              <MdSearch size={20} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button style={styles.clearButton} onClick={clearSearch}>
                  <MdClear size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Loading tools...</p>
        ) : filteredTools.length === 0 ? (
          <div style={styles.noResults}>
            <p>No tools found for this user.</p>
            {searchTerm && (
              <button style={styles.clearSearchButton} onClick={clearSearch}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Image</th>
                  <th style={styles.tableHeader}>URL</th>
                  <th style={styles.tableHeader}>Category</th>
                  <th style={styles.tableHeader}>Industry</th>
                  <th style={styles.tableHeader}>Views</th>
                  <th style={styles.tableHeader}>Likes</th>
                  <th style={styles.tableHeader}>Comments</th>
                  <th style={styles.tableHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTools.map((tool) => (
                  <tr key={tool.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      {tool.id?.substring(0, 8)}...
                    </td>
                    <td style={styles.tableCell}>{tool.tool_name || "N/A"}</td>
                    <td style={styles.tableCell}>
                      {tool.tool_image ? (
                        <img
                          src={tool.tool_image}
                          alt="Tool"
                          style={styles.thumbnail}
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      {tool.tool_url ? (
                        <a
                          href={tool.tool_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.link}
                        >
                          Link
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      {tool.tool_category || "N/A"}
                    </td>
                    <td style={styles.tableCell}>
                      {tool.tool_industry || "N/A"}
                    </td>
                    <td style={styles.tableCell}>{tool.views || 0}</td>
                    <td style={styles.tableCell}>{formatLikes(tool.likes)}</td>
                    <td style={styles.tableCell}>
                      {formatComments(tool.comments)}
                    </td>
                    <td style={styles.tableCell}>
                      <StatusDropdown tool={tool} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Styles ---
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
  // Back Button at top
  backButton: {
    backgroundColor: "#8050E6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background-color 0.2s ease",
  },
  buttonIcon: {
    marginRight: "4px",
  },
  // User Profile Styles
  userInfoSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(0, 189, 214, 0.3)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  profileImage: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #00BDD6",
  },
  profilePlaceholder: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 189, 214, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#00BDD6",
    border: "3px solid #00BDD6",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: "#00BDD6",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  userId: {
    color: "#aaa",
    fontSize: "14px",
    margin: "0 0 4px 0",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  username: {
    color: "#00FF9D",
    fontSize: "14px",
    margin: 0,
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  titleIcon: {
    marginRight: "8px",
  },
  iconInline: {
    marginRight: "4px",
  },
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
  },
  searchInputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    color: "#00BDD6",
    zIndex: 1,
  },
  searchInput: {
    padding: "8px 12px 8px 40px",
    borderRadius: "6px",
    border: "1px solid #00BDD6",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#f0f0f0",
    fontSize: "14px",
    minWidth: "250px",
  },
  clearButton: {
    position: "absolute",
    right: "8px",
    background: "none",
    border: "none",
    color: "#00BDD6",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
  },
  loadingText: {
    color: "#aaa",
    fontSize: "16px",
    textAlign: "center",
    padding: "40px",
  },
  noResults: {
    textAlign: "center",
    padding: "40px",
    color: "#f0f0f0",
  },
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
  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },
  tableHeaderRow: {
    borderBottom: "2px solid rgba(0, 189, 214, 0.3)",
    background: "rgba(0, 189, 214, 0.05)",
  },
  tableHeader: {
    padding: "16px 12px",
    color: "#00BDD6",
    fontWeight: "bold",
    fontSize: "13px",
    textAlign: "left",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    transition: "background-color 0.2s",
  },
  tableRowHover: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  tableCell: {
    padding: "14px 12px",
    fontSize: "14px",
    color: "#f0f0f0",
    whiteSpace: "nowrap",
  },
  thumbnail: {
    width: "40px",
    height: "40px",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  link: {
    color: "#00BDD6",
    textDecoration: "none",
    fontWeight: "500",
    transition: "color 0.2s ease",
  },
};

export default UserTools;
