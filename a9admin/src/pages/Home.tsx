import React from "react";
import { Link, useNavigate } from "react-router-dom";

// --- Main Home Component ---
const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");

    // Navigate back to the login page
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* --- Header --- */}
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>A9 Admin</h1>
          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* --- Dashboard Title --- */}
        <h2 style={styles.gridTitle}>Welcome to your Dashboard</h2>

        {/* --- Card Grid --- */}
        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Dashboard</h3>
            <p style={styles.cardText}>
              View key metrics, analytics, and user statistics.
            </p>
          </div>
          <Link to="/tools">
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Tools</h3>
              <p style={styles.cardText}>
                Access admin tools, content management, and settings.
              </p>
            </div>
          </Link>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Promotions</h3>
            <p style={styles.cardText}>
              Manage current promotions, create new campaigns, and view
              performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
type StyleObject = React.CSSProperties;
type StyleMap = {
  [key: string]: StyleObject;
};

const styles: StyleMap = {
  // --- Main Container (matches Login) ---
  container: {
    minHeight: "100vh",
    padding: "32px",
    background: "linear-gradient(to bottom, #160F24, #24213C, #2E1F3A)",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    color: "#f0f0f0",
    boxSizing: "border-box" as const,
  },
  // --- Content Wrapper ---
  mainContent: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  // --- Header Styles ---
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    backgroundColor: "#e74c3c", // Red
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  // --- Card Grid Styles ---
  gridTitle: {
    color: "#00BDD6", // baby-blue
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "24px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#292d44", // Same as login inputs
    borderRadius: "10px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#00BDD6", // baby-blue
    marginBottom: "8px",
  },
  cardText: {
    fontSize: "14px",
    color: "#f0f0f0",
    lineHeight: 1.5,
  },
};

export default Home;
