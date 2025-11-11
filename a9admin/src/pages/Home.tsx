import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MdPeople, MdBuild, MdLocalOffer } from "react-icons/md";

const Home: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const cards = [
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

  const handleMouseEnter = (index: number) => {
    setHoveredCard(index);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <h2 style={styles.gridTitle}>Welcome to your Dashboard</h2>

        <div style={styles.cardsContainer}>
          {cards.map((card, index) => (
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
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
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
  },
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  gridTitle: {
    color: "#00BDD6",
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "30px",
    borderBottom: "2px solid #3d3d5f",
    paddingBottom: "10px",
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
    position: "relative",
  },
  cardBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, rgba(0, 189, 214, 0.1) 0%, rgba(41, 45, 68, 0.8) 100%)",
    borderRadius: "16px",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
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
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    backdropFilter: "blur(5px)",
  },
} as const;

export default Home;
