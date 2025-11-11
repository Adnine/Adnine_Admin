import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchToolsWithAds } from "../utils/fetchPendingTools";
import {
  MdArrowBack,
  MdLocalOffer,
  MdCalendarToday,
  MdLink,
  MdImageNotSupported,
} from "react-icons/md";

interface ToolWithAd {
  id: string;
  tool_name: string | null;
  tool_image: string | null;
  tool_url?: string | null;
  tier?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

const ToolsWithAds: React.FC = () => {
  const navigate = useNavigate();
  const [tools, setTools] = useState<ToolWithAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchToolsWithAds();
        console.log("Fetched tools with ads:", data);
        if (Array.isArray(data)) {
          setTools(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setTools(data.data);
        } else {
          console.warn("Unexpected API response structure:", data);
          setTools([]);
        }
      } catch (err) {
        console.error("Failed to fetch tools with ads:", err);
        setTools([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* Back Button */}
        <button style={styles.backButton} onClick={handleGoBack}>
          <MdArrowBack size={18} style={styles.buttonIcon} />
          Go Back
        </button>

        {/* Header Section */}
        <div style={styles.headerSection}>
          <h2 style={styles.pageTitle}>
            <MdLocalOffer size={28} style={styles.titleIcon} />
            Promoted Tools
          </h2>
          <p style={styles.pageText}>
            Here you can see all tools currently having active promotions.
          </p>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading promoted tools...</div>
        ) : tools.length === 0 ? (
          <div style={styles.noResults}>
            <MdLocalOffer size={48} style={styles.noResultsIcon} />
            <p>No promoted tools found.</p>
          </div>
        ) : (
          <div style={styles.cardsContainer}>
            {tools.map((tool) => (
              <div
                key={tool.id}
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(0, 189, 214, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(0,0,0,0.4)";
                }}
              >
                {/* Image Section */}
                <div style={styles.imageContainer}>
                  {tool.tool_image ? (
                    <img
                      src={tool.tool_image}
                      alt={tool.tool_name || "Tool"}
                      style={styles.thumbnail}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/200x150?text=No+Image";
                      }}
                    />
                  ) : (
                    <div style={styles.imagePlaceholder}>
                      <MdImageNotSupported size={32} />
                      <span>No Image</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div style={styles.cardContent}>
                  <h3 style={styles.toolName}>
                    {tool.tool_name || "Unknown Tool"}
                  </h3>

                  {tool.tier && (
                    <div style={styles.tierBadge}>
                      <MdLocalOffer size={14} style={styles.badgeIcon} />
                      {tool.tier}
                    </div>
                  )}

                  {/* Date Information */}
                  <div style={styles.dateSection}>
                    {tool.start_date && (
                      <div style={styles.dateItem}>
                        <MdCalendarToday size={14} style={styles.dateIcon} />
                        <span style={styles.dateText}>
                          Starts:{" "}
                          {new Date(tool.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {tool.end_date && (
                      <div style={styles.dateItem}>
                        <MdCalendarToday size={14} style={styles.dateIcon} />
                        <span style={styles.dateText}>
                          Ends: {new Date(tool.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {tool.tool_url && (
                    <a
                      href={tool.tool_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.linkButton}
                    >
                      <MdLink size={16} style={styles.buttonIcon} />
                      Visit Tool
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
type StyleMap = { [key: string]: React.CSSProperties };

const styles: StyleMap = {
  container: {
    minHeight: "100vh",
    padding: "32px",
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
  headerSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "32px",
    border: "1px solid rgba(0, 189, 214, 0.2)",
    backdropFilter: "blur(10px)",
  },
  pageTitle: {
    color: "#00BDD6",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  titleIcon: {
    marginRight: "8px",
  },
  pageText: {
    fontSize: "16px",
    lineHeight: 1.6,
    color: "#ccc",
    margin: 0,
  },
  loading: {
    color: "#aaa",
    fontSize: "16px",
    textAlign: "center",
    padding: "60px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  noResults: {
    textAlign: "center",
    padding: "60px",
    color: "#aaa",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  noResultsIcon: {
    color: "#00BDD6",
    marginBottom: "16px",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
    transition: "transform 0.4s ease, box-shadow 0.4s ease",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
  },
  imageContainer: {
    width: "100%",
    height: "200px",
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 189, 214, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#00BDD6",
    gap: "8px",
  },
  cardContent: {
    padding: "20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  toolName: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
    margin: 0,
    lineHeight: 1.4,
  },
  tierBadge: {
    backgroundColor: "rgba(0, 189, 214, 0.2)",
    color: "#00BDD6",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    alignSelf: "flex-start",
    border: "1px solid rgba(0, 189, 214, 0.3)",
  },
  badgeIcon: {
    marginRight: "2px",
  },
  dateSection: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "8px",
  },
  dateItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dateIcon: {
    color: "#00BDD6",
    flexShrink: 0,
  },
  dateText: {
    fontSize: "13px",
    color: "#ccc",
    lineHeight: 1.4,
  },
  linkButton: {
    backgroundColor: "rgba(0, 189, 214, 0.1)",
    color: "#00BDD6",
    border: "2px solid #00BDD6",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "all 0.3s ease",
    marginTop: "auto",
    textAlign: "center",
  },
};

// Add hover effects
const addHoverEffects = `
  .card:hover .thumbnail {
    transform: scale(1.05);
  }
  
  .card:hover .link-button {
    background-color: rgba(0, 189, 214, 0.2);
    transform: translateY(-2px);
  }
`;

// Inject the CSS for hover effects
if (typeof document !== "undefined") {
  const styleSheet = document.styleSheets[0];
  if (styleSheet) {
    try {
      styleSheet.insertRule(addHoverEffects, styleSheet.cssRules.length);
    } catch (e) {
      console.log("Error injecting CSS:", e);
    }
  }
}

export default ToolsWithAds;
