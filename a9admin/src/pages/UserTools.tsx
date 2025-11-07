// UserToolsPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchUserTools,
  updateToolStatus,
  type PendingTool,
} from "../utils/fetchPendingTools";

const UserTools: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [tools, setTools] = useState<PendingTool[]>([]);
  const [filteredTools, setFilteredTools] = useState<PendingTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingToolId, setUpdatingToolId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
          padding: "4px 8px",
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
        <h2 style={styles.pageTitle}>User Tools</h2>
        <button style={styles.backButton} onClick={handleGoBack}>
          &larr; Go Back
        </button>

        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Tools by User</h3>

          <div style={styles.searchContainer}>
            <div style={styles.searchInputWrapper}>
              <input
                type="text"
                placeholder="Search tools..."
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
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredTools.length === 0 ? (
          <div style={styles.noResults}>
            <p>No tools found for this user.</p>
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
  pageTitle: {
    color: "#00BDD6",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "16px",
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
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: "32px",
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
  },
  searchInput: {
    padding: "8px 12px",
    paddingRight: "30px",
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
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#00BDD6",
    fontSize: "18px",
    cursor: "pointer",
  },
  noResults: {
    textAlign: "center",
    padding: "40px",
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
    minWidth: "1000px",
  },
  tableHeaderRow: {
    borderBottom: "2px solid #00BDD6",
  },
  tableHeader: {
    padding: "12px 8px",
    color: "#00BDD6",
    fontWeight: "bold",
    fontSize: "14px",
    textAlign: "left",
  },
  tableRow: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  tableCell: {
    padding: "12px 8px",
    fontSize: "13px",
    color: "#f0f0f0",
  },
  thumbnail: {
    width: "40px",
    height: "40px",
    objectFit: "cover",
    borderRadius: "4px",
  },
  link: {
    color: "#00BDD6",
    textDecoration: "none",
  },
};

export default UserTools;
