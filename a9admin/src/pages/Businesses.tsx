import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdAccountBalanceWallet,
  MdBuild,
  MdWork,
  MdFilterList,
  MdClear,
  MdArrowUpward,
  MdArrowDownward,
  MdSort,
} from "react-icons/md";
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

// Helper function for sorting
const sortBusinesses = (businesses: UserData[], sortConfig: SortConfig) => {
  if (!sortConfig.key) return businesses;

  return [...businesses].sort((a, b) => {
    let aValue: any = a[sortConfig.key as keyof UserData];
    let bValue: any = b[sortConfig.key as keyof UserData];

    // Handle undefined/null values
    if (aValue === undefined || aValue === null) aValue = "";
    if (bValue === undefined || bValue === null) bValue = "";

    // Special handling for different data types
    switch (sortConfig.key) {
      case "registration_date":
        // Date sorting
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;

      case "balance":
        // Numeric sorting
        const aNum = Number(aValue) || 0;
        const bNum = Number(bValue) || 0;
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;

      case "business_name":
      case "username":
      case "location":
      case "email":
        // String sorting (case insensitive)
        const aStr = String(aValue || "").toLowerCase();
        const bStr = String(bValue || "").toLowerCase();
        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;

      default:
        // Default string sorting
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    }
  });
};

interface SortConfig {
  key: keyof UserData | "";
  direction: "asc" | "desc";
}

const Businesses: React.FC = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<UserData[]>([]);
  const [filtered, setFiltered] = useState<UserData[]>([]);
  const [sorted, setSorted] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    location: "",
    registrationDate: "",
    balanceRange: "",
    businessName: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "registration_date",
    direction: "asc",
  });

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

  // Apply search and filters
  useEffect(() => {
    let result = businesses;

    // Apply search term
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((b) =>
        Object.values(b).some((val) =>
          String(val || "")
            .toLowerCase()
            .includes(lower)
        )
      );
    }

    // Apply filters
    if (filters.location) {
      result = result.filter((b) =>
        b.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.businessName) {
      result = result.filter((b) =>
        b.business_name
          ?.toLowerCase()
          .includes(filters.businessName.toLowerCase())
      );
    }

    if (filters.registrationDate) {
      result = result.filter((b) =>
        formatDate(b.registration_date).includes(filters.registrationDate)
      );
    }

    if (filters.balanceRange) {
      result = result.filter((b) => {
        const balance = b.balance || 0;
        switch (filters.balanceRange) {
          case "0-1000":
            return balance >= 0 && balance <= 1000;
          case "1001-5000":
            return balance >= 1001 && balance <= 5000;
          case "5001+":
            return balance >= 5001;
          case "no-balance":
            return !b.balance || b.balance === 0;
          default:
            return true;
        }
      });
    }

    setFiltered(result);
  }, [searchTerm, businesses, filters]);

  // Apply sorting
  useEffect(() => {
    const sortedBusinesses = sortBusinesses(filtered, sortConfig);
    setSorted(sortedBusinesses);
  }, [filtered, sortConfig]);

  const handleGoBack = () => navigate(-1);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm("");

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      location: "",
      registrationDate: "",
      balanceRange: "",
      businessName: "",
    });
    setSearchTerm("");
  };

  const handleSort = (key: keyof UserData) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key: keyof UserData) => {
    if (sortConfig.key !== key) {
      return <MdSort size={14} />;
    }
    return sortConfig.direction === "asc" ? (
      <MdArrowUpward size={14} />
    ) : (
      <MdArrowDownward size={14} />
    );
  };

  const getSortTooltip = (key: keyof UserData) => {
    if (sortConfig.key !== key) {
      return `Sort by ${key.replace("_", " ")}`;
    }
    return `Sorted ${
      sortConfig.direction === "asc" ? "ascending" : "descending"
    }`;
  };

  const hasActiveFilters =
    Object.values(filters).some((filter) => filter !== "") || searchTerm !== "";

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

        {/* Search and Filters */}
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
              <div style={styles.controlButtons}>
                <div style={styles.filterButtons}>
                  <button
                    style={{
                      ...styles.filterToggle,
                      ...(showFilters ? styles.filterToggleActive : {}),
                    }}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <MdFilterList size={16} />
                    Filters
                    {hasActiveFilters && (
                      <span style={styles.activeFilterDot}></span>
                    )}
                  </button>
                  {hasActiveFilters && (
                    <button
                      style={styles.clearFiltersButton}
                      onClick={clearAllFilters}
                    >
                      <MdClear size={16} />
                      Clear All
                    </button>
                  )}
                </div>
                <div style={styles.sortInfo}>
                  <span style={styles.sortInfoText}>
                    Sorted by:{" "}
                    {sortConfig.key
                      ? `${sortConfig.key.replace("_", " ")} ${
                          sortConfig.direction === "asc" ? "↑" : "↓"
                        }`
                      : "None"}
                  </span>
                </div>
              </div>
              {searchTerm && (
                <span style={styles.resultsText}>
                  Showing {sorted.length} of {businesses.length} businesses
                </span>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div style={styles.filterPanel}>
              <div style={styles.filterGrid}>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Business Name</label>
                  <input
                    type="text"
                    placeholder="Filter by business name..."
                    value={filters.businessName}
                    onChange={(e) =>
                      handleFilterChange("businessName", e.target.value)
                    }
                    style={styles.filterInput}
                  />
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Location</label>
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    style={styles.filterInput}
                  />
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Registration Date</label>
                  <input
                    type="text"
                    placeholder="MM/DD/YYYY or YYYY"
                    value={filters.registrationDate}
                    onChange={(e) =>
                      handleFilterChange("registrationDate", e.target.value)
                    }
                    style={styles.filterInput}
                  />
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Balance Range</label>
                  <select
                    value={filters.balanceRange}
                    onChange={(e) =>
                      handleFilterChange("balanceRange", e.target.value)
                    }
                    style={styles.filterSelect}
                  >
                    <option value="">All Balances</option>
                    <option value="0-1000">0 - 1,000</option>
                    <option value="1001-5000">1,001 - 5,000</option>
                    <option value="5001+">5,001+</option>
                    <option value="no-balance">No Balance</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading businesses...</p>
        ) : sorted.length === 0 ? (
          <div style={styles.noResults}>
            <p>
              {hasActiveFilters
                ? "No businesses found matching your filters."
                : "No businesses available."}
            </p>
            {hasActiveFilters && (
              <button
                style={styles.clearSearchButton}
                onClick={clearAllFilters}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <div style={styles.tableHeaderSection}>
              <h3 style={styles.tableTitle}>
                Businesses ({sorted.length})
                {hasActiveFilters && (
                  <span style={styles.filteredText}> • Filtered</span>
                )}
              </h3>
              {hasActiveFilters && (
                <div style={styles.activeFilters}>
                  {filters.businessName && (
                    <span style={styles.filterTag}>
                      Business: {filters.businessName}
                    </span>
                  )}
                  {filters.location && (
                    <span style={styles.filterTag}>
                      Location: {filters.location}
                    </span>
                  )}
                  {filters.registrationDate && (
                    <span style={styles.filterTag}>
                      Date: {filters.registrationDate}
                    </span>
                  )}
                  {filters.balanceRange && (
                    <span style={styles.filterTag}>
                      Balance:{" "}
                      {
                        {
                          "0-1000": "0 - 1,000",
                          "1001-5000": "1,001 - 5,000",
                          "5001+": "5,001+",
                          "no-balance": "No Balance",
                        }[filters.balanceRange]
                      }
                    </span>
                  )}
                </div>
              )}
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>P. Picture</th>
                    <th style={styles.tableHeader}>
                      <button
                        style={styles.sortableHeader}
                        onClick={() => handleSort("username")}
                        title={getSortTooltip("username")}
                      >
                        Username {getSortIcon("username")}
                      </button>
                    </th>
                    <th style={styles.tableHeader}>
                      <button
                        style={styles.sortableHeader}
                        onClick={() => handleSort("business_name")}
                        title={getSortTooltip("business_name")}
                      >
                        Business Name {getSortIcon("business_name")}
                      </button>
                    </th>
                    <th style={styles.tableHeader}>
                      <button
                        style={styles.sortableHeader}
                        onClick={() => handleSort("registration_date")}
                        title={getSortTooltip("registration_date")}
                      >
                        Reg Date {getSortIcon("registration_date")}
                      </button>
                    </th>
                    <th style={styles.tableHeader}>
                      <button
                        style={styles.sortableHeader}
                        onClick={() => handleSort("location")}
                        title={getSortTooltip("location")}
                      >
                        Location {getSortIcon("location")}
                      </button>
                    </th>
                    <th style={styles.tableHeader}>Email</th>
                    <th style={styles.tableHeader}>Phone</th>
                    <th style={styles.tableHeader}>
                      <button
                        style={styles.sortableHeader}
                        onClick={() => handleSort("balance")}
                        title={getSortTooltip("balance")}
                      >
                        Balance {getSortIcon("balance")}
                      </button>
                    </th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((user) => (
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
                              ...styles.iconButton,
                              background: "#007bff",
                            }}
                            onClick={() =>
                              navigate(`/user-balance/${user.user_id}`, {
                                state: {
                                  profilePicture: user.profile_picture,
                                  username: user.username,
                                  businessName: user.business_name,
                                },
                              })
                            }
                            title="View Balance"
                          >
                            <MdAccountBalanceWallet size={18} />
                          </button>
                          <button
                            style={{
                              ...styles.iconButton,
                              background: "#00BDD6",
                            }}
                            onClick={() =>
                              navigate(`/user-tools/${user.user_id}`, {
                                state: {
                                  profilePicture: user.profile_picture,
                                  username: user.username,
                                  businessName: user.business_name,
                                },
                              })
                            }
                            title="View Tools"
                          >
                            <MdBuild size={18} />
                          </button>
                          <button
                            style={{
                              ...styles.iconButton,
                              background: "#7A3FFF",
                            }}
                            onClick={() =>
                              navigate(`/user-vacancies/${user.user_id}`, {
                                state: {
                                  profilePicture: user.profile_picture,
                                  username: user.username,
                                  businessName: user.business_name,
                                },
                              })
                            }
                            title="View Vacancies"
                          >
                            <MdWork size={18} />
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
    padding: "0px 20px",
    background:
      "linear-gradient(135deg, #0f0c1d 0%, #1a1635 50%, #251d3a 100%)",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    color: "#f0f0f0",
  },
  mainContent: {
    width: "100%",
    maxWidth: "90vw",
    margin: "0 auto",
  },
  pageTitle: {
    color: "#00BDD6",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
  },
  pageText: {
    fontSize: "15px",
    marginBottom: "24px",
    color: "rgba(240, 240, 240, 0.8)",
    lineHeight: "1.6",
  },
  backButton: {
    backgroundColor: "#8050E6",
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
  controlButtons: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  filterButtons: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  filterToggle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "transparent",
    border: "1px solid #00BDD6",
    color: "#00BDD6",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  filterToggleActive: {
    backgroundColor: "rgba(0, 189, 214, 0.1)",
  },
  clearFiltersButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "transparent",
    border: "1px solid #ff6b6b",
    color: "#ff6b6b",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  sortInfo: {
    display: "flex",
    alignItems: "center",
  },
  sortInfoText: {
    fontSize: "12px",
    color: "#00FF9D",
    backgroundColor: "rgba(0, 255, 157, 0.1)",
    padding: "4px 8px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 255, 157, 0.3)",
  },
  activeFilterDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#00BDD6",
  },
  filterPanel: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(0, 189, 214, 0.2)",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  filterLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#00BDD6",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  filterInput: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 189, 214, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#f0f0f0",
    fontSize: "14px",
    outline: "none",
  },
  filterSelect: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid rgba(0, 189, 214, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#f0f0f0",
    fontSize: "14px",
    outline: "none",
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
  tableHeaderSection: {
    marginBottom: "16px",
  },
  tableTitle: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  filteredText: {
    color: "#00FF9D",
    fontSize: "14px",
    fontWeight: "normal",
  },
  activeFilters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  filterTag: {
    backgroundColor: "rgba(0, 189, 214, 0.2)",
    color: "#00BDD6",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    border: "1px solid rgba(0, 189, 214, 0.3)",
  },
  tableWrapper: {
    overflowX: "auto",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "12px",
    padding: "0",
    border: "1px solid rgba(0, 189, 214, 0.1)",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
  },
  tableHeaderRow: {
    borderBottom: "2px solid rgba(0, 189, 214, 0.3)",
    background: "rgba(0, 189, 214, 0.05)",
  },
  tableHeader: {
    padding: "16px 12px",
    textAlign: "left",
    color: "#00BDD6",
    fontWeight: "600",
    fontSize: "13px",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  sortableHeader: {
    background: "none",
    border: "none",
    color: "#00BDD6",
    fontWeight: "600",
    fontSize: "13px",
    textTransform: "uppercase",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "0",
    transition: "color 0.2s",
  },
  tableRow: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    transition: "background-color 0.2s",
  },
  tableCell: {
    padding: "14px 12px",
    fontSize: "14px",
    color: "#f0f0f0",
    whiteSpace: "nowrap",
  },
  balanceCell: {
    padding: "14px 12px",
    fontSize: "14px",
    color: "#00FF9D",
    whiteSpace: "nowrap",
    fontWeight: "600",
  },
  thumbnail: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(0, 189, 214, 0.3)",
  },
  actionsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "8px",
    alignItems: "center",
  },
  iconButton: {
    border: "none",
    color: "white",
    padding: "8px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s",
  },
};

export default Businesses;
