import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllUserBalances } from "../utils/fetchUsers";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  MdArrowBack,
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdTrendingDown,
  MdPeople,
  MdDownload,
  MdExpandMore,
  MdExpandLess,
  MdAttachMoney,
} from "react-icons/md";

// --- Backend response types ---
interface Transaction {
  description: string;
  amount: string;
  created_at: string;
  engine_used: string;
  historyDate?: string;
}

interface HistoryItem {
  date: string;
  transactions: Transaction[];
}

interface UserBalanceSummary {
  user_id: string;
  total_balance: number;
  history: HistoryItem[];
}

interface EngineGroup {
  engine: string;
  transactions: Transaction[];
}

type AdminBalanceResponse = UserBalanceSummary[];

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
  const [usersData, setUsersData] = useState<UserBalanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  }, []);

  const { platformBalance, totalUsage, totalTopUp, chartData } = useMemo(() => {
    let platformBalance = 0;
    let totalUsage = 0;
    let totalTopUp = 0;
    const usageData: { [key: string]: number } = {};

    platformBalance = usersData.reduce(
      (sum, user) => sum + (user.total_balance || 0),
      0
    );

    usersData.forEach((user) => {
      (user.history || []).forEach((h) => {
        (h.transactions || []).forEach((t) => {
          const amount = parseFloat(t.amount);
          if (isNaN(amount)) return;

          if (amount > 0) {
            totalTopUp += amount;
          } else if (amount < 0) {
            totalUsage += Math.abs(amount);
            const engine =
              !t.engine_used || t.engine_used === "N/A"
                ? "Top Up"
                : t.engine_used;
            usageData[engine] = (usageData[engine] || 0) + Math.abs(amount);
          }
        });
      });
    });

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

  const handleUserClick = (userId: string) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setSelectedUserEngineGroups([]);
      setSelectedUserOpenGroups([]);
      return;
    }

    const selectedUser = usersData.find((u) => u.user_id === userId);
    if (!selectedUser) return;

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

    setSelectedUserId(userId);
    setSelectedUserEngineGroups(engineGroupsArray);
    setSelectedUserOpenGroups([]);
  };

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

  const handleExportCSV = () => {
    if (!selectedUserId || selectedUserEngineGroups.length === 0) return;

    const transactionsToExport = selectedUserEngineGroups.flatMap(
      (group) => group.transactions
    );

    const headers = ["Date", "Description", "Engine", "Amount"];
    let csvContent = headers.join(",") + "\n";

    transactionsToExport.forEach((t) => {
      const engine =
        !t.engine_used || t.engine_used === "N/A" ? "Top Up" : t.engine_used;
      const description = `"${t.description.replace(/"/g, '""')}"`;
      const row = [t.historyDate, description, engine, t.amount];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions-${selectedUserId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
        {/* Back Button */}
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <MdArrowBack size={18} style={styles.buttonIcon} />
          Go Back
        </button>

        <h2 style={styles.pageTitle}>
          <MdAccountBalanceWallet size={28} style={styles.titleIcon} />
          Admin Dashboard
        </h2>

        <div style={styles.contentWrapper}>
          {loading ? (
            <p style={styles.loadingText}>Loading dashboard data...</p>
          ) : error ? (
            <p style={styles.errorText}>Error: {error}</p>
          ) : (
            <>
              {/* Summary Cards */}
              <div style={styles.cardsGrid}>
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <MdTrendingUp
                      size={24}
                      style={{ ...styles.cardIcon, color: "#00FF9D" }}
                    />
                    <h3 style={styles.cardTitle}>Total Top Up</h3>
                  </div>
                  <p style={styles.topUp}>{totalTopUp?.toFixed(2) || "0.00"}</p>
                </div>

                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <MdTrendingDown
                      size={24}
                      style={{ ...styles.cardIcon, color: "#FF6B6B" }}
                    />
                    <h3 style={styles.cardTitle}>Total Used Credits</h3>
                  </div>
                  <p style={styles.used}>{totalUsage?.toFixed(2) || "0.00"}</p>
                </div>

                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <MdAttachMoney size={24} style={styles.cardIcon} />
                    <h3 style={styles.cardTitle}>Platform Balance</h3>
                  </div>
                  <p style={styles.balance}>
                    {platformBalance?.toFixed(2) || "0.00"}
                  </p>
                </div>

                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <MdPeople size={24} style={styles.cardIcon} />
                    <h3 style={styles.cardTitle}>Total Users</h3>
                  </div>
                  <p style={styles.usersCount}>{usersData.length}</p>
                </div>
              </div>

              {/* Engine Usage Diagram */}
              {chartData.length > 0 && (
                <div style={styles.chartContainer}>
                  <h3 style={styles.chartTitle}>
                    <MdTrendingUp size={20} style={styles.titleIcon} />
                    Total Engine Usage
                  </h3>
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
                        <span style={styles.legendText}>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User List */}
              <div style={styles.userListContainer}>
                <h3 style={styles.sectionTitle}>
                  <MdPeople size={20} style={styles.titleIcon} />
                  User Balances
                </h3>
                <div style={styles.userListHeader}>
                  <span>User ID</span>
                  <span>Balance</span>
                </div>
                {usersData.map((user) => (
                  <React.Fragment key={user.user_id}>
                    <div
                      style={styles.userRow(selectedUserId === user.user_id)}
                      onClick={() => handleUserClick(user.user_id)}
                    >
                      <span style={styles.userId}>{user.user_id}</span>
                      <span style={styles.userBalance(user.total_balance || 0)}>
                        {(user.total_balance || 0).toFixed(2)}
                      </span>
                    </div>

                    {selectedUserId === user.user_id && (
                      <div style={styles.detailsContainer}>
                        {selectedUserEngineGroups.length === 0 ? (
                          <p style={styles.noTransactions}>
                            No transactions found for this user.
                          </p>
                        ) : (
                          <>
                            <button
                              style={styles.exportButton}
                              onClick={handleExportCSV}
                            >
                              <MdDownload size={16} style={styles.buttonIcon} />
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
                                    <span style={styles.groupTitle}>
                                      {group.engine}
                                    </span>
                                    <span style={styles.groupArrow}>
                                      {isOpen ? (
                                        <MdExpandLess size={18} />
                                      ) : (
                                        <MdExpandMore size={18} />
                                      )}
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
                                              parseFloat(t.amount)
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

// Styles
const styles: { [key: string]: React.CSSProperties | any } = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0c1d 0%, #1a1635 50%, #251d3a 100%)",
    color: "#f0f0f0",
    padding: "32px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
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
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  titleIcon: {
    marginRight: "8px",
  },
  backButton: {
    backgroundColor: "#8050E6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background-color 0.2s ease",
  },
  buttonIcon: {
    marginRight: "4px",
  },
  // Cards Grid
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid rgba(0, 189, 214, 0.2)",
    textAlign: "center",
    backdropFilter: "blur(10px)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  cardIcon: {
    color: "#00BDD6",
  },
  cardTitle: {
    color: "#00BDD6",
    fontSize: "16px",
    fontWeight: "600",
    margin: 0,
  },
  topUp: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#00FF9D",
    margin: 0,
  },
  used: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#FF6B6B",
    margin: 0,
  },
  balance: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#00BDD6",
    margin: 0,
  },
  usersCount: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#00BDD6",
    margin: 0,
  },
  loadingText: {
    color: "#aaa",
    fontSize: "16px",
    textAlign: "center",
    padding: "40px",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: "16px",
    textAlign: "center",
    padding: "40px",
  },
  chartContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "32px",
    border: "1px solid rgba(0, 189, 214, 0.2)",
    backdropFilter: "blur(10px)",
  },
  chartTitle: {
    color: "#00BDD6",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  customTooltip: {
    backgroundColor: "#2e1f3a",
    border: "1px solid #00BDD6",
    padding: "12px",
    borderRadius: "8px",
    color: "#f0f0f0",
    fontSize: "14px",
    backdropFilter: "blur(10px)",
  },
  chartLegend: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "12px 24px",
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
  legendText: {
    fontSize: "14px",
  },
  sectionTitle: {
    color: "#00BDD6",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  userListContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid rgba(0, 189, 214, 0.2)",
    backdropFilter: "blur(10px)",
  },
  userListHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "2px solid rgba(0, 189, 214, 0.3)",
    color: "#00BDD6",
    fontWeight: "600",
    fontSize: "16px",
  },
  userRow: (isSelected: boolean): React.CSSProperties => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: isSelected
      ? "rgba(0, 189, 214, 0.1)"
      : "rgba(255,255,255,0.03)",
    borderLeft: isSelected ? "4px solid #00FF9D" : "4px solid transparent",
    padding: "16px 20px",
    borderRadius: "8px",
    marginTop: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: isSelected
      ? "1px solid rgba(0, 189, 214, 0.3)"
      : "1px solid transparent",
  }),
  userId: {
    fontSize: "14px",
    color: "#f0f0f0",
    fontWeight: "500",
  },
  userBalance: (balance: number): React.CSSProperties => ({
    color: balance >= 0 ? "#00FF9D" : "#FF6B6B",
    fontWeight: "600",
    fontSize: "16px",
  }),
  detailsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: "12px",
    margin: "8px 0 16px 0",
    padding: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  noTransactions: {
    color: "#aaa",
    fontSize: "14px",
    textAlign: "center",
    padding: "20px",
    margin: 0,
  },
  exportButton: {
    backgroundColor: "rgba(0, 255, 157, 0.1)",
    color: "#00FF9D",
    border: "2px solid #00FF9D",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    backdropFilter: "blur(5px)",
  },
  groupContainer: {
    marginBottom: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  groupHeader: {
    color: "#00BDD6",
    fontSize: "16px",
    fontWeight: "600",
    padding: "16px 20px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 189, 214, 0.1)",
    transition: "background-color 0.3s ease",
  },
  groupTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  groupArrow: {
    color: "#00BDD6",
  },
  transactionList: {
    padding: "12px 20px 20px 20px",
  },
  transactionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "12px 16px",
    borderRadius: "8px",
    marginTop: "8px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  transactionDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  transactionDescription: {
    fontSize: "14px",
    color: "#f0f0f0",
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: "12px",
    color: "#aaa",
    marginTop: "4px",
  },
  transactionAmount: (amount: number): React.CSSProperties => ({
    color: amount < 0 ? "#FF6B6B" : "#00FF9D",
    fontWeight: "600",
    fontSize: "14px",
    flexShrink: 0,
  }),
};

export default AdminDashboard;
