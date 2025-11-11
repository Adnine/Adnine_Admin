import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import unionLogo from "../assets/icons/Union.svg";

// Import Material Design icons from React Icons
import {
  MdDashboard,
  MdPeople,
  MdBuild,
  MdLocalOffer,
  MdBusinessCenter, // updated icon
  MdPersonSearch, // updated icon
  MdBarChart,
} from "react-icons/md";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    { path: "/home", label: "Dashboard", icon: <MdDashboard /> },
    { path: "/users", label: "Users", icon: <MdPeople /> },
    { path: "/tools", label: "Tools", icon: <MdBuild /> },
    { path: "/tools-promotions", label: "Promotions", icon: <MdLocalOffer /> },
    { path: "/Businesses", label: "Businesses", icon: <MdBusinessCenter /> }, // updated
    { path: "/Explorers", label: "Explorers", icon: <MdPersonSearch /> },
    { path: "/AdnaDashboard", label: "Adna Dashboard", icon: <MdBarChart /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      style={{
        ...styles.sidebar,
        width: isExpanded ? "250px" : "70px",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setHoveredItem(null);
      }}
    >
      {/* Logo Section */}
      <div style={styles.logoSection}>
        <div style={styles.logoContainer}>
          <img src={unionLogo} alt="A9 Logo" style={styles.logoIcon} />
          <h2
            style={{
              ...styles.logo,
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : "0",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            A9 Admin
          </h2>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          const hovered = hoveredItem === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(active ? styles.navItemActive : {}),
                ...(hovered && !active ? styles.navItemHover : {}),
                justifyContent: isExpanded ? "flex-start" : "center",
                padding: isExpanded ? "14px 16px" : "14px 0",
              }}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span
                style={{
                  ...styles.navIcon,
                  ...(active ? styles.navIconActive : {}),
                  marginRight: isExpanded ? "12px" : "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  ...styles.navLabel,
                  opacity: isExpanded ? 1 : 0,
                  width: isExpanded ? "auto" : "0",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div
          style={{
            ...styles.footerContent,
            opacity: isExpanded ? 1 : 0,
            width: isExpanded ? "auto" : "0",
            overflow: "hidden",
          }}
        >
          <span style={styles.footerText}>v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    height: "100vh",
    background:
      "linear-gradient(180deg, rgba(20, 18, 35, 0.98) 0%, rgba(26, 26, 46, 0.98) 50%, rgba(30, 25, 45, 0.98) 100%)",
    backdropFilter: "blur(12px)",
    padding: "28px 0",
    position: "fixed" as const,
    left: 0,
    top: 0,
    borderRight: "1px solid rgba(0, 189, 214, 0.2)",
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1000,
    overflow: "hidden",
    boxShadow:
      "6px 0 24px rgba(0, 0, 0, 0.4), inset -1px 0 0 rgba(0, 189, 214, 0.1)",
  },
  logoSection: {
    padding: "0 20px 24px",
    borderBottom: "1px solid rgba(45, 45, 68, 0.5)",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
    filter: "drop-shadow(0 4px 8px rgba(0, 189, 214, 0.4))",
    transition: "transform 0.3s ease",
  },
  logo: {
    color: "#00BDD6",
    fontSize: "22px",
    fontWeight: "700",
    margin: 0,
    transition: "opacity 0.3s ease, width 0.3s ease",
    letterSpacing: "-0.5px",
    textShadow: "0 2px 8px rgba(0, 189, 214, 0.3)",
  },
  nav: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
    padding: "0 12px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    color: "rgba(240, 240, 240, 0.65)",
    textDecoration: "none",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    borderRadius: "10px",
    position: "relative" as const,
    overflow: "hidden",
    margin: "0 4px",
  },
  navItemHover: {
    backgroundColor: "rgba(41, 45, 68, 0.6)",
    color: "rgba(240, 240, 240, 1)",
    transform: "translateX(4px)",
  },
  navItemActive: {
    backgroundColor: "rgba(0, 189, 214, 0.12)",
    color: "#00BDD6",
    boxShadow:
      "0 4px 12px rgba(0, 189, 214, 0.25), inset 0 0 20px rgba(0, 189, 214, 0.08)",
    border: "1px solid rgba(0, 189, 214, 0.3)",
  },
  navIcon: {
    fontSize: "22px",
    minWidth: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition:
      "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), margin 0.25s ease",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
  },
  navIconActive: {
    transform: "scale(1.15)",
    filter: "drop-shadow(0 4px 8px rgba(0, 189, 214, 0.5))",
  },
  navLabel: {
    fontSize: "14px",
    fontWeight: "500",
    transition: "opacity 0.3s ease, width 0.3s ease",
    letterSpacing: "0.2px",
  },
  footer: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: "20px",
    borderTop: "1px solid rgba(45, 45, 68, 0.5)",
    display: "flex",
    justifyContent: "center",
  },
  footerContent: {
    transition: "opacity 0.3s ease, width 0.3s ease",
  },
  footerText: {
    fontSize: "12px",
    color: "rgba(240, 240, 240, 0.4)",
    fontWeight: "500",
  },
};

export default Sidebar;
