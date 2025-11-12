import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MdPeople,
  MdBuild,
  MdLocalOffer,
  MdTrendingUp,
  MdTrendingDown,
} from "react-icons/md";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { fetchAllUserBalances } from "../utils/fetchUsers";

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

type AdminBalanceResponse = UserBalanceSummary[];

const COLORS = [
  "#00BDD6",
  "#82ca9d",
  "#FFC300",
  "#FF5733",
  "#C70039",
  "#900C3F",
  "#581845",
  "#A3E4D7",
];

const navigationCards = [
  {
    title: "Users Dashboard",
    description: "View key metrics, analytics, and user statistics.",
    icon: MdPeople,
    path: "/users",
    color: "#00BDD6",
  },
  {
    title: "Tools & Settings",
    description: "Access admin tools, content management, and configuration.",
    icon: MdBuild,
    path: "/tools",
    color: "#00BDD6",
  },
  {
    title: "Promotions",
    description:
      "Manage current promotions, create new campaigns, and view performance.",
    icon: MdLocalOffer,
    path: "/tools-promotions",
    color: "#00BDD6",
  },
];

// Animated Number Component
const AnimatedNumber: React.FC<{
  value: number;
  duration?: number;
  format?: (value: number) => string;
}> = ({ value, duration = 2000, format = (val) => val.toFixed(2) }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startValue = 0;
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      const currentValue = startValue + (value - startValue) * easeOutQuart;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{format(displayValue)}</>;
};

// Custom Tooltip Component with positioning below the chart
const CustomTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = data.payload.total || data.payload.value; // Use total from payload or fallback to value
    const percentage = total > 0 ? (data.value / total) * 100 : 0;

    return (
      <div style={styles.customTooltip}>
        <p
          style={{
            color: data.color,
            fontWeight: "bold",
            margin: "0 0 8px 0",
          }}
        >
          {data.name}
        </p>
        <p style={{ margin: "4px 0" }}>{`Total Used: $${data.value.toFixed(
          2
        )}`}</p>
        <p style={{ margin: "4px 0" }}>{`Percentage: ${percentage.toFixed(
          2
        )}%`}</p>
      </div>
    );
  }
  return null;
};

const Home: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [usersData, setUsersData] = useState<UserBalanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const totalUsageValue = Object.values(usageData).reduce(
      (sum, value) => sum + value,
      0
    );
    const formattedChartData = Object.entries(usageData).map(
      ([engine, usage]) => ({
        name: engine,
        value: parseFloat(usage.toFixed(2)),
        total: totalUsageValue, // Add total for percentage calculation
      })
    );

    return {
      platformBalance,
      totalUsage,
      totalTopUp,
      chartData: formattedChartData,
    };
  }, [usersData]);

  return (
    <div style={styles.pageContainer}>
      {/* Animated background elements */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.bgOrb3} />

      <div style={styles.container}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <h1 style={styles.heroTitle}>
            Welcome Back, <span style={styles.heroAccent}>Admin</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Monitor your platform's performance and manage all aspects from one
            place
          </p>
        </div>

        {/* Admin Dashboard Section */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>⚠️ Error: {error}</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={styles.summaryCardsGrid}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryCardGlow} />
                <div style={styles.summaryCardHeader}>
                  <div style={styles.iconWrapper}>
                    <MdTrendingUp size={28} style={{ color: "#00FF9D" }} />
                  </div>
                  <h3 style={styles.summaryCardTitle}>Total Top Up</h3>
                </div>
                {/* UPDATED "Total Top Up" */}
                <p style={styles.topUp}>
                  <AnimatedNumber
                    value={totalTopUp || 0}
                    duration={1500}
                    format={(val) =>
                      val.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    }
                  />
                </p>
                <div style={styles.cardFooter}>
                  <span style={styles.cardBadge}>Revenue</span>
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div
                  style={{
                    ...styles.summaryCardGlow,
                    background:
                      "radial-gradient(circle at center, rgba(255, 107, 107, 0.15), transparent)",
                  }}
                />
                <div style={styles.summaryCardHeader}>
                  <div
                    style={{
                      ...styles.iconWrapper,
                      background:
                        "linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.05))",
                    }}
                  >
                    <MdTrendingDown size={28} style={{ color: "#FF6B6B" }} />
                  </div>
                  <h3 style={styles.summaryCardTitle}>Total Used Credits</h3>
                </div>
                {/* UPDATED "Total Used Credits" */}
                <p style={styles.used}>
                  <AnimatedNumber
                    value={totalUsage || 0}
                    duration={1500}
                    format={(val) =>
                      val.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    }
                  />
                </p>
                <div style={styles.cardFooter}>
                  <span
                    style={{
                      ...styles.cardBadge,
                      background: "rgba(255, 107, 107, 0.15)",
                      color: "#FF6B6B",
                    }}
                  >
                    Usage
                  </span>
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div style={styles.summaryCardGlow} />
                <div style={styles.summaryCardHeader}>
                  <div style={styles.iconWrapper}>
                    <MdTrendingUp size={28} style={{ color: "#00BDD6" }} />
                  </div>
                  <h3 style={styles.summaryCardTitle}>Engines Usage</h3>
                </div>
                <div style={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        labelLine={false}
                        label={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      {/* UPDATED Tooltip */}
                      <Tooltip content={<CustomTooltip />} offset={40} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div style={styles.summaryCardGlow} />
                <div style={styles.summaryCardHeader}>
                  <div style={styles.iconWrapper}>
                    <MdPeople size={28} style={{ color: "#00BDD6" }} />
                  </div>
                  <h3 style={styles.summaryCardTitle}>Total Users</h3>
                </div>
                <p style={styles.usersCount}>
                  <AnimatedNumber
                    value={usersData.length || 0}
                    duration={1200}
                    format={(val) => Math.round(val).toString()}
                  />
                </p>
                <div style={styles.cardFooter}>
                  <span style={styles.cardBadge}>Active</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Section Divider */}
        <div style={styles.sectionDivider}>
          <div style={styles.dividerLine} />
          <h2 style={styles.sectionTitle}>Quick Access</h2>
          <div style={styles.dividerLine} />
        </div>

        {/* Navigation Cards */}
        <div style={styles.cardsContainer}>
          {navigationCards.map((card, index) => (
            <Link key={index} to={card.path} style={styles.cardLink}>
              <div
                style={{
                  ...styles.card,
                  transform:
                    hoveredCard === index
                      ? "translateY(-8px)"
                      : "translateY(0)",
                  boxShadow:
                    hoveredCard === index
                      ? "0 20px 40px rgba(0, 189, 214, 0.3)"
                      : "0 8px 25px rgba(0,0,0,0.4)",
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={styles.cardBackground} />
                <div
                  style={{
                    ...styles.cardOverlay,
                    backgroundColor:
                      hoveredCard === index
                        ? "rgba(15, 12, 29, 0.85)"
                        : "rgba(15, 12, 29, 0.75)",
                    borderColor:
                      hoveredCard === index
                        ? card.color
                        : "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div style={styles.cardContent}>
                    <card.icon
                      style={{
                        ...styles.cardIcon,
                        color: card.color,
                        transform:
                          hoveredCard === index ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                    <h3 style={styles.cardTitle}>{card.title}</h3>
                    <p style={styles.cardDescription}>{card.description}</p>
                    <div
                      style={{
                        ...styles.actionButton,
                        borderColor: card.color,
                        color: card.color,
                        backgroundColor:
                          hoveredCard === index
                            ? "rgba(0, 189, 214, 0.2)"
                            : "rgba(0, 189, 214, 0.1)",
                        transform:
                          hoveredCard === index
                            ? "translateY(-2px)"
                            : "translateY(0)",
                        boxShadow:
                          hoveredCard === index
                            ? "0 4px 12px rgba(0, 189, 214, 0.3)"
                            : "none",
                      }}
                    >
                      Access Dashboard
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    padding: "0px 20px",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f0c1d 0%, #1a1635 50%, #251d3a 100%)",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    position: "relative" as const,
    overflow: "hidden",
  },
  bgOrb1: {
    position: "absolute" as const,
    top: "-10%",
    right: "-5%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(0, 189, 214, 0.15), transparent 70%)",
    filter: "blur(60px)",
    animation: "float 20s ease-in-out infinite",
    pointerEvents: "none" as const,
  },
  bgOrb2: {
    position: "absolute" as const,
    bottom: "-15%",
    left: "-10%",
    width: "700px",
    height: "700px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(0, 189, 214, 0.1), transparent 70%)",
    filter: "blur(80px)",
    animation: "float 25s ease-in-out infinite reverse",
    pointerEvents: "none" as const,
  },
  bgOrb3: {
    position: "absolute" as const,
    top: "40%",
    left: "50%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255, 107, 107, 0.08), transparent 70%)",
    filter: "blur(90px)",
    animation: "float 30s ease-in-out infinite",
    pointerEvents: "none" as const,
  },
  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    position: "relative" as const,
    zIndex: 1,
  },
  heroSection: {
    textAlign: "center" as const,
    padding: "clamp(20px, 4vw, 40px) 20px",
  },
  heroTitle: {
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: "16px",
    letterSpacing: "-0.5px",
    textShadow: "0 4px 20px rgba(0, 189, 214, 0.3)",
  },
  heroAccent: {
    background: "linear-gradient(135deg, #00BDD6 0%, #8050E6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "clamp(14px, 2vw, 18px)",
    color: "#b8b8d4",
    fontWeight: "400",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: 1.6,
  },
  summaryCardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
    gap: "clamp(16px, 2vw, 24px)",
    marginBottom: "clamp(30px, 5vw, 60px)",
  },
  summaryCard: {
    backgroundColor: "rgba(20, 16, 36, 0.6)",
    borderRadius: "20px",
    padding: "clamp(20px, 3vw, 28px)",
    border: "1px solid rgba(0, 189, 214, 0.2)",
    backdropFilter: "blur(20px)",
    position: "relative" as const,
    overflow: "hidden",
    transition: "all 0.3s ease",
    cursor: "default",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  },
  summaryCardGlow: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "radial-gradient(circle at top left, rgba(0, 189, 214, 0.15), transparent 60%)",
    pointerEvents: "none" as const,
  },
  summaryCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  iconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, rgba(0, 189, 214, 0.2), rgba(0, 189, 214, 0.05))",
    border: "1px solid rgba(0, 189, 214, 0.3)",
  },
  summaryCardTitle: {
    color: "#e0e0e0",
    fontSize: "15px",
    fontWeight: "600",
    margin: 0,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  topUp: {
    fontSize: "clamp(28px, 4vw, 36px)",
    fontWeight: "800",
    color: "#00FF9D",
    margin: "12px 0",
    textShadow: "0 2px 10px rgba(0, 255, 157, 0.3)",
  },
  used: {
    fontSize: "clamp(28px, 4vw, 36px)",
    fontWeight: "800",
    color: "#FF6B6B",
    margin: "12px 0",
    textShadow: "0 2px 10px rgba(255, 107, 107, 0.3)",
  },
  usersCount: {
    fontSize: "clamp(28px, 4vw, 36px)",
    fontWeight: "800",
    color: "#00BDD6",
    margin: "12px 0",
    textShadow: "0 2px 10px rgba(0, 189, 214, 0.3)",
  },
  cardFooter: {
    marginTop: "16px",
  },
  cardBadge: {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background: "rgba(0, 189, 214, 0.15)",
    color: "#00BDD6",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  loadingContainer: {
    textAlign: "center" as const,
    padding: "80px 20px",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(0, 189, 214, 0.1)",
    borderTop: "4px solid #00BDD6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  loadingText: {
    color: "#b8b8d4",
    fontSize: "16px",
  },
  errorContainer: {
    textAlign: "center" as const,
    padding: "80px 20px",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: "16px",
    padding: "20px",
    borderRadius: "12px",
    background: "rgba(255, 107, 107, 0.1)",
    border: "1px solid rgba(255, 107, 107, 0.3)",
  },
  sectionDivider: {
    display: "flex",
    alignItems: "center",
    gap: "clamp(12px, 2vw, 24px)",
    margin: "clamp(40px, 6vw, 60px) 0 clamp(30px, 4vw, 40px)",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(0, 189, 214, 0.5), transparent)",
  },
  sectionTitle: {
    color: "#00BDD6",
    fontSize: "clamp(18px, 2.5vw, 24px)",
    fontWeight: "700",
    whiteSpace: "nowrap" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "30px",
  },
  cardLink: {
    textDecoration: "none",
    color: "inherit",
    display: "block",
    height: "100%",
  },
  card: {
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.4s ease, box-shadow 0.4s ease",
    height: "400px",
    position: "relative" as const,
  },
  cardBackground: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, rgba(0, 189, 214, 0.1) 0%, rgba(41, 45, 68, 0.8) 100%)",
    borderRadius: "16px",
  },
  cardOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
    textAlign: "center" as const,
    transition: "background-color 0.4s ease, border-color 0.4s ease",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  cardContent: {
    width: "100%",
    maxWidth: "280px",
  },
  cardIcon: {
    fontSize: "64px",
    marginBottom: "20px",
    transition: "transform 0.3s ease",
  },
  cardTitle: {
    color: "#00BDD6",
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "16px",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  cardDescription: {
    fontSize: "15px",
    color: "#e0e0e0",
    lineHeight: 1.6,
    marginBottom: "24px",
    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
  },
  actionButton: {
    border: "2px solid #00BDD6",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    backdropFilter: "blur(5px)",
  },
  // Updated chart container with more height to accommodate tooltip below
  chartContainer: {
    height: "190px",
    width: "100%",
    marginTop: "12px",
    position: "relative" as const,
  },
  // Tooltip wrapper styling to position it below the chart

  customTooltip: {
    backgroundColor: "rgba(15, 12, 29, 0.95)",
    border: "1px solid rgba(0, 189, 214, 0.5)",
    padding: "12px",
    borderRadius: "8px",
    color: "#f0f0f0",
    fontSize: "12px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
    minWidth: "140px",
    textAlign: "center" as const,
    zIndex: 9999,
  },
} as const;

export default Home;
