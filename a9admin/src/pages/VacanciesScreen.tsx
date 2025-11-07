import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserVacancies } from "../utils/fetchVacancies";

// Helper function to format date strings (not directly used here but good to keep if needed elsewhere)
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const DESCRIPTION_LIMIT = 150; // Max characters before truncating

const VacanciesScreen = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: string]: boolean;
  }>({}); // State to manage expanded descriptions

  useEffect(() => {
    const loadVacancies = async () => {
      try {
        const data = await fetchUserVacancies(userId);
        console.log("✅ Vacancies Data:", data);
        setVacancies(data);
      } catch (err) {
        console.error("Error fetching user vacancies:", err);
      } finally {
        setLoading(false);
      }
    };
    loadVacancies();
  }, [userId]);

  const filteredVacancies = vacancies.filter((v) =>
    v.vacancy_title?.toLowerCase().includes(search.toLowerCase())
  );

  // Function to toggle the expanded state for a specific vacancy
  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <h2 style={styles.pageTitle}>User Vacancies</h2>
        <p style={styles.pageText}>
          View all job vacancies created by this user. You can search, explore
          details, and check how many users applied for each job.
        </p>

        <button style={styles.backButton} onClick={() => navigate(-1)}>
          &larr; Go Back
        </button>

        {/* 🔍 Search */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search vacancies by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* 🧠 Vacancies Content */}
        {loading ? (
          <p style={styles.loadingText}>Loading vacancies...</p>
        ) : filteredVacancies.length === 0 ? (
          <p style={styles.noResults}>No vacancies found.</p>
        ) : (
          <div style={styles.cardsContainer}>
            {filteredVacancies.map((v) => {
              const isExpanded = expandedDescriptions[v.id];
              const showReadMore =
                v.vacancy_description &&
                v.vacancy_description.length > DESCRIPTION_LIMIT;
              const displayedDescription =
                showReadMore && !isExpanded
                  ? v.vacancy_description.substring(0, DESCRIPTION_LIMIT) +
                    "..."
                  : v.vacancy_description;

              return (
                <div key={v.id} style={styles.card}>
                  {/* --- Card Header --- */}
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>
                      {v.vacancy_title || "Untitled Vacancy"}
                    </h3>
                    <span
                      style={
                        v.is_hidden
                          ? styles.statusBadgeHidden
                          : styles.statusBadgeActive
                      }
                    >
                      {v.is_hidden ? "Hidden" : "Active"}
                    </span>
                  </div>

                  {/* --- Card Body --- */}
                  <div style={styles.cardBody}>
                    <p style={styles.cardField}>
                      <span style={styles.label}>💼 Industry:</span>{" "}
                      {v.industry || "N/A"}
                    </p>
                    <p style={styles.cardField}>
                      <span style={styles.label}>📍 Location:</span>{" "}
                      {v.location || "N/A"}
                    </p>
                    <p style={styles.cardField}>
                      <span style={styles.label}>💰 Salary:</span>{" "}
                      {v.vacancy_salary
                        ? `${v.vacancy_salary} ${v.salary_currency || ""}`
                        : "N/A"}
                    </p>
                  </div>

                  {/* --- Description --- */}
                  {v.vacancy_description && (
                    <div style={styles.descriptionContainer}>
                      <p style={styles.description}>{displayedDescription}</p>
                      {showReadMore && (
                        <button
                          onClick={() => toggleDescription(v.id)}
                          style={styles.readMoreButton}
                        >
                          {isExpanded ? "Show Less" : "Read More"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* --- Card Footer --- */}
                  <div style={styles.cardFooter}>
                    <span style={styles.applicantBadge}>
                      {v.applied_users?.length || 0} Applicants
                    </span>
                    <button
                      style={styles.detailsButton}
                      onClick={() => navigate(`/vacancy/${v.id}/applicants`)}
                    >
                      View Applicants
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// 💅 Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    padding: "32px",
    background: "linear-gradient(to bottom, #160F24, #24213C, #2E1F3A)",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    color: "#f0f0f0",
  },
  mainContent: {
    width: "100%",
    maxWidth: "90vw",
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
  searchContainer: {
    marginBottom: "24px",
  },
  searchInput: {
    width: "100%",
    maxWidth: "400px",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #00BDD6",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
    fontSize: "14px",
  },
  loadingText: {
    marginTop: "30px",
    fontSize: "16px",
    color: "#aaa",
  },
  noResults: {
    marginTop: "30px",
    fontSize: "16px",
    color: "#ccc",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
    marginTop: "16px",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.25)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  cardTitle: {
    color: "#00BDD6",
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
    maxWidth: "70%",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#fff",
  },
  statusBadgeActive: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: "rgba(0, 255, 157, 0.2)",
    color: "#00FF9D",
  },
  statusBadgeHidden: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: "rgba(255, 100, 100, 0.2)",
    color: "#FF6464",
  },
  cardBody: {
    marginBottom: "16px",
  },
  cardField: {
    fontSize: "14px",
    color: "#ddd",
    marginBottom: "8px",
  },
  label: {
    color: "#00BDD6",
    fontWeight: 500,
  },
  // --- NEW CONTAINER FOR DESCRIPTION + BUTTON ---
  descriptionContainer: {
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "12px",
    marginTop: "4px",
    marginBottom: "12px", // Space before footer
  },
  description: {
    fontSize: "13px",
    color: "#bbb",
    lineHeight: 1.5,
    margin: 0, // Reset default paragraph margin
  },
  // --- NEW STYLE FOR READ MORE BUTTON ---
  readMoreButton: {
    background: "none",
    border: "none",
    color: "#00BDD6",
    fontSize: "13px",
    cursor: "pointer",
    padding: "0",
    marginTop: "8px",
    display: "block", // Make button take full width to center if needed, or inline-block
    fontWeight: 600,
    textDecoration: "underline",
    transition: "color 0.2s ease",
    "&:hover": {
      color: "#00FF9D",
    },
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  applicantBadge: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#00FF9D",
  },
  detailsButton: {
    backgroundColor: "#00BDD6",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
};

export default VacanciesScreen;
