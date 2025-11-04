// src/pages/ToolsWithAds.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchToolsWithAds } from "../utils/fetchPendingTools";

interface ToolWithAd {
  id: string;
  tool_name: string | null;
  tool_image: string | null;
  tool_url?: string | null;
  tier?: string | null;
  start_date?: string | null; // <-- Added
  end_date?: string | null; // <-- Added
}

const ToolsWithAds: React.FC = () => {
  const navigate = useNavigate();
  const [tools, setTools] = useState<ToolWithAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchToolsWithAds();
        console.log("Fetched tools with ads:", data); // <-- log API response
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
        <h2 style={styles.pageTitle}>Promoted Tools</h2>
        <p style={styles.pageText}>
          Here you can see all tools currently having active promotions.
        </p>

        <button style={styles.backButton} onClick={handleGoBack}>
          &larr; Go Back
        </button>

        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : tools.length === 0 ? (
          <div style={styles.noResults}>No promoted tools found.</div>
        ) : (
          <div style={styles.grid}>
            {tools.map((tool) => (
              <div key={tool.id} style={styles.card}>
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
                  <div style={styles.imagePlaceholder}>No Image</div>
                )}

                <h3 style={styles.toolName}>
                  {tool.tool_name || "Unknown Tool"}
                </h3>
                {tool.tier && <p style={styles.tierText}>Tier: {tool.tier}</p>}

                {/* --- Added Date Display --- */}
                {tool.start_date && (
                  <p style={styles.dateText}>
                    Starts: {new Date(tool.start_date).toLocaleDateString()}
                  </p>
                )}
                {tool.end_date && (
                  <p style={styles.dateText}>
                    Ends: {new Date(tool.end_date).toLocaleDateString()}
                  </p>
                )}
                {/* --- End Added Date Display --- */}

                {tool.tool_url && (
                  <a
                    href={tool.tool_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    Visit Tool
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Styles (matching ToolsPage) ---
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
    marginBottom: "20px",
  },
  loading: {
    color: "#fff",
    fontSize: "16px",
    textAlign: "center",
    marginTop: "50px",
  },
  noResults: {
    textAlign: "center",
    fontSize: "16px",
    marginTop: "50px",
    color: "#aaa",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    textAlign: "center",
    transition: "transform 0.2s ease",
    cursor: "pointer",
  },
  thumbnail: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  imagePlaceholder: {
    width: "100%",
    height: "160px",
    background: "rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#aaa",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  toolName: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: "8px",
  },
  tierText: {
    color: "#00BDD6",
    fontSize: "14px",
    marginBottom: "10px",
  },
  // --- Added Style ---
  dateText: {
    color: "#ccc",
    fontSize: "13px",
    margin: "4px 0",
  },
  // --- End Added Style ---
  link: {
    color: "#00BDD6",
    textDecoration: "none",
    fontWeight: 500,
  },
};

export default ToolsWithAds;
