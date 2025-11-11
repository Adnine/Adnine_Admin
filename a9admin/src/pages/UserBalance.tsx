import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchUserBalance } from "../utils/fetchUsers";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  MdArrowBack,
  MdAccountCircle,
  MdAccountBalanceWallet,
  MdBusiness,
  MdPerson,
  MdTrendingUp,
  MdTrendingDown,
} from "react-icons/md";

// Backend response types
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

interface EngineGroup {
  engine: string;
  transactions: Transaction[];
}

interface BalanceResponse {
  user_id: string;
  total_balance: number;
  history: HistoryItem[];
}

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

const UserBalance: React.FC = () => {
  const { user_id } = useParams<{ user_id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [balance, setBalance] = useState<number | null>(null);
  const [engineGroups, setEngineGroups] = useState<EngineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalTopUp, setTotalTopUp] = useState<number>(0);
  const [totalUsed, setTotalUsed] = useState<number>(0);

  // Get user profile data from navigation state
  const { profilePicture, username, businessName } = location.state || {};

  useEffect(() => {
    if (!user_id) return;

    const loadBalance = async () => {
      setLoading(true);
      try {
        const res: BalanceResponse = await fetchUserBalance(user_id);
        setBalance(res.total_balance);

        const allTransactions = res.history.flatMap((h: HistoryItem) =>
          h.transactions.map((t: Transaction) => ({
            ...t,
            historyDate: h.date,
          }))
        );

        // Calculate total top up and total used
        let topUpTotal = 0;
        let usedTotal = 0;

        allTransactions.forEach((t) => {
          const amount = parseFloat(t.amount);
          if (amount > 0) {
            topUpTotal += amount;
          } else {
            usedTotal += Math.abs(amount);
          }
        });

        setTotalTopUp(topUpTotal);
        setTotalUsed(usedTotal);

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
        setEngineGroups(engineGroupsArray);

        // Prepare data for the chart
        const usageData: { [key: string]: number } = {};
        allTransactions.forEach((t) => {
          let engine: string;
          if (!t.engine_used || t.engine_used === "N/A") {
            engine = "Top Up";
          } else {
            engine = t.engine_used;
          }
          // Only consider negative amounts (expenses) for usage
          const amount = parseFloat(t.amount);
          if (amount < 0) {
            usageData[engine] = (usageData[engine] || 0) + Math.abs(amount);
          }
        });

        const formattedChartData: ChartData[] = Object.entries(usageData).map(
          ([engine, totalUsage]) => ({
            name: engine,
            value: parseFloat(totalUsage.toFixed(2)),
          })
        );
        setChartData(formattedChartData);
      } catch (err: any) {
        console.error("Error fetching balance:", err);
        setError(err.message || "Failed to fetch balance");
      } finally {
        setLoading(false);
      }
    };
    loadBalance();
  }, [user_id]);

  const toggleGroup = (engine: string) => {
    setOpenGroups((prevOpenGroups) => {
      const isOpen = prevOpenGroups.includes(engine);
      if (isOpen) {
        return prevOpenGroups.filter((g) => g !== engine);
      } else {
        return [...prevOpenGroups, engine];
      }
    });
  };

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
        {/* Back Button - Now at the top */}
        <button style={styles.backButton} onClick={() => navigate(-1)}>
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
                <MdAccountBalanceWallet size={24} style={styles.titleIcon} />
                {businessName || username || "User"} Balance
              </h2>
              <p style={styles.userId}>
                <MdPerson size={14} style={styles.iconInline} />
                User ID: {user_id}
              </p>
              {username && businessName && username !== businessName && (
                <p style={styles.username}>
                  <MdBusiness size={14} style={styles.iconInline} />@{username}
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={styles.contentWrapper}>
          {loading ? (
            <p style={styles.loadingText}>Loading balance...</p>
          ) : error ? (
            <p style={styles.errorText}>Error: {error}</p>
          ) : (
            <>
              {/* Balance Summary Cards */}
              <div style={styles.cardsGrid}>
                {/* Current Balance */}
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <MdAccountBalanceWallet size={24} style={styles.cardIcon} />
                    <h3 style={styles.cardTitle}>Current Balance</h3>
                  </div>
                  <p style={styles.balance}>{balance?.toFixed(2) || "0.00"}</p>
                </div>

                {/* Total Top Up */}
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <MdTrendingUp
                      size={24}
                      style={{ ...styles.cardIcon, color: "#00FF9D" }}
                    />
                    <h3 style={styles.cardTitle}>Total Top Up</h3>
                  </div>
                  <p style={styles.topUp}>{totalTopUp.toFixed(2)}</p>
                </div>

                {/* Total Used */}
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <MdTrendingDown
                      size={24}
                      style={{ ...styles.cardIcon, color: "#FF6B6B" }}
                    />
                    <h3 style={styles.cardTitle}>Total Used</h3>
                  </div>
                  <p style={styles.used}>{totalUsed.toFixed(2)}</p>
                </div>
              </div>

              {/* Engine Usage Diagram */}
              {chartData.length > 0 && (
                <div style={styles.chartContainer}>
                  <h3 style={styles.chartTitle}>Engine Usage Overview</h3>
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

              {/* Transaction History */}
              {engineGroups.length > 0 && (
                <div style={styles.transactionSection}>
                  <h3 style={styles.sectionTitle}>Transaction History</h3>
                  {engineGroups.map((group) => {
                    const isOpen = openGroups.includes(group.engine);
                    return (
                      <div key={group.engine} style={styles.groupContainer}>
                        <div
                          style={styles.groupHeader}
                          onClick={() => toggleGroup(group.engine)}
                        >
                          <span style={styles.groupTitle}>{group.engine}</span>
                          <span style={styles.groupArrow}>
                            {isOpen ? "▼" : "►"}
                          </span>
                        </div>

                        {isOpen && (
                          <div style={styles.transactionList}>
                            {group.transactions.map((t, idx) => (
                              <div key={idx} style={styles.transactionRow}>
                                <div style={styles.transactionDetails}>
                                  <span style={styles.transactionDescription}>
                                    {t.description}
                                  </span>
                                  <span style={styles.transactionDate}>
                                    {t.historyDate}
                                  </span>
                                </div>
                                <span
                                  style={styles.transactionAmount(t.amount)}
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
                </div>
              )}
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
    background: "linear-gradient(to bottom, #160F24, #24213C, #2E1F3A)",
    color: "#f0f0f0",
    padding: "32px",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
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
  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "left",
  },
  // Cards Grid
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid rgba(0, 189, 214, 0.2)",
    textAlign: "center",
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
    fontWeight: "bold",
    margin: 0,
  },
  balance: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#00FF9D",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    border: "1px solid rgba(0, 189, 214, 0.2)",
  },
  chartTitle: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "16px",
    textAlign: "center",
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
    fontSize: "12px",
    color: "#f0f0f0",
  },
  legendColorBox: {
    width: "12px",
    height: "12px",
    borderRadius: "3px",
    marginRight: "6px",
  },
  legendText: {
    fontSize: "12px",
  },
  transactionSection: {
    marginTop: "24px",
  },
  sectionTitle: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  groupContainer: {
    marginBottom: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  groupHeader: {
    color: "#00BDD6",
    fontSize: "16px",
    fontWeight: "bold",
    padding: "12px 16px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 189, 214, 0.1)",
    transition: "background-color 0.2s ease",
  },
  groupTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
  transactionAmount: (amount: string): React.CSSProperties => ({
    color: amount.startsWith("-") ? "#FF6B6B" : "#00FFAB",
    fontWeight: "bold",
    fontSize: "14px",
    marginLeft: "16px",
    flexShrink: 0,
  }),
};

export default UserBalance;
