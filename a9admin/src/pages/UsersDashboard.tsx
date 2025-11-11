import React from "react";
import { useNavigate } from "react-router-dom";
// Using the image imports as requested.
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
        "Access Adna's admin dashboard to manage global system settings, analytics, and tools.",
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

        <button
          style={styles.backButton}
          onClick={handleGoBack}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
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
                    "0 20px 40px rgba(0, 189, 214, 0.3)";
                  const overlay = e.currentTarget.querySelector(
                    ".card-overlay"
                  ) as HTMLElement;
                  if (overlay) {
                    overlay.style.backgroundColor = "rgba(15, 12, 29, 0.85)";
                  }
                  const image = e.currentTarget.querySelector(
                    ".card-image"
                  ) as HTMLElement;
                  if (image) {
                    image.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(0,0,0,0.4)";
                  const overlay = e.currentTarget.querySelector(
                    ".card-overlay"
                  ) as HTMLElement;
                  if (overlay) {
                    overlay.style.backgroundColor = "rgba(15, 12, 29, 0.75)";
                  }
                  const image = e.currentTarget.querySelector(
                    ".card-image"
                  ) as HTMLElement;
                  if (image) {
                    image.style.transform = "scale(1)";
                  }
                }}
              >
                <div style={styles.cardImageContainer}>
                  <img
                    src={card.image}
                    alt={card.title}
                    style={styles.cardImage}
                    className="card-image"
                  />
                  <div style={styles.cardOverlay} className="card-overlay">
                    <div style={styles.cardContent}>
                      <h4 style={styles.cardTitle}>{card.title}</h4>
                      <p style={styles.cardDescription}>{card.description}</p>
                      <div style={styles.actionButton}>View Details</div>
                    </div>
                  </div>
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
    padding: "0px 20px",
    background:
      "linear-gradient(135deg, #0f0c1d 0%, #1a1635 50%, #251d3a 100%)",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
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
    fontSize: "28px",
    fontWeight: "600",
    marginBottom: "10px",
  },
  pageText: {
    fontSize: "16px",
    lineHeight: 1.6,
    marginBottom: "24px",
    color: "#ccc",
  },
  backButton: {
    backgroundColor: "#8050E6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  sectionWrapper: {
    marginTop: "40px",
  },
  sectionTitle: {
    color: "#00BDD6",
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "24px",
    borderBottom: "2px solid #3d3d5f",
    paddingBottom: "10px",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "30px",
  },
  card: {
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
    transition: "transform 0.4s ease, box-shadow 0.4s ease",
    height: "400px",
    position: "relative",
  },
  cardImageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    borderRadius: "16px",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 12, 29, 0.75)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
    textAlign: "center",
    transition: "background-color 0.4s ease, backdrop-filter 0.4s ease",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  cardContent: {
    width: "100%",
    maxWidth: "280px",
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
    backgroundColor: "rgba(0, 189, 214, 0.2)",
    color: "#00BDD6",
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
};

// Add hover effects for the action button
const addButtonHoverEffects = `
  .card:hover .action-button {
    background-color: rgba(0, 189, 214, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 189, 214, 0.3);
  }
`;

// Inject the CSS for button hover effects
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(addButtonHoverEffects, styleSheet.cssRules.length);

export default UsersDashboard;
