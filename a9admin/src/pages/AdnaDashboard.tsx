import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllUserBalances } from "../utils/fetchUsers";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// --- Backend response types ---
interface Transaction {
  description: string;
  amount: string;
  created_at: string;
  engine_used: string;
  historyDate?: string; // For display
}

interface HistoryItem {
  date: string;
  transactions: Transaction[];
}

// Represents the data for a single user in the admin response
interface UserBalanceSummary {
  user_id: string;
  total_balance: number;
  history: HistoryItem[];
}

// Copied from UserBalance
interface EngineGroup {
  engine: string;
  transactions: Transaction[];
}

type AdminBalanceResponse = UserBalanceSummary[];

// Data type for the chart
interface ChartData {
  name: string;
  value: number;
}

const COLORS = [
  "#00BDD6", // Teal
  "#82ca9d", // Light Green
  "#FFC300", // Gold
  "#FF5733", // Orange-Red
  "#C70039", // Dark Red
  "#900C3F", // Deep Magenta
  "#581845", // Dark Purple
  "#A3E4D7", // Pale Cyan
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  // State to hold the array of all users
  const [usersData, setUsersData] = useState<UserBalanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State for selected user's details ---
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserEngineGroups, setSelectedUserEngineGroups] = useState<
    EngineGroup[]
  >([]);
  const [selectedUserOpenGroups, setSelectedUserOpenGroups] = useState<
    string[]
  >([]);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      try {
        const res: AdminBalanceResponse = await fetchAllUserBalances();
        setUsersData(res);
      } catch (err: any) {
        console.error("Error fetching all user balances:", err);
        setError(err.message || "Failed to fetch admin data");
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, []); // No dependencies, runs once on mount

  // --- Combined useMemo for all platform stats ---
  const { platformBalance, totalUsage, totalTopUp, chartData } = useMemo(() => {
    let platformBalance = 0;
    let totalUsage = 0;
    let totalTopUp = 0;
    const usageData: { [key: string]: number } = {};

    // 1. Calculate platform balance
    platformBalance = usersData.reduce(
      (sum, user) => sum + (user.total_balance || 0),
      0
    );

    // 2. Iterate all transactions for usage, topup, and chart data
    usersData.forEach((user) => {
      (user.history || []).forEach((h) => {
        (h.transactions || []).forEach((t) => {
          const amount = parseFloat(t.amount);
          if (isNaN(amount)) return; // Skip invalid data

          if (amount > 0) {
            // This is a "Top Up"
            totalTopUp += amount;
          } else if (amount < 0) {
            // This is "Usage"
            totalUsage += Math.abs(amount);

            // Add to chart data (following original logic)
            const engine =
              !t.engine_used || t.engine_used === "N/A"
                ? "Top Up"
                : t.engine_used;
            usageData[engine] = (usageData[engine] || 0) + Math.abs(amount);
          }
        });
      });
    });

    // 3. Format chart data
    const formattedChartData = Object.entries(usageData).map(
      ([engine, usage]) => ({
        name: engine,
        value: parseFloat(usage.toFixed(2)),
      })
    );

    return {
      platformBalance,
      totalUsage,
      totalTopUp,
      chartData: formattedChartData,
    };
  }, [usersData]);
  // --- End new useMemo ---

  // --- Click handler to show user details inline ---
  const handleUserClick = (userId: string) => {
    // If clicking the same user, close the details
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setSelectedUserEngineGroups([]);
      setSelectedUserOpenGroups([]);
      return;
    }

    // Find the user's data
    const selectedUser = usersData.find((u) => u.user_id === userId);
    if (!selectedUser) return;

    // Process this user's transactions (logic from UserBalance)
    const allTransactions = (selectedUser.history || []).flatMap((h) =>
      (h.transactions || []).map((t) => ({
        ...t,
        historyDate: h.date,
      }))
    );

    const grouped: { [key: string]: Transaction[] } = {};
    allTransactions.forEach((t) => {
      let engine: string;
      if (!t.engine_used || t.engine_used === "N/A") {
        engine = "Top Up";
      } else {
        engine = t.engine_used;
      }
      if (!grouped[engine]) grouped[engine] = [];
      grouped[engine].push(t);
    });

    const engineGroupsArray: EngineGroup[] = Object.entries(grouped).map(
      ([engine, transactions]) => ({ engine, transactions })
    );

    // Set the state to display this user's details
    setSelectedUserId(userId);
    setSelectedUserEngineGroups(engineGroupsArray);
    setSelectedUserOpenGroups([]); // Close all groups on new selection
  };

  // --- Toggle handler for the SELECTED user's groups ---
  const toggleSelectedUserGroup = (engine: string) => {
    setSelectedUserOpenGroups((prevOpenGroups) => {
      const isOpen = prevOpenGroups.includes(engine);
      if (isOpen) {
        return prevOpenGroups.filter((g) => g !== engine);
      } else {
        return [...prevOpenGroups, engine];
      }
    });
  };

  // --- NEW: Function to export selected user's transactions as CSV ---
  const handleExportCSV = () => {
    if (!selectedUserId || selectedUserEngineGroups.length === 0) return;

    // 1. Flatten all transactions from the selected user's groups
    const transactionsToExport = selectedUserEngineGroups.flatMap(
      (group) => group.transactions
    );

    // 2. Define headers
    const headers = ["Date", "Description", "Engine", "Amount"];
    let csvContent = headers.join(",") + "\n";

    // 3. Add data rows
    transactionsToExport.forEach((t) => {
      const engine =
        !t.engine_used || t.engine_used === "N/A" ? "Top Up" : t.engine_used;

      // Escape commas in description by wrapping in quotes
      // Also escape double quotes inside the description by doubling them
      const description = `"${t.description.replace(/"/g, '""')}"`;

      const row = [t.historyDate, description, engine, t.amount];
      csvContent += row.join(",") + "\n";
    });

    // 4. Create and download blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions-${selectedUserId}.csv`);
    document.body.appendChild(link); // Required for Firefox
    link.click();

    // 5. Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // --- END NEW ---

  // Custom tooltip for the PieChart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? (data.value / total) * 100 : 0;

      return (
        <div style={styles.customTooltip}>
          <p style={{ color: data.color, fontWeight: "bold" }}>{data.name}</p>
          <p>{`Total Used: ${data.value.toFixed(2)}`}</p>
          <p>{`Percentage: ${percentage.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <h2 style={styles.pageTitle}>Admin Dashboard</h2>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          &larr; Go Back
        </button>

        <div style={styles.contentWrapper}>
          {loading ? (
            <p>Loading dashboard data...</p>
          ) : error ? (
            <p style={{ color: "red" }}>Error: {error}</p>
          ) : (
            <>
              {/* --- Summary Cards --- */}
              <div style={styles.summaryContainer}>
                <div style={styles.summaryCard}>
                  <p style={styles.label}>Total Top Up</p>
                  <p style={styles.balancePositive}>
                    {totalTopUp?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div style={styles.summaryCard}>
                  <p style={styles.label}>Total Used Credits</p>
                  <p style={styles.balanceNegative}>
                    {totalUsage?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div style={styles.summaryCard}>
                  <p style={styles.label}>Total Platform Balance</p>
                  <p style={styles.balance}>
                    {platformBalance?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div style={styles.summaryCard}>
                  <p style={styles.label}>Total Users</p>
                  <p style={styles.balance}>{usersData.length}</p>
                </div>
              </div>

              {/* --- Engine Usage Diagram --- */}
              {chartData.length > 0 && (
                <div style={styles.chartContainer}>
                  <h3 style={styles.chartTitle}>Total Engine Usage</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        labelLine={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={styles.chartLegend}>
                    {chartData.map((entry, index) => (
                      <div key={`legend-${index}`} style={styles.legendItem}>
                        <span
                          style={{
                            ...styles.legendColorBox,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></span>
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- User List (with inline expandable rows) --- */}
              <div style={styles.userListContainer}>
                <h3 style={styles.chartTitle}>User Balances</h3>
                <div style={styles.userListHeader}>
                  <span>User ID</span>
                  <span>Balance</span>
                </div>
                {usersData.map((user) => (
                  <React.Fragment key={user.user_id}>
                    {/* --- This is the Clickable User Row (NOW HIGHLIGHTS) --- */}
                    <div
                      style={styles.userRow(selectedUserId === user.user_id)}
                      onClick={() => handleUserClick(user.user_id)}
                    >
                      <span style={styles.transactionDescription}>
                        {user.user_id}
                      </span>
                      <span
                        style={styles.transactionAmount(
                          (user.total_balance || 0).toString()
                        )}
                      >
                        {(user.total_balance || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* --- Inline Expandable Details --- */}
                    {selectedUserId === user.user_id && (
                      <div style={styles.detailsContainer}>
                        {selectedUserEngineGroups.length === 0 ? (
                          <p
                            style={{
                              ...styles.transactionDescription,
                              padding: "12px",
                            }}
                          >
                            No transactions found for this user.
                          </p>
                        ) : (
                          // --- NEW: Fragment to hold button and list ---
                          <>
                            <button
                              style={styles.exportButton}
                              onClick={handleExportCSV}
                            >
                              Export as CSV
                            </button>

                            {selectedUserEngineGroups.map((group) => {
                              const isOpen = selectedUserOpenGroups.includes(
                                group.engine
                              );
                              return (
                                <div
                                  key={group.engine}
                                  style={styles.groupContainer}
                                >
                                  <div
                                    style={styles.groupHeader}
                                    onClick={() =>
                                      toggleSelectedUserGroup(group.engine)
                                    }
                                  >
                                    <span>{group.engine}</span>
                                    <span style={styles.groupArrow}>
                                      {isOpen ? "▼" : "►"}
                                    </span>
                                  </div>

                                  {isOpen && (
                                    <div style={styles.transactionList}>
                                      {group.transactions.map((t, idx) => (
                                        <div
                                          key={idx}
                                          style={styles.transactionRow}
                                        >
                                          <div
                                            style={styles.transactionDetails}
                                          >
                                            <span
                                              style={
                                                styles.transactionDescription
                                              }
                                            >
                                              {t.description}
                                            </span>
                                            <span
                                              style={styles.transactionDate}
                                            >
                                              {t.historyDate}
                                            </span>
                                          </div>
                                          <span
                                            style={styles.transactionAmount(
                                              t.amount
                                            )}
                                          >
                                            {t.amount}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    )}
                    {/* --- End Inline Expandable Details --- */}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties | any } = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #160F24, #24213C, #2E1F3A)",
    color: "#f0f0f0",
    padding: "32px",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  mainContent: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "left",
    marginTop: "32px",
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
    fontWeight: 500,
    cursor: "pointer",
  },
  // --- NEW: Export Button Style ---
  exportButton: {
    backgroundColor: "#00FFAB",
    color: "#160F24",
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "16px",
    display: "inline-block",
    transition: "background-color 0.2s ease",
  },
  // ---
  label: {
    color: "#00BDD6",
    fontWeight: "bold",
    marginTop: "12px",
    marginBottom: "4px",
  },
  balance: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#00BDD6", // Teal
    marginTop: "8px",
  },
  balancePositive: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#00FFAB", // Green
    marginTop: "8px",
  },
  balanceNegative: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#FF6B6B", // Red
    marginTop: "8px",
  },
  chartContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px",
    textAlign: "center",
  },
  chartTitle: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  customTooltip: {
    backgroundColor: "#2e1f3a",
    border: "1px solid #00BDD6",
    padding: "10px",
    borderRadius: "4px",
    color: "#f0f0f0",
    fontSize: "13px",
  },
  chartLegend: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px 20px",
    marginTop: "20px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#f0f0f0",
  },
  legendColorBox: {
    width: "12px",
    height: "12px",
    borderRadius: "3px",
    marginRight: "8px",
  },
  transactionAmount: (amount: string): React.CSSProperties => ({
    color: parseFloat(amount) < 0 ? "#FF6B6B" : "#00FFAB",
    fontWeight: "bold",
    fontSize: "14px",
    marginLeft: "16px",
    flexShrink: 0,
  }),
  // --- Summary & User List Styles ---
  summaryContainer: {
    display: "flex",
    flexWrap: "wrap", // Allow wrapping on smaller screens
    gap: "16px",
    marginBottom: "16px",
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "24px",
    flex: 1, // Each card takes equal space
    minWidth: "200px", // Prevent cards from getting too small
  },
  userListContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "16px 24px 24px 24px",
    marginBottom: "16px",
  },
  userListHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderBottom: "1px solid rgba(0, 189, 214, 0.3)",
    color: "#00BDD6",
    fontWeight: "bold",
    fontSize: "14px",
  },
  // --- MODIFIED: userRow is now a function ---
  userRow: (isSelected: boolean): React.CSSProperties => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // Conditionally change background and add a border if selected
    backgroundColor: isSelected
      ? "rgba(0, 189, 214, 0.1)"
      : "rgba(255,255,255,0.05)",
    borderLeft: isSelected ? "3px solid #00FFAB" : "3px solid transparent",
    padding: "12px",
    paddingLeft: isSelected ? "9px" : "12px", // Adjust padding for the border
    borderRadius: "6px",
    marginTop: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  }),
  // --- Container for the expanded details ---
  detailsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: "6px",
    margin: "4px 0 8px 0",
    padding: "12px",
  },
  // --- Styles for collapsible groups (now used inside detailsContainer) ---
  groupContainer: {
    marginBottom: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  groupHeader: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "bold",
    padding: "12px 16px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 189, 214, 0.1)",
  },
  groupArrow: {
    fontSize: "14px",
    color: "#00BDD6",
  },
  transactionList: {
    padding: "8px 16px 16px 16px",
  },
  transactionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "8px 12px",
    borderRadius: "6px",
    marginTop: "6px",
  },
  transactionDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  transactionDescription: {
    fontSize: "14px",
    color: "#f0f0f0",
  },
  transactionDate: {
    fontSize: "12px",
    color: "#aaa",
    marginTop: "2px",
  },
};

export default AdminDashboard;
