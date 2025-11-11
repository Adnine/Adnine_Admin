import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  MdLogout,
  MdAdminPanelSettings,
  MdNotifications,
  MdAccountCircle,
} from "react-icons/md";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <div style={styles.titleSection}>
                <MdAdminPanelSettings size={28} style={styles.headerIcon} />
                <div>
                  <h1 style={styles.headerTitle}>A9 Admin Panel</h1>
                  <span style={styles.headerSubtitle}>
                    Management Dashboard
                  </span>
                </div>
              </div>
            </div>
            <div style={styles.headerRight}>
              {/* Notification Bell */}

              {/* User Profile */}
              <div style={styles.userProfile} className="user-profile">
                <MdAccountCircle size={28} style={styles.userIcon} />
                <div style={styles.userInfo}>
                  <span style={styles.userName}>Admin User</span>
                  <span style={styles.userRole}>Administrator</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                style={styles.logoutButton}
                onClick={handleLogout}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(231, 76, 60, 0.9)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(231, 76, 60, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(231, 76, 60, 0.8)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(231, 76, 60, 0.3)";
                }}
              >
                <MdLogout style={styles.logoutIcon} />
                Logout
              </button>
            </div>
          </div>
        </header>
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#0f0a1a",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  main: {
    flex: 1,
    marginLeft: "70px", // Match sidebar collapsed width
    display: "flex",
    flexDirection: "column" as const,
    transition: "margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    minWidth: 0, // Prevent overflow issues
  },
  header: {
    backgroundColor: "rgba(15, 12, 29, 0.95)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(0, 189, 214, 0.2)",
    padding: "0 24px",
    position: "sticky" as const,
    top: 0,
    zIndex: 999, // Lower than sidebar z-index
    boxShadow: "0 2px 20px rgba(0, 0, 0, 0.3)",
    height: "89px", // Reduced height
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1400px",
    margin: "0 auto",
    height: "100%", // Take full height of header
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
  },
  titleSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerIcon: {
    color: "#00BDD6",
    filter: "drop-shadow(0 0 8px rgba(0, 189, 214, 0.3))",
  },
  headerTitle: {
    fontSize: "22px", // Reduced font size
    fontWeight: "700",
    color: "#fff",
    margin: 0,
    letterSpacing: "-0.5px",
    background: "linear-gradient(135deg, #00BDD6 0%, #8050E6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
  },
  headerSubtitle: {
    fontSize: "12px", // Reduced font size
    color: "rgba(240, 240, 240, 0.7)",
    fontWeight: "400",
    letterSpacing: "0.2px",
    marginTop: "1px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px", // Reduced gap
  },
  iconButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#f0f0f0",
    border: "none",
    borderRadius: "10px",
    padding: "8px", // Reduced padding
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    transition: "all 0.2s ease",
    backdropFilter: "blur(10px)",
    // border: "1px solid rgba(255, 255, 255, 0.1)",
    width: "38px", // Reduced size
    height: "38px", // Reduced size
  },
  notificationBadge: {
    position: "absolute" as const,
    top: "-2px",
    right: "-2px",
    backgroundColor: "#e74c3c",
    color: "white",
    borderRadius: "50%",
    width: "16px", // Reduced size
    height: "16px", // Reduced size
    fontSize: "9px", // Reduced font size
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "10px", // Reduced gap
    padding: "6px 12px", // Reduced padding
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  userIcon: {
    color: "#00BDD6",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1px", // Reduced gap
  },
  userName: {
    fontSize: "13px", // Reduced font size
    fontWeight: "600",
    color: "#fff",
  },
  userRole: {
    fontSize: "11px", // Reduced font size
    color: "rgba(240, 240, 240, 0.6)",
    fontWeight: "400",
  },
  logoutButton: {
    backgroundColor: "rgba(231, 76, 60, 0.8)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "8px 16px", // Reduced padding
    fontSize: "13px", // Reduced font size
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px", // Reduced gap
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(231, 76, 60, 0.3)",
    backdropFilter: "blur(10px)",
    // border: "1px solid rgba(255, 255, 255, 0.1)",
    height: "38px", // Reduced height
  },
  logoutIcon: {
    fontSize: "16px", // Reduced size
  },
  content: {
    flex: 1,
    padding: "24px", // Reduced padding
    background:
      "linear-gradient(135deg, #0f0c1d 0%, #1a1635 50%, #251d3a 100%)",
    minHeight: "calc(100vh - 60px)", // Adjusted for reduced header height
    position: "relative" as const,
    overflow: "auto",
  },
};

// Add hover effects for icon buttons
const addHoverEffects = `
  .icon-button:hover {
    background-color: rgba(0, 189, 214, 0.2) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 3px 12px rgba(0, 189, 214, 0.2) !important;
    border-color: rgba(0, 189, 214, 0.3) !important;
  }
  
  .user-profile:hover {
    background-color: rgba(255, 255, 255, 0.08) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2) !important;
  }
`;

// Inject the CSS for hover effects
if (typeof document !== "undefined") {
  setTimeout(() => {
    const styleSheet = document.styleSheets[0];
    if (styleSheet) {
      try {
        styleSheet.insertRule(addHoverEffects, styleSheet.cssRules.length);
      } catch (e) {
        console.log("Error injecting CSS:", e);
      }
    }
  }, 0);
}

export default Layout;
