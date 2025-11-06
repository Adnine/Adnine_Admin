import React from "react";
import { useNavigate } from "react-router-dom";
import explorerImg from "../assets/images/explorer.png";
import businessImg from "../assets/images/business.png";
import adnaImg from "../assets/images/adna.png"; // 🆕 Add an image for Adna Dashboard

const UsersDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => navigate(-1);

  const cards = [
    {
      title: "Explorers",
      description:
        "Browse all explorer accounts with their profile information and activity stats.",
      image: explorerImg,
      onClick: () => navigate("/Explorers"),
    },
    {
      title: "Businesses",
      description:
        "View all business accounts, including company details, job postings, and analytics.",
      image: businessImg,
      onClick: () => navigate("/Businesses"),
    },
    {
      title: "Adna Dashboard", // 🆕 New card
      description:
        "Access Adna’s admin dashboard to manage global system settings, analytics, and tools.",
      image: adnaImg,
      onClick: () => navigate("/AdnaDashboard"), // 🆕 Add route for Adna Dashboard
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <h2 style={styles.pageTitle}>Users Management</h2>
        <p style={styles.pageText}>
          Access and manage all user types — Explorers, Businesses, and the Adna
          Dashboard.
        </p>

        <button style={styles.backButton} onClick={handleGoBack}>
          &larr; Go Back
        </button>

        <div style={styles.sectionWrapper}>
          <h3 style={styles.sectionTitle}>User Categories</h3>

          <div style={styles.cardsContainer}>
            {cards.map((card, index) => (
              <div
                key={index}
                style={styles.card}
                onClick={card.onClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0, 0, 0, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(0, 0, 0, 0.25)";
                }}
              >
                <div style={styles.cardImageWrapper}>
                  <img
                    src={card.image}
                    alt={card.title}
                    style={styles.cardImage}
                  />
                </div>
                <div style={styles.cardContent}>
                  <h4 style={styles.cardTitle}>{card.title}</h4>
                  <p style={styles.cardDescription}>{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
type StyleMap = { [key: string]: React.CSSProperties };

const styles: StyleMap = {
  container: {
    minHeight: "100vh",
    padding: "32px",
    background: "linear-gradient(to bottom, #160F24, #24213C, #2E1F3A)",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    color: "#f0f0f0",
    boxSizing: "border-box",
  },
  mainContent: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  pageTitle: {
    color: "#00BDD6",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  pageText: {
    fontSize: "16px",
    lineHeight: 1.6,
    marginBottom: "24px",
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
  sectionWrapper: {
    marginTop: "32px",
  },
  sectionTitle: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "24px",
  },
  cardsContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: "32px",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    width: "340px",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.25)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
  },
  cardImageWrapper: {
    width: "100%",
    height: "180px",
    backgroundColor: "rgba(0, 189, 214, 0.12)",
    borderBottom: "1px solid rgba(0, 189, 214, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  cardContent: {
    padding: "20px 16px",
    flexGrow: 1,
  },
  cardTitle: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#ddd",
    lineHeight: 1.5,
  },
};

export default UsersDashboard;
