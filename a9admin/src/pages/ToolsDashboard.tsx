// ToolsPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPendingTools,
  updateToolStatus,
  type PendingTool,
} from "../utils/fetchPendingTools";

const ToolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tools, setTools] = useState<PendingTool[]>([]);
  const [filteredTools, setFilteredTools] = useState<PendingTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingToolId, setUpdatingToolId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch pending tools
  const loadTools = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await fetchPendingTools(pageNumber, 20);
      console.log("Pending tools response:", res);
      setTools(res.data);
      setFilteredTools(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools(page);
  }, [page]);

  // Filter tools based on search term
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

  const handleGoBack = () => {
    navigate(-1);
  };

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

  const formatPlan = (plan: any) => {
    if (!plan) return "N/A";
    if (typeof plan === "string") return plan;
    return JSON.stringify(plan);
  };

  const formatLikes = (likes: any) => {
    if (!likes || !Array.isArray(likes)) return "0";
    return likes.length.toString();
  };

  const formatComments = (comments: any) => {
    if (!comments || !Array.isArray(comments)) return "0";
    return comments.length.toString();
  };

  // Status dropdown component
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
            style={{
              backgroundColor: "#2a2a2a",
              color: "#fff",
            }}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  // Helper function for status color
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <h2 style={styles.pageTitle}>Tools & Settings</h2>
        <p style={styles.pageText}>
          This is where the content management tools, settings, and other admin
          features will go.
        </p>
        <button style={styles.backButton} onClick={handleGoBack}>
          &larr; Go Back
        </button>

        {/* Pending Tools Section */}
        <div style={{ marginTop: "32px" }}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Pending Tools</h3>

            {/* Search Bar */}
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
              <div style={styles.searchResults}>
                {searchTerm && (
                  <span style={styles.resultsText}>
                    Showing {filteredTools.length} of {tools.length} tools
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : filteredTools.length === 0 ? (
            <div style={styles.noResults}>
              <p>
                {searchTerm
                  ? "No tools found matching your search."
                  : "No pending tools."}
              </p>
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
                    <th style={styles.tableHeader}>Tool Name</th>
                    <th style={styles.tableHeader}>Tool ID</th>
                    <th style={styles.tableHeader}>Image</th>
                    <th style={styles.tableHeader}>URL</th>
                    <th style={{ ...styles.tableHeader, minWidth: "120px" }}>
                      Plan
                    </th>
                    <th style={{ ...styles.tableHeader, minWidth: "120px" }}>
                      Industry
                    </th>
                    <th style={{ ...styles.tableHeader, minWidth: "120px" }}>
                      Category
                    </th>
                    <th style={{ ...styles.tableHeader, minWidth: "200px" }}>
                      Description
                    </th>
                    <th style={styles.tableHeader}>Hidden</th>
                    <th style={styles.tableHeader}>Views</th>
                    <th style={styles.tableHeader}>Likes</th>
                    <th style={styles.tableHeader}>Shares</th>
                    <th style={styles.tableHeader}>Comments</th>
                    <th style={styles.tableHeader}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTools.map((tool) => (
                    <tr key={tool.id} style={styles.tableRow}>
                      <td style={styles.tableCell} title={tool.id}>
                        {tool.id?.substring(0, 8)}...
                      </td>
                      <td style={styles.tableCell}>
                        {tool.tool_name || "N/A"}
                      </td>
                      <td style={styles.tableCell}>{tool.tool_id || "N/A"}</td>
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
                      <td
                        style={{
                          ...styles.tableCell,
                          minWidth: "120px",
                          maxWidth: "120px",
                        }}
                        title={formatPlan(tool.tool_plan)}
                      >
                        <div style={styles.truncateText}>
                          {formatPlan(tool.tool_plan)}
                        </div>
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          minWidth: "120px",
                          maxWidth: "120px",
                        }}
                        title={tool.tool_industry}
                      >
                        <div style={styles.truncateText}>
                          {tool.tool_industry || "N/A"}
                        </div>
                      </td>
                      <td
                        style={{
                          ...styles.tableCell,
                          minWidth: "120px",
                          maxWidth: "120px",
                        }}
                        title={tool.tool_category}
                      >
                        <div style={styles.truncateText}>
                          {tool.tool_category || "N/A"}
                        </div>
                      </td>
                      <td
                        style={{
                          ...styles.descriptionCell,
                          minWidth: "200px",
                          maxWidth: "200px",
                        }}
                        title={tool.tool_description}
                      >
                        <div style={styles.descriptionContent}>
                          {tool.tool_description || "N/A"}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        {tool.is_hidden ? "Yes" : "No"}
                      </td>
                      <td style={styles.tableCell}>{tool.views || 0}</td>
                      <td style={styles.tableCell}>
                        {formatLikes(tool.likes)}
                      </td>
                      <td style={styles.tableCell}>{tool.shares || 0}</td>
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

          {/* Pagination - Only show if not searching */}
          {!searchTerm && (
            <div style={styles.pagination}>
              <button
                style={{
                  ...styles.paginationButton,
                  marginRight: "8px",
                  opacity: page <= 1 ? 0.5 : 1,
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                }}
                disabled={page <= 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Prev
              </button>
              <span style={{ marginRight: "8px", color: "#00BDD6" }}>
                Page {page} of {Math.ceil(total / 10)}
              </span>
              <button
                style={{
                  ...styles.paginationButton,
                  opacity: page * 10 >= total ? 0.5 : 1,
                  cursor: page * 10 >= total ? "not-allowed" : "pointer",
                }}
                disabled={page * 10 >= total}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
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
    boxSizing: "border-box",
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
  searchInputWrapper: {
    position: "relative",
    display: "inline-block",
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
    outline: "none",
    transition: "all 0.2s ease",
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
    padding: 0,
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  searchResults: {
    fontSize: "12px",
    color: "#00BDD6",
  },
  resultsText: {
    opacity: 0.8,
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
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1400px",
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
  },
  tableCell: {
    padding: "12px 8px",
    fontSize: "13px",
    color: "#f0f0f0",
    whiteSpace: "nowrap",
    position: "relative",
    verticalAlign: "top",
  },
  descriptionCell: {
    padding: "12px 8px",
    fontSize: "13px",
    color: "#f0f0f0",
    verticalAlign: "top",
  },
  descriptionContent: {
    maxHeight: "60px",
    overflow: "auto",
    lineHeight: "1.4",
    wordWrap: "break-word",
    padding: "4px",
    borderRadius: "4px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  truncateText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
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
  pagination: {
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paginationButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },
};

export default ToolsPage;
