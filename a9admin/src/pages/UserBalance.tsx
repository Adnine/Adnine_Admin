import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import { useNavigate, useParams } from "react-router-dom";
import { fetchUserBalance } from "../utils/fetchUsers";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"; // Import Recharts components

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
  const [balance, setBalance] = useState<number | null>(null);
  const [engineGroups, setEngineGroups] = useState<EngineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]); // New state for chart data

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

        // --- Prepare data for the chart ---
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
            value: parseFloat(totalUsage.toFixed(2)), // Ensure number format
          })
        );
        setChartData(formattedChartData);
        // --- End preparing chart data ---

        // Optional: Uncomment this line to have all groups open by default
        // setOpenGroups(engineGroupsArray.map(g => g.engine));
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
  // Custom tooltip for the PieChart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];

      // Calculate total for percentage
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
        <h2 style={styles.pageTitle}>User Balance</h2>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          &larr; Go Back
        </button>

        <div style={styles.contentWrapper}>
          {loading ? (
            <p>Loading balance...</p>
          ) : error ? (
            <p style={{ color: "red" }}>Error: {error}</p>
          ) : (
            <>
              <div style={styles.card}>
                <p style={styles.label}>User ID:</p>
                <p style={styles.value}>{user_id}</p>
                <p style={styles.label}>Total Balance:</p>
                <p style={styles.balance}>{balance?.toFixed(2) || "0.00"}</p>
              </div>

              {/* --- NEW: Engine Usage Diagram --- */}
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
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* --- END NEW: Engine Usage Diagram --- */}

              {engineGroups.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  {engineGroups.map((group) => {
                    const isOpen = openGroups.includes(group.engine);
                    return (
                      <div key={group.engine} style={styles.groupContainer}>
                        <div
                          style={styles.groupHeader}
                          onClick={() => toggleGroup(group.engine)}
                        >
                          <span>{group.engine}</span>
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
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "16px",
  },
  label: {
    color: "#00BDD6",
    fontWeight: "bold",
    marginTop: "12px",
    marginBottom: "4px",
  },
  value: { fontSize: "14px", marginBottom: "8px" },
  balance: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#00BDD6",
    marginTop: "8px",
  },
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
  transactionAmount: (amount: string): React.CSSProperties => ({
    color: amount.startsWith("-") ? "#FF6B6B" : "#00FFAB",
    fontWeight: "bold",
    fontSize: "14px",
    marginLeft: "16px",
    flexShrink: 0,
  }),
  // --- NEW STYLES FOR CHART ---
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
  // --- END NEW STYLES ---
};

export default UserBalance;
